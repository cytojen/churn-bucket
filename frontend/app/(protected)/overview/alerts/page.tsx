"use client";

import { useState, useEffect } from "react";
import { fetchCustomerData, generateAlerts } from "@/lib/dataUtils";
import { Alert } from "@/lib/types";

export default function AlertCenterPage() {
  const [alertsList, setAlertsList] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"All" | "Critical" | "Warning">("All");

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      setLoading(true);
      setError(null);
      const customers = await fetchCustomerData();
      const alerts = generateAlerts(customers);
      setAlertsList(alerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load alerts");
      console.error("Error loading alerts:", err);
    } finally {
      setLoading(false);
    }
  }

  const criticalCount = alertsList.filter(a => a.tag === "Critical").length;
  const warningCount = alertsList.filter(a => a.tag === "Warning").length;
  
  // Filter alerts based on active filter
  const filteredAlerts = activeFilter === "All" 
    ? alertsList 
    : alertsList.filter(a => a.tag === activeFilter);
  
  const summaryCards = [
    {
      title: "Critical Alerts",
      count: criticalCount,
      icon: "/icons/overview/recentAlerts/alert-red.svg", 
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      countColor: "text-red-500"
    },
    {
      title: "Warnings",
      count: warningCount,
      icon: "/icons/overview/recentAlerts/alert-yellow.svg",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      countColor: "text-yellow-500"
    }
  ];

  if (loading) {
    return (
      <main className="p-6 space-y-8 w-full text-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-white/60">Loading alerts...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 space-y-8 w-full text-white">
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
          <p className="font-medium">Error loading alerts</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={loadAlerts}
            className="mt-3 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition text-sm"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-8 w-full text-white">

      {/* 1. SEARCH BAR */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0A0A0A] border border-white/10 w-full">
        <img src="/icons/search.svg" className="w-5 h-5 opacity-50" alt="search" />
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent outline-none text-sm text-white placeholder-white/30 w-full"
        />
      </div>

      {/* 2. PAGE HEADER */}
      <div>
        <h1 className="text-xl font-bold mb-1">Alert Center</h1>
        <p className="text-sm text-gray-400">Monitor and respond to customer health alerts</p>
      </div>

      {/* 3. SUMMARY CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {summaryCards.map((card) => (
          <div 
            key={card.title} 
            className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/10 flex items-center gap-5"
          >

            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.bg} ${card.border}`}>
              <img src={card.icon} className="w-6 h-6" alt="" />
            </div>
     
            <div>
               <div className="text-xs font-medium text-gray-400 mb-0.5">{card.title}</div>
               <div className={`text-2xl font-bold ${card.countColor}`}>{card.count}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/10">
        
        <h2 className="text-base font-semibold text-white mb-6">All Alerts</h2>

        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => setActiveFilter("All")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
              activeFilter === "All" 
                ? "bg-white/10 text-white border border-white/10" 
                : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
            }`}
          >
            All ({alertsList.length})
          </button>
          <button 
            onClick={() => setActiveFilter("Critical")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
              activeFilter === "Critical" 
                ? "bg-white/10 text-white border border-white/10" 
                : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
            }`}
          >
            Critical ({criticalCount})
          </button>
          <button 
            onClick={() => setActiveFilter("Warning")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
              activeFilter === "Warning" 
                ? "bg-white/10 text-white border border-white/10" 
                : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
            }`}
          >
            Warning ({warningCount})
          </button>
        </div>

        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center text-white/40">
              {activeFilter === "All" ? "No alerts at this time" : `No ${activeFilter.toLowerCase()} alerts at this time`}
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-white/[0.04] transition"
              >
           
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <img src={alert.icon} className="w-5 h-5" alt="status" />
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-sm text-white">{alert.company}</span>
                      <span className={`px-2 py-[2px] rounded text-[10px] uppercase font-bold tracking-wider ${alert.tagStyle}`}>
                        {alert.tag}
                      </span>
                    </div>
                    <div className="text-sm text-gray-200 mb-0.5 font-medium">
                      {alert.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {alert.subtitle}
                    </div>
                  </div>
                </div>

              <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto pl-9 md:pl-0">
                <span className="text-xs text-gray-500 whitespace-nowrap">{alert.time}</span>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-white/10 transition text-gray-400 hover:text-white">
                    <img src="/icons/overview/recentAlerts/view.svg" className="w-4 h-4 opacity-60 hover:opacity-100" alt="View" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/10 transition text-gray-400 hover:text-white">
                    <img src="/icons/overview/recentAlerts/check.svg" className="w-4 h-4 opacity-60 hover:opacity-100" alt="Dismiss" />
                  </button>
                </div>
              </div>

            </div>
          ))
          )}
        </div>

      </div>

    </main>
  );
}