"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [overviewOpen, setOverviewOpen] = useState(true);
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-black p-4 to-purple-900">

      <h1 className="text-xl font-semibold text-emerald-400">
        Churn Bucket
      </h1>

      <div className="my-4">
        <img
          src="/icons/sideBar/divider.svg"
          alt="divider"
          className="w-full opacity-80"
        />
      </div>

      <p className="px-3 mb-2 text-xs tracking-widest text-white/40">
        MAIN
      </p>

      <nav className="text-sm font-medium">

        <button
          onClick={() => setOverviewOpen(!overviewOpen)}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md
                     text-white/80 hover:text-white hover:bg-white/5 transition"
        >
         
          <div className="w-5.5 flex justify-center items-center shrink-0">
            <img
              src="/icons/sideBar/overview.svg"
        
              className="w-5.5 h-5.5 max-w-none opacity-80" 
            />
          </div>

          <span>Overview</span>

          <span
            className={`ml-auto text-xs opacity-60 transition-transform duration-300
                        ${overviewOpen ? "rotate-0" : "-rotate-90"}`}
          >
            ▾
          </span>
        </button>

        <div
          className={`relative ml-8 overflow-hidden transition-all duration-300
                      ${overviewOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
        >
      
          <img
            src="/icons/sideBar/union.svg"
            className="absolute left-0 -top-2
                       w-7 h-24 opacity-60"
            alt=""
          />

          <div className="pl-6 space-y-3 pt-2">
            <a 
              href="/overview/insights" 
              className={`block transition ${
                pathname === "/overview/insights" 
                  ? "text-emerald-400 font-medium" 
                  : "text-white/40 hover:text-white"
              }`}
            >
              Insights
            </a>
            <a 
              href="/overview/partners" 
              className={`block transition ${
                pathname === "/overview/partners" 
                  ? "text-emerald-400 font-medium" 
                  : "text-white/40 hover:text-white"
              }`}
            >
              Partners
            </a>
            <a 
              href="/overview/alerts" 
              className={`block transition ${
                pathname === "/overview/alerts" 
                  ? "text-emerald-400 font-medium" 
                  : "text-white/40 hover:text-white"
              }`}
            >
              Alerts
            </a>
          </div>
        </div>

        <a
          href="/batch-scoring"
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
            pathname === "/batch-scoring"
              ? "text-emerald-400 font-medium bg-white/5"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <img src="/icons/sideBar/analytics.svg" className="w-5.5 h-5.5 opacity-60" />
          Batch Scoring
        </a>

        <div className="my-4">
          <img src="/icons/sideBar/divider.svg" alt="divider" className="w-full opacity-80" />
        </div>

        <a
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-md
                     text-white/40 hover:text-white hover:bg-white/5 transition"
        >
          <img src="/icons/sideBar/logout.svg" className="w-5.5 h-5.5 opacity-60" />
          Log out
        </a>

      </nav>
    </aside>
  );
}