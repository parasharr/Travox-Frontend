import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { week: "Week 1", held: 4000, released: 8000 },
  { week: "Week 2", held: 5000, released: 9000 },
  { week: "Week 3", held: 6000, released: 10000 },
  { week: "Week 4", held: 7000, released: 12000 },
];

export default function PaymentStatusChart({ data = [] }) {
  const hasData = data && data.length > 0;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={hasData ? data : [{ week: "No Data", held: 0, released: 0 }]}>
        <XAxis dataKey="week" />
        <YAxis tickFormatter={(value) => `$${value}`} />
        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Amount"]} />
        <Bar dataKey="held" name="Held (Pending)" stackId="a" fill="#fbbf24" radius={[0, 0, 0, 0]} />
        <Bar dataKey="released" name="Released (Paid)" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
