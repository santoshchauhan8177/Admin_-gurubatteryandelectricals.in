"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/chart"

const data = [
  { name: "Jan", total: 1800 },
  { name: "Feb", total: 2200 },
  { name: "Mar", total: 2800 },
  { name: "Apr", total: 2400 },
  { name: "May", total: 2900 },
  { name: "Jun", total: 3300 },
  { name: "Jul", total: 3200 },
  { name: "Aug", total: 3500 },
  { name: "Sep", total: 3600 },
  { name: "Oct", total: 3800 },
  { name: "Nov", total: 4200 },
  { name: "Dec", total: 4800 },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        {/* Grid */}
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />

        {/* X & Y Axis */}
        <XAxis
          dataKey="name"
          stroke="#94A3B8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#94A3B8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />

        {/* Tooltip */}
        <Tooltip
          cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border border-muted bg-white dark:bg-zinc-900 p-3 shadow-lg transition-all">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-muted-foreground uppercase">Month</span>
                      <span className="font-semibold text-foreground">{payload[0].payload.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-muted-foreground uppercase">Sales</span>
                      <span className="font-semibold">${payload[0].value.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />

        {/* Bar */}
        <Bar
          dataKey="total"
          fill="url(#barGradient)"
          radius={[8, 8, 0, 0]}
          className="transition-all duration-300 hover:shadow-md"
        />
        
        {/* Gradient */}
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.4} />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  )
}
