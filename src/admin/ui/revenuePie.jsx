import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DEFAULT_COLORS = ["#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

export default function RevenuePie({ data = [] }) {
  // If no data, show a placeholder or empty chart
  const hasData = data && data.length > 0;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={hasData ? data : [{ name: "No Data", value: 1 }]}
          dataKey="value"
          innerRadius={75}
          outerRadius={110}
          paddingAngle={hasData ? 2 : 0}
        >
          {hasData ? (
            data.map((_, i) => (
              <Cell key={i} fill={DEFAULT_COLORS[i % DEFAULT_COLORS.length]} />
            ))
          ) : (
            <Cell fill="#f1f5f9" />
          )}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
