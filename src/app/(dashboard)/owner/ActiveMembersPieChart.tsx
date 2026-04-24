"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface ActiveMembersPieChartProps {
  activeCount: number;
  inactiveCount: number;
}

export function ActiveMembersPieChart({
  activeCount,
  inactiveCount,
}: ActiveMembersPieChartProps) {
  const data = [
    { name: "Active", value: activeCount, color: "#10b981" }, // emerald-500
    { name: "Inactive", value: inactiveCount, color: "#f43f5e" }, // rose-500
  ];

  return (
    <Card className="flex flex-col h-full border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Subscription Status</CardTitle>
        <CardDescription>
          Breakdown of active vs inactive subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px] flex items-center justify-center">
        {activeCount === 0 && inactiveCount === 0 ? (
          <div className="text-muted-foreground text-sm flex items-center justify-center h-[200px] w-full border border-dashed rounded-lg">
            No members registered
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "#0f172a", fontWeight: 600 }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-foreground tracking-tight ml-1.5 font-medium">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
