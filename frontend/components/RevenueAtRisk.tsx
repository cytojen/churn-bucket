"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface RevenueAtRiskProps {
  championRevenue: number;
  atRiskRevenue: number;
  criticalRevenue: number;
}

export function RevenueAtRisk({ championRevenue, atRiskRevenue, criticalRevenue }: RevenueAtRiskProps) {
  const data = [
    { tier: "Champions", revenue: championRevenue, fill: "#22c55e" },
    { tier: "At-Risk", revenue: atRiskRevenue, fill: "#eab308" },
    { tier: "Critical", revenue: criticalRevenue, fill: "#ef4444" },
  ];

  const totalAtRisk = atRiskRevenue + criticalRevenue;

  return (
    <div className="p-5 rounded-2xl bg-black/70 border border-white/5">
      <style jsx>{`
        :global(.recharts-bar-rectangle:hover) {
          opacity: 1 !important;
          filter: none !important;
        }
      `}</style>
      <div className="mb-4">
        <h3 className="text-white font-medium text-base">Revenue at Risk by Customer Tier</h3>
        <p className="text-xs text-red-400 mt-2">${totalAtRisk.toLocaleString()} ARR at risk</p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="tier" stroke="#a3a3a3" fontSize={12} />
            <YAxis stroke="#a3a3a3" fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#141414",
                border: "1px solid #262626",
                borderRadius: "8px",
                color: "#ffffff",
              }}
              labelStyle={{ color: "#ffffff" }}
              itemStyle={{ color: "#ef4444" }}
              formatter={(value: number) => [`$${(value / 1000).toFixed(0)}K`, "Revenue"]}
            />
            <Bar 
              dataKey="revenue" 
              radius={[8, 8, 0, 0]}
              label={{ 
                position: 'top', 
                fill: '#ffffff',
                fontSize: 12,
                formatter: (value: number) => `$${(value / 1000).toFixed(0)}K`
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} style={{ outline: 'none' }} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {data.map((item) => (
          <div key={item.tier} className="text-center">
            <div className="inline-block w-3 h-3 rounded-full mb-2" style={{ backgroundColor: item.fill }} />
            <p className="text-xs text-white/40">{item.tier}</p>
            <p className="text-sm font-semibold text-yellow-400">${(item.revenue / 1000).toFixed(0)}K</p>
          </div>
        ))}
      </div>
    </div>
  );
}
