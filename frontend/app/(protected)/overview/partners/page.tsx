"use client";

import { useState, useEffect } from "react";
import { fetchCustomerData, transformToPartnerDisplay, filterCustomersByStatus, searchCustomers } from "@/lib/dataUtils";
import { CustomerData, PartnerDisplay } from "@/lib/types";

export default function PartnersPage() {
  const [allCustomers, setAllCustomers] = useState<CustomerData[]>([]);
  const [partners, setPartners] = useState<PartnerDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "champions" | "at-risk" | "critical">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Apply filters and search whenever they change
    let filtered = filterCustomersByStatus(allCustomers, filterStatus);
    filtered = searchCustomers(filtered, searchQuery);
    setPartners(transformToPartnerDisplay(filtered));
  }, [allCustomers, filterStatus, searchQuery]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Partners page: Fetching customer data from Supabase...");
      const data = await fetchCustomerData();
      console.log(`Partners page: Received ${data.length} customers`);
      console.log("Sample customer data:", data[0]);
      
      setAllCustomers(data);
      const transformed = transformToPartnerDisplay(data);
      console.log("Transformed partners:", transformed.slice(0, 3));
      setPartners(transformed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      console.error("Partners page error:", err);
    } finally {
      setLoading(false);
    }
  }

  const statusStyles: Record<string, string> = {
    Critical: "bg-red-500/10 text-red-500 border border-red-500/20",
    "At-Risk": "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
    Champion: "bg-green-500/10 text-green-500 border border-green-500/20",
  };

  if (loading) {
    return (
      <main className="p-8 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-white/60">Loading partners data...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-8 w-full">
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
    <main className="p-8 w-full">
      {/* 1. SEARCH BAR SECTION */}
      <div className="mb-6">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0A0A0A] border border-white/10 w-full">
          <img src="/icons/search.svg" className="w-5 h-5 opacity-50" alt="search" />
          <input
            type="text"
            placeholder="Search by customer name, ID, or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-sm text-white placeholder-white/30 w-full"
          />
        </div>
      </div>

      {/* 2. PARTNERS TABLE */}
      <div className="p-5 rounded-2xl bg-black/40 border border-white/5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-medium">Partners</h3>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="appearance-none pl-9 pr-8 py-1.5 rounded-lg
                           bg-black/50 border border-white/10
                           text-sm text-white/80 outline-none"
              >
                <option value="all">All Partners</option>
                <option value="champions">Champions</option>
                <option value="at-risk">At-Risk</option>
                <option value="critical">Critical</option>
              </select>
              <img
                src="/icons/overview/partners/filter.svg"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">
                ▼
              </span>
            </div>

            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                               bg-black/50 border border-white/10
                               text-sm text-white/80 hover:bg-black/70 transition">
              <img src="/icons/overview/partners/export.svg" className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="text-white/40">
            <tr className="text-left border-b border-white/5">
              <th className="py-3 font-medium">Customer</th>
              <th className="py-3 font-medium">Plan</th>
              <th className="py-3 font-medium">Risk Score</th>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Last Login</th>
              <th className="py-3 font-medium">MRR</th>
              <th className="py-3 font-medium">Usage</th>
              <th className="py-3 font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {partners.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-white/40">
                  No partners found matching your criteria
                </td>
              </tr>
            ) : (
              partners.map((p) => (
                <tr key={p.customerId} className="border-b border-white/5 text-white/80 hover:bg-white/5 transition">
                  <td className="py-3 font-medium">{p.name}</td>

                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs border border-white/5">
                      {p.plan}
                    </span>
                  </td>

                  <td className={`py-3 font-medium ${p.riskColor}`}>
                    {Math.round(p.riskScore)}%
                  </td>

                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs border
                                  ${statusStyles[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td className={`py-3 ${p.loginColor}`}>
                    {p.lastLogin}
                  </td>

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
      </div>
    </main>
  );
}