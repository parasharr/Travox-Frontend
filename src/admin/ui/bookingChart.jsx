import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLanguage } from "../../LanguageContext";

export default function BookingsChart({ data = [] }) {
  const { t } = useLanguage();
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="a" stroke="#2563eb" strokeWidth={3} name={t('admin_ui_chart_total_bookings') || "Total Bookings"} />
        <Line type="monotone" dataKey="b" stroke="#22c55e" strokeWidth={2} name={t('admin_ui_chart_completed_bookings') || "Completed Bookings"} />
      </LineChart>
    </ResponsiveContainer>
  );
}
