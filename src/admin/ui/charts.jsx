import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
} from "recharts";

import "../admin.css";
import { useLanguage } from "../../LanguageContext";

const DEFAULT_COLORS = ["#2563eb", "#fbbf24", "#22c55e", "#9ca3af", "#6366f1", "#f43f5e", "#10b981"];

export default function DashboardCharts({ bookingsData = [], revenueData = [] }) {
    const { t } = useLanguage();
    const hasRevenueData = revenueData && revenueData.length > 0;
    const totalRevenue = hasRevenueData ? revenueData.reduce((acc, curr) => acc + curr.value, 0) : 0;

    return (
        <div className="dashboard-charts">

            {/* BOOKINGS */}
            <div className="chart-card">
                <h4>{t('admin_ui_chart_bookings_time') || "Bookings Over Time"}</h4>
                <p>{t('admin_ui_chart_last_30_days') || "Last 30 days"}</p>

                <ResponsiveContainer width="100%" height={260}>
                    <LineChart
                        data={bookingsData}
                        margin={{
                            top: 50,
                            right: 40,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#2563eb"
                            strokeWidth={3}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>

            </div>

            {/* REVENUE */}
            <div className="chart-card">
                <h4>{t('admin_ui_chart_rev_breakdown') || "Revenue Breakdown"}</h4>
                <p>{t('admin_ui_chart_by_category') || "By service category"}</p>

                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={hasRevenueData ? revenueData : [{ name: t('admin_ui_chart_no_data') || "No Data", value: 1 }]}
                            dataKey="value"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={hasRevenueData ? 3 : 0}
                        >
                            {hasRevenueData ? (
                                revenueData.map((_, index) => (
                                    <Cell key={index} fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
                                ))
                            ) : (
                                <Cell fill="#f1f5f9" />
                            )}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    </PieChart>
                </ResponsiveContainer>

                <div className="chart-legend">
                    {hasRevenueData ? (
                        revenueData.map((item, i) => {
                            const percent = totalRevenue > 0 ? Math.round((item.value / totalRevenue) * 100) : 0;
                            return (
                                <div key={i}>
                                    <span style={{ background: DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}></span>
                                    {item.name} ({percent}%)
                                </div>
                            );
                        })
                    ) : (
                        <div>{t('admin_ui_chart_no_rev_data') || "No revenue data available"}</div>
                    )}
                </div>
            </div>

        </div>
    );
}
