"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CHART_COLORS } from "@/lib/constants";

const data = [
  { week: "W1", champions: 115, atRisk: 40, critical: 45 },
  { week: "W2", champions: 118, atRisk: 42, critical: 40 },
  { week: "W3", champions: 112, atRisk: 48, critical: 40 },
  { week: "W4", champions: 120, atRisk: 45, critical: 35 },
  { week: "W5", champions: 122, atRisk: 43, critical: 35 },
  { week: "W6", champions: 120, atRisk: 45, critical: 35 },
];

export function PortfolioTrend() {
  return (
    <div className="md:col-span-2 p-5 rounded-2xl bg-black/70 border border-white/5">
      <h3 className="text-white font-medium mb-4">Portfolio Health Trend</h3>
      
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorChampions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.STATUS_COLORS.CHAMPION} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.STATUS_COLORS.CHAMPION} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAtRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.STATUS_COLORS.AT_RISK} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.STATUS_COLORS.AT_RISK} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.STATUS_COLORS.CRITICAL} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.STATUS_COLORS.CRITICAL} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="week" stroke="#a3a3a3" fontSize={12} />
            <YAxis stroke="#a3a3a3" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#141414",
                border: "1px solid #262626",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fafafa" }}
            />
            <Area
              type="monotone"
              dataKey="champions"
              stroke={CHART_COLORS.STATUS_COLORS.CHAMPION}
              fillOpacity={1}
              fill="url(#colorChampions)"
            />
            <Area
              type="monotone"
              dataKey="atRisk"
              stroke={CHART_COLORS.STATUS_COLORS.AT_RISK}
              fillOpacity={1}
              fill="url(#colorAtRisk)"
            />
            <Area
              type="monotone"
              dataKey="critical"
              stroke={CHART_COLORS.STATUS_COLORS.CRITICAL}
              fillOpacity={1}
              fill="url(#colorCritical)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-white/60">Champions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-sm text-white/60">At-Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-white/60">Critical</span>
        </div>
      </div>
    </div>
  );
}
