"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchCustomerData, transformToPartnerDisplay, generateAlerts, calculateKPISummary } from "@/lib/dataUtils";
import { CustomerData, PartnerDisplay, Alert, KPISummary } from "@/lib/types";
import { RevenueAtRisk } from "@/components/RevenueAtRisk";
import { PartnerSegmentation } from "@/components/PartnerSegmentation";

export default function InsightsPage() {
  const router = useRouter();
  const [allCustomers, setAllCustomers] = useState<CustomerData[]>([]);
  const [partners, setPartners] = useState<PartnerDisplay[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<PartnerDisplay[]>([]);
  const [displayedPartners, setDisplayedPartners] = useState<PartnerDisplay[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [kpiData, setKpiData] = useState<KPISummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("All Partners");
  const [displayCount, setDisplayCount] = useState<number>(7);
  const [revenueData, setRevenueData] = useState<{ champion: number; atRisk: number; critical: number }>({ champion: 0, atRisk: 0, critical: 0 });
  const [planData, setPlanData] = useState<Array<{ plan: string; customers: number; churnRate: number }>>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching customer data from Supabase...");
      const customers = await fetchCustomerData();
      console.log(`Received ${customers.length} customers from Supabase`);
      console.log("Sample customer:", customers[0]);
      
      setAllCustomers(customers);
      
      // Transform all customers to partner display format
      const allPartners = transformToPartnerDisplay(customers);
      
      console.log(`Total partners: ${allPartners.length}`);
      const champions = allPartners.filter(p => p.status === "Champion");
      const atRisk = allPartners.filter(p => p.status === "At-Risk");
      const critical = allPartners.filter(p => p.status === "Critical");
      console.log(`Status distribution: Champions=${champions.length}, At-Risk=${atRisk.length}, Critical=${critical.length}`);
      
      setPartners(allPartners);
      setFilteredPartners(allPartners);
      setDisplayedPartners(allPartners.slice(0, 7)); // Initially show 7
      setStatusFilter("All Partners");
      setDisplayCount(7);
      
      // Take top 6 alerts
      const allAlerts = generateAlerts(customers);
      console.log(`Generated ${allAlerts.length} alerts`);
      setAlerts(allAlerts.slice(0, 6));
      
      // Calculate KPIs
      const kpis = calculateKPISummary(customers);
      console.log("KPI Summary:", kpis);
      setKpiData(kpis);
      
      // Calculate revenue by tier
      const championRevenue = customers
        .filter(c => {
          const status = c.status_classification || (c.churn_risk_score && c.churn_risk_score < 0.5 ? "Champion" : c.churn_risk_score && c.churn_risk_score < 0.75 ? "At-Risk" : "Critical");
          return status === "Champion";
        })
        .reduce((sum, c) => sum + (c.monthly_fee || 0), 0);
      
      const atRiskRevenue = customers
        .filter(c => {
          const status = c.status_classification || (c.churn_risk_score && c.churn_risk_score < 0.5 ? "Champion" : c.churn_risk_score && c.churn_risk_score < 0.75 ? "At-Risk" : "Critical");
          return status === "At-Risk";
        })
        .reduce((sum, c) => sum + (c.monthly_fee || 0), 0);
      
      const criticalRevenue = customers
        .filter(c => {
          const status = c.status_classification || (c.churn_risk_score && c.churn_risk_score < 0.5 ? "Champion" : c.churn_risk_score && c.churn_risk_score < 0.75 ? "At-Risk" : "Critical");
          return status === "Critical";
        })
        .reduce((sum, c) => sum + (c.monthly_fee || 0), 0);
      
      setRevenueData({ champion: championRevenue, atRisk: atRiskRevenue, critical: criticalRevenue });
      
      // Calculate plan distribution and churn rates
      const planMap = new Map<string, { count: number; totalRisk: number }>();
      
      customers.forEach(c => {
        const plan = c.plan_type || "Unknown";
        const existing = planMap.get(plan) || { count: 0, totalRisk: 0 };
        planMap.set(plan, {
          count: existing.count + 1,
          totalRisk: existing.totalRisk + ((c.churn_risk_score || 0) * 100)
        });
      });
      
      const planDataArray = Array.from(planMap.entries())
        .map(([plan, data]) => ({
          plan,
          customers: data.count,
          churnRate: data.totalRisk / data.count
        }))
        .sort((a, b) => b.customers - a.customers);
      
      setPlanData(planDataArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleFilterChange = (filter: string) => {
    console.log("=== FILTER DEBUG ===");
    console.log("Selected filter:", filter);
    console.log("Total partners:", partners.length);
    
    setStatusFilter(filter);
    setDisplayCount(7); // Reset to 7 when filter changes
    
    let filtered: PartnerDisplay[];
    
    if (filter === "All Partners") {
      console.log("Showing all partners");
      filtered = partners;
    } else {
      // Try exact match first
      filtered = partners.filter(p => p.status === filter);
      
      // If no exact match, try case-insensitive
      if (filtered.length === 0) {
        filtered = partners.filter(p => 
          p.status.toLowerCase() === filter.toLowerCase()
        );
      }
      
      console.log(`Filtered to ${filtered.length} partners with status "${filter}"`);
    }
    
    setFilteredPartners(filtered);
    setDisplayedPartners(filtered.slice(0, 7)); // Show first 7
  };

  const handleLoadMore = () => {
    const newCount = displayCount + 7;
    setDisplayCount(newCount);
    setDisplayedPartners(filteredPartners.slice(0, newCount));
  };

  const handleExport = () => {
    const csv = [
      ["Partner", "Plan", "Risk %", "Status", "Last Login", "MRR", "Usage"],
      ...filteredPartners.map(p => [
        p.name,
        p.plan,
        Math.round(p.riskScore).toString(),
        p.status,
        p.lastLogin,
        p.mrr,
        p.usagePercent
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `partners-${statusFilter.toLowerCase().replace(" ", "-")}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const statusStyles: Record<string, string> = {
    Critical: "bg-red-500/15 text-red-400 border-red-500/30",
    "At-Risk": "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    Champion: "bg-green-500/15 text-green-400 border-green-500/30",
  };

  const kpis = kpiData ? [
    {
      title: "Champions",
      value: kpiData.champions.toString(),
      percent: `(${((kpiData.champions / allCustomers.length) * 100).toFixed(1)}%)`,
      subtitle: "Low churn risk",
      trend: "/icons/overview/trend-up.svg",
      color: "text-green-400",
      icon: "/icons/overview/user-green.svg",
      bg: "bg-green-500/10",
    },
    {
      title: "At-Risk",
      value: kpiData.atRisk.toString(),
      percent: `(${((kpiData.atRisk / allCustomers.length) * 100).toFixed(1)}%)`,
      subtitle: "Moderate risk",
      trend: "/icons/overview/trend-up.svg",
      color: "text-yellow-400",
      icon: "/icons/overview/user-yellow.svg",
      bg: "bg-yellow-500/10",
    },
    {
      title: "Critical",
      value: kpiData.critical.toString(),
      percent: `(${((kpiData.critical / allCustomers.length) * 100).toFixed(1)}%)`,
      subtitle: "High churn risk",
      trend: "/icons/overview/trend-down.svg",
      color: "text-red-400",
      icon: "/icons/overview/user-red.svg",
      bg: "bg-red-500/10",
    },
    {
      title: "Revenue at Risk",
      value: `$${(kpiData.revenueAtRisk / 1000).toFixed(0)}K`,
      percent: "(MRR)",
      subtitle: `${((kpiData.revenueAtRisk / kpiData.totalRevenue) * 100).toFixed(1)}% of total`,
      trend: "/icons/overview/trend-up.svg",
      color: "text-red-400",
      icon: "/icons/overview/user-red.svg",
      bg: "bg-red-500/10",
    },
  ] : [];

  if (loading) {
    return (
      <main className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-white/60">Loading insights...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 space-y-6">
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
          <p className="font-medium">Error loading data</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={loadData}
            className="mt-3 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition text-sm"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">

      <div className="mt-12"></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div
            key={kpi.title}
             className="p-5 rounded-2xl bg-black/40 border border-white/5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/60 text-sm">{kpi.title}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.bg}`}>
                <img src={kpi.icon} className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-semibold ${kpi.color}`}>
                {kpi.value}
              </span>
              <span className="text-xs text-white/40">{kpi.percent}</span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <img src={kpi.trend} className="w-4 h-4" />
              <span className="text-xs text-white/40">{kpi.subtitle}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <RevenueAtRisk 
          championRevenue={revenueData.champion}
          atRiskRevenue={revenueData.atRisk}
          criticalRevenue={revenueData.critical}
        />

        <PartnerSegmentation planData={planData} />

        <div className="p-5 rounded-2xl bg-black/70 border border-white/5 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-medium">Recent Alerts</h3>
            <button 
              onClick={() => router.push("/overview/alerts")}
              className="text-xs text-white/40 hover:text-white/60 cursor-pointer transition"
            >
              View all →
            </button>
          </div>

          <div 
            className="space-y-3 flex-1 overflow-y-auto no-scrollbar" 
            style={{ maxHeight: "360px" }}
          >
            {alerts.length === 0 ? (
              <div className="py-6 text-center text-white/40 text-sm">
                No recent alerts
              </div>
            ) : (
              alerts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 p-3
                             rounded-xl bg-black/30 border border-white/5"
                >
                  <img src={a.icon} className="w-4 h-4 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-white">{a.company}</p>
                    <p className="text-xs text-white/40">{a.title}</p>
                  </div>
                  <span className="text-xs text-white/30">{a.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-black/80 border border-white/5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-medium">Partners</h3>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/overview/partners")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                         bg-emerald-500/20 border border-emerald-500/30
                         text-sm text-emerald-400 hover:bg-emerald-500/30 transition cursor-pointer"
            >
              View All
            </button>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="appearance-none pl-9 pr-8 py-1.5 rounded-lg
                           bg-black/50 border border-white/10
                           text-sm text-white/80 outline-none cursor-pointer"
              >
                <option value="All Partners">All Partners</option>
                <option value="Champion">Champion</option>
                <option value="At-Risk">At-Risk</option>
                <option value="Critical">Critical</option>
              </select>
              <img
                src="/icons/overview/partners/filter.svg"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">
                ▼
              </span>
            </div>

            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                         bg-black/50 border border-white/10
                         text-sm text-white/80 hover:bg-black/70 transition cursor-pointer"
            >
              <img src="/icons/overview/partners/export.svg" className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="text-white/40">
            <tr className="text-left border-b border-white/5">
              <th className="py-3 font-medium">Partner</th>
              <th className="py-3 font-medium">Plan</th>
              <th className="py-3 font-medium">Risk</th>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Last Login</th>
              <th className="py-3 font-medium">MRR</th>
              <th className="py-3 font-medium">Usage</th>
              <th className="py-3 font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {displayedPartners.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-white/40">
                  No partner data available
                </td>
              </tr>
            ) : (
              displayedPartners.map((p) => (
                <tr key={p.customerId} className="border-b border-white/5 text-white/80 hover:bg-white/5 transition">
                  <td className="py-3 font-medium">{p.name}</td>

                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs border border-white/5">
                      {p.plan}
                    </span>
                  </td>

                  <td className={`py-3 font-medium ${p.riskColor}`}>{Math.round(p.riskScore)}%</td>

                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs border
                                  ${statusStyles[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td className={`py-3 ${p.loginColor}`}>{p.lastLogin}</td>

                  <td className="py-3">{p.mrr}</td>

                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${p.usageColor}`}
                          style={{ width: p.usagePercent }}
                        />
                      </div>
                      <span className="text-xs text-white/40">{p.usagePercent}</span>
                    </div>
                  </td>

                  <td className="py-3">
                    <button className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition">
                      <img 
                        src="/icons/overview/partners/view.svg" 
                        className="w-4 h-4 opacity-70" 
                        alt="view"
                      />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {displayedPartners.length < filteredPartners.length && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleLoadMore}
              className="px-6 py-2.5 rounded-lg bg-white/5 border border-white/10
                         text-sm text-white/80 hover:bg-white/10 hover:border-white/20
                         transition cursor-pointer"
            >
              Load More ({filteredPartners.length - displayedPartners.length} remaining)
            </button>
          </div>
        )}
      </div>

    </main>
  );
}