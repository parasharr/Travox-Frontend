import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { service: "Home Cleaning", value: 287 },
  { service: "Plumbing Repair", value: 198 },
  { service: "Graphic Design", value: 175 },
  { service: "Personal Training", value: 156 },
  { service: "Legal Consultation", value: 142 },
];

export default function TopServicesChart({ data = [] }) {
  const hasData = data && data.length > 0;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={hasData ? data : [{ service: "No Data", value: 0 }]}
        layout="vertical"
        margin={{ left: 20, right: 30 }}
      >
        <XAxis type="number" />
        <YAxis type="category" dataKey="service" width={hasData ? 130 : 80} />
        <Tooltip formatter={(value) => [`${value} bookings`, "Count"]} />
        <Bar dataKey="value" fill="#2563eb" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
