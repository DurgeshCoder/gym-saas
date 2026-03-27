"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface RevenueChartProps {
  data: {
    name: string;
    revenue: number;
  }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue for the past 6 months</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.2} />
            <XAxis 
              dataKey="name" 
              tickLine={false} 
              axisLine={false} 
              fontSize={12}
              tickMargin={10}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              fontSize={12}
              tickFormatter={(value) => `₹${value}`}
              width={80}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#8b5cf6', fontWeight: 600 }}
              formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
            />
            <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
