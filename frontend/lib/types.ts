// TypeScript types matching the Supabase data table schema

export interface CustomerData {
  customer_id: string;
  customer_name: string | null;
  industry: string | null;
  account_manager: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  subscription_status: string | null;
  plan_type: string | null;
  monthly_fee: number | null;
  user_count: number | null;
  last_login_date: string | null;
  monthly_active_users: number | null;
  feature_usage_score: number | null;
  retention_rate_6m: number | null;
  retention_rate_12m: number | null;
  churn_risk_score: number | null;
  last_success_touch_date: string | null;
  notes: string | null;
  prediction: boolean | null;
  status_classification: string | null;
}

export interface Database {
  public: {
    Tables: {
      data: {
        Row: CustomerData;
        Insert: CustomerData;
        Update: Partial<CustomerData>;
      };
    };
  };
}

// Derived types for UI components
export interface PartnerDisplay {
  customerId: string;
  name: string;
  plan: string;
  riskScore: number;
  riskColor: string;
  status: string;
  lastLogin: string;
  loginColor: string;
  mrr: string;
  usage: number;
  usageColor: string;
  usagePercent: string;
}

export interface Alert {
  id: string;
  company: string;
  tag: string;
  tagStyle: string;
  title: string;
  subtitle: string;
  time: string;
  icon: string;
  riskScore: number;
}

export interface KPISummary {
  champions: number;
  atRisk: number;
  critical: number;
  totalRevenue: number;
  revenueAtRisk: number;
}
