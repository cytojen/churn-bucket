import { supabase } from "./supabase";
import { CustomerData, PartnerDisplay, Alert, KPISummary } from "./types";
import { RISK_THRESHOLDS, CUSTOMER_STATUS, USAGE_THRESHOLDS, LOGIN_THRESHOLDS } from "./constants";

/**
 * Fetch all customer data from Supabase
 */
export async function fetchCustomerData(): Promise<CustomerData[]> {
  console.log("Calling Supabase API...");
  
  const { data, error } = await supabase
    .from("data")
    .select("*")
    .order("churn_risk_score", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    throw error;
  }

  console.log(`Supabase returned ${data?.length || 0} rows`);
  if (data && data.length > 0) {
    console.log("First row structure:", Object.keys(data[0]));
  }

  return data || [];
}

/**
 * Calculate days since last login
 */
function getDaysSinceLogin(lastLoginDate: string | null): number {
  if (!lastLoginDate) return 999;
  
  const lastLogin = new Date(lastLoginDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastLogin.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Get risk color based on risk score
 */
function getRiskColor(riskScore: number | null): string {
  if (riskScore === null) return "text-white/60";
  if (riskScore >= RISK_THRESHOLDS.AT_RISK) return "text-red-500";
  if (riskScore >= RISK_THRESHOLDS.CHAMPION) return "text-yellow-500";
  return "text-green-500";
}

/**
 * Get usage color based on usage ratio
 */
function getUsageColor(usageRatio: number | null): string {
  if (usageRatio === null) return "bg-white/20";
  if (usageRatio < USAGE_THRESHOLDS.MEDIUM) return "bg-red-500";
  if (usageRatio < USAGE_THRESHOLDS.HIGH) return "bg-yellow-500";
  return "bg-green-500";
}

/**
 * Get customer status based on risk score or use existing classification
 */
function getCustomerStatus(customer: CustomerData): string {
  // Use the status_classification from the database if available
  if (customer.status_classification) {
    return customer.status_classification;
  }
  
  // Fallback to calculating from risk score
  const riskScore = customer.churn_risk_score || 0;
  if (riskScore < RISK_THRESHOLDS.CHAMPION) return CUSTOMER_STATUS.CHAMPION;
  if (riskScore < RISK_THRESHOLDS.AT_RISK) return CUSTOMER_STATUS.AT_RISK;
  return CUSTOMER_STATUS.CRITICAL;
}

/**
 * Get login color based on days since last login
 */
function getLoginColor(days: number): string {
  if (days >= LOGIN_THRESHOLDS.STALE) return "text-red-500";
  if (days >= LOGIN_THRESHOLDS.MODERATE) return "text-yellow-500";
  return "text-white/60";
}

/**
 * Transform customer data to partner display format
 */
export function transformToPartnerDisplay(customers: CustomerData[]): PartnerDisplay[] {
  return customers.map((customer) => {
    const daysSinceLogin = getDaysSinceLogin(customer.last_login_date);
    const riskScore = (customer.churn_risk_score || 0) * 100; // Convert to percentage
    const usageRatio = customer.monthly_active_users && customer.user_count
      ? customer.monthly_active_users / customer.user_count
      : 0;

    return {
      customerId: customer.customer_id,
      name: customer.customer_name || "Unknown",
      plan: customer.plan_type || "N/A",
      riskScore: riskScore,
      riskColor: getRiskColor(riskScore),
      status: getCustomerStatus(customer),
      lastLogin: daysSinceLogin >= 999 ? "Never" : `${daysSinceLogin} days`,
      loginColor: getLoginColor(daysSinceLogin),
      mrr: customer.monthly_fee ? `$${customer.monthly_fee.toLocaleString()}` : "$0",
      usage: usageRatio,
      usageColor: getUsageColor(usageRatio),
      usagePercent: `${Math.round(usageRatio * 100)}%`,
    };
  });
}

/**
 * Generate alerts based on customer data
 */
export function generateAlerts(customers: CustomerData[]): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();

  customers.forEach((customer) => {
    const daysSinceLogin = getDaysSinceLogin(customer.last_login_date);
    const riskScore = (customer.churn_risk_score || 0) * 100; // Convert to percentage
    const usageRatio = customer.monthly_active_users && customer.user_count
      ? customer.monthly_active_users / customer.user_count
      : 0;
    
    const status = customer.status_classification;

    // Critical: customers with "Critical" status classification
    if (status === "Critical") {
      alerts.push({
        id: `${customer.customer_id}-critical`,
        company: customer.customer_name || "Unknown",
        tag: "Critical",
        tagStyle: "bg-red-500/15 text-red-500 border border-red-500/20",
        title: "High churn risk detected",
        subtitle: `Risk score: ${riskScore.toFixed(1)}% | Last login: ${daysSinceLogin} days ago`,
        time: getRelativeTime(customer.last_login_date),
        icon: "/icons/overview/recentAlerts/alert-red.svg",
        riskScore: riskScore,
      });
    }

    // Warning: customers with "At-Risk" status classification
    if (status === "At-Risk") {
      alerts.push({
        id: `${customer.customer_id}-warning`,
        company: customer.customer_name || "Unknown",
        tag: "Warning",
        tagStyle: "bg-yellow-500/15 text-yellow-500 border border-yellow-500/20",
        title: "Customer at risk of churning",
        subtitle: `Risk score: ${riskScore.toFixed(1)}% | Usage: ${(usageRatio * 100).toFixed(0)}%`,
        time: getRelativeTime(customer.last_login_date),
        icon: "/icons/overview/recentAlerts/alert-yellow.svg",
        riskScore: riskScore,
      });
    }
  });

  // Sort by risk score and return all alerts
  return alerts
    .sort((a, b) => b.riskScore - a.riskScore);
}

/**
 * Get relative time string
 */
function getRelativeTime(dateString: string | null): string {
  if (!dateString) return "Unknown";

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

/**
 * Calculate KPI summary
 */
export function calculateKPISummary(customers: CustomerData[]): KPISummary {
  // Convert risk scores from 0-1 to 0-100 percentage
  const champions = customers.filter((c) => ((c.churn_risk_score || 0) * 100) < 50).length;
  const atRisk = customers.filter(
    (c) => {
      const score = (c.churn_risk_score || 0) * 100;
      return score >= 50 && score < 75;
    }
  ).length;
  const critical = customers.filter((c) => ((c.churn_risk_score || 0) * 100) >= 75).length;

  const totalRevenue = customers.reduce((sum, c) => sum + (c.monthly_fee || 0), 0);
  const revenueAtRisk = customers
    .filter((c) => ((c.churn_risk_score || 0) * 100) >= 50)
    .reduce((sum, c) => sum + (c.monthly_fee || 0), 0);

  return {
    champions,
    atRisk,
    critical,
    totalRevenue,
    revenueAtRisk,
  };
}

/**
 * Filter customers by status
 */
export function filterCustomersByStatus(
  customers: CustomerData[],
  status: "all" | "champions" | "at-risk" | "critical"
): CustomerData[] {
  if (status === "all") return customers;

  return customers.filter((customer) => {
    const riskScore = (customer.churn_risk_score || 0) * 100; // Convert to percentage
    switch (status) {
      case "champions":
        return riskScore < 50;
      case "at-risk":
        return riskScore >= 50 && riskScore < 75;
      case "critical":
        return riskScore >= 75;
      default:
        return true;
    }
  });
}

/**
 * Search customers by name
 */
export function searchCustomers(customers: CustomerData[], query: string): CustomerData[] {
  if (!query.trim()) return customers;

  const lowerQuery = query.toLowerCase();
  return customers.filter(
    (customer) =>
      customer.customer_name?.toLowerCase().includes(lowerQuery) ||
      customer.customer_id.toLowerCase().includes(lowerQuery) ||
      customer.industry?.toLowerCase().includes(lowerQuery)
  );
}
