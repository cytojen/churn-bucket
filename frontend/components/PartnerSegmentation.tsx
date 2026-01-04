"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CHART_COLORS } from "@/lib/constants";

interface PlanData {
  plan: string;
  customers: number;
  churnRate: number;
}

interface CustomerSegmentationProps {
  planData: PlanData[];
}

export function PartnerSegmentation({ planData }: CustomerSegmentationProps) {
  const totalCustomers = planData.reduce((sum, item) => sum + item.customers, 0);

  return (
    <div className="p-5 rounded-2xl bg-black/70 border border-white/5">
      <style jsx>{`
        :global(.recharts-bar-rectangle:hover) {
          opacity: 1 !important;
          filter: none !important;
        }
      `}</style>
      <div className="mb-4">
        <h3 className="text-white font-medium text-base">Partner Distribution by Plan</h3>
        <p className="text-xs text-white/40 mt-2">{totalCustomers} total customers</p>
      </div>
      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={planData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis type="number" stroke="#a3a3a3" fontSize={12} />
            <YAxis dataKey="plan" type="category" stroke="#a3a3a3" fontSize={12} width={80} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#141414",
                border: "1px solid #262626",
                borderRadius: "8px",
                color: "#ffffff",
              }}
              labelStyle={{ color: "#ffffff" }}
              itemStyle={{ color: "#ffffff" }}
              formatter={(value?: number, name?: string, props?: any) => {
                if (value === undefined || !props) return [];
                const churnRate = props.payload.churnRate;
                return [
                  <div key="data">
                    <div>{value} customers</div>
                    <div style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px" }}>
                      {churnRate.toFixed(1)}% churn rate
                    </div>
                  </div>,
                ];
              }}
              labelFormatter={(value) => value}
            />
            <Bar 
              dataKey="customers" 
              radius={[0, 8, 8, 0]}
              label={{ 
                position: 'right', 
                fill: '#ffffff',
                fontSize: 12
              }}
            >
              {planData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS.PLAN_COLORS[index % CHART_COLORS.PLAN_COLORS.length]} style={{ outline: 'none' }} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
