import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartDataPoint } from "@/features/reports/types/report.types";

interface ChartTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; payload: ChartDataPoint }[];
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-border bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-text-primary">
        {payload[0].name}
      </p>
      <p className="text-sm font-semibold text-primary">{payload[0].value}</p>
    </div>
  );
}

interface DistributionChartProps {
  data: ChartDataPoint[];
  type?: "pie" | "bar";
}

export function DistributionChart({
  data,
  type = "pie",
}: DistributionChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-text-secondary">
        No data available for chart
      </div>
    );
  }

  if (type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill || "#0EA5E9"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.fill || "#0EA5E9"} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
