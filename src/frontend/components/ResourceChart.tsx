import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MetricPoint } from "../types";

export function ResourceChart({ data }: { data: MetricPoint[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="cpuFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ed1c24" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#ed1c24" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="memoryFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#7d8798" stopOpacity={0.17} />
              <stop offset="100%" stopColor="#7d8798" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#25272e" strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: "#737784", fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
          <YAxis domain={[0, 100]} tick={{ fill: "#737784", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(value: number) => `${value}%`} />
          <Tooltip
            contentStyle={{ background: "#111318", border: "1px solid #25272e", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#b9bbc4" }}
            itemStyle={{ color: "#fff" }}
            formatter={(value) => [`${Number(value).toFixed(1)}%`]}
          />
          <Area type="monotone" dataKey="memory" name="RAM" stroke="#828b9c" strokeWidth={1.5} fill="url(#memoryFill)" />
          <Area type="monotone" dataKey="cpu" name="CPU" stroke="#ed1c24" strokeWidth={2} fill="url(#cpuFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
