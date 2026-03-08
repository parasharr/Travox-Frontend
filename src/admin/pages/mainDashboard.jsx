import { useState, useEffect } from "react";
import "../admin.css";

import StatCard from "../ui/statcard";
import Card from "../ui/card";
import RecentActivity from "../ui/table";

import {
  FaUsers,
  FaCalendarCheck,
  FaDollarSign,
  FaWallet,
  FaIdCard,
  FaExclamationCircle,
} from "react-icons/fa";
import DashboardCharts from "../ui/charts";
import { useLanguage } from "../../LanguageContext";

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    users: { total: 0, providers: 0, all: 0 },
    kyc: { totalSubmissions: 0 },
    bookings: { total: 0 },
    payments: { total: 0 },
    disputes: { total: 0 }
  });

  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState([]);
  const [bookingsChartData, setBookingsChartData] = useState([]);
  const [revenuePieData, setRevenuePieData] = useState([]);
  const [platformRevenueMonth, setPlatformRevenueMonth] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

        // Fetch dashboard stats
        // Fetch bookings for chart data
        // Fetch all bookings for revenue breakdown (since stats doesn't have it by category)
        const [statsRes, bookingsRes] = await Promise.all([
          fetch(`${baseUrl}api/admin/dashboard`, { headers: { "Authorization": `Bearer ${token}` } }),
          fetch(`${baseUrl}api/admin/bookings`, { headers: { "Authorization": `Bearer ${token}` } })
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats({
            users: {
              total: data.users?.total || 0,
              providers: data.users?.providers || 0,
              all: data.users?.all || 0
            },
            kyc: { totalSubmissions: data.kyc?.totalSubmissions || 0 },
            bookings: { total: data.bookings?.total || 0 },
            payments: { total: data.payments?.total || 0 },
            disputes: { total: data.disputes?.total || 0 }
          });
        }

        if (bookingsRes.ok) {
          const bData = await bookingsRes.json();
          const bookings = bData.bookings || [];

          // 1. Process bookings for 30-day Line Chart
          const chartData = processBookingsForChart(bookings);
          setBookingsChartData(chartData);

          // 2. Process bookings for Revenue Breakdown Pie Chart
          // Sum up prices of completed bookings per category
          let monthRevenue = 0;
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          const revenueByCategory = bookings.reduce((acc, b) => {
            const status = (b.status || "").toLowerCase();
            const isCompleted = ["completed", "approved", "released", "paid"].includes(status);

            if (isCompleted) {
              const catName = b.service?.category?.name || "Uncategorized";
              const price = parseFloat(b.totalPrice || b.price || 0);
              acc[catName] = (acc[catName] || 0) + price;

              // Also check for current month revenue
              const bDate = new Date(b.date || b.createdAt);
              if (bDate.getMonth() === currentMonth && bDate.getFullYear() === currentYear) {
                monthRevenue += price;
              }
            }
            return acc;
          }, {});

          setPlatformRevenueMonth(monthRevenue);

          const pieData = Object.entries(revenueByCategory)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value); // Sort by highest revenue

          setRevenuePieData(pieData);
        }

        // Fetch recent users for activity feed
        const usersResponse = await fetch(`${baseUrl}api/admin/users`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          const activities = (usersData.users || [])
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10)
            .map(user => ({
              user: user.name || "Unknown User",
              action: "Logged in",
              time: formatTimeAgo(new Date(user.createdAt)),
              status: user.isActive ? "active" : "inactive"
            }));

          setActivityData(activities);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Process bookings data for chart (last 30 days)
  const processBookingsForChart = (bookings) => {
    const now = new Date();
    const last30Days = [];

    // Initialize last 30 days with 0 bookings
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      last30Days.push({
        day: date.getDate().toString(),
        date: date.toISOString().split('T')[0],
        value: 0
      });
    }

    // Count bookings per day
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.date);
      const daysDiff = Math.floor((now - bookingDate) / (1000 * 60 * 60 * 24));

      if (daysDiff >= 0 && daysDiff < 30) {
        const index = 29 - daysDiff;
        if (last30Days[index]) {
          last30Days[index].value++;
        }
      }
    });

    return last30Days;
  };

  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };


  return (
    <div className="dashboard-page">

      {/* HEADER */}
      <div className="dashboard-header">
        <h1>{t('admin_dash_title') || "Dashboard Overview"}</h1>
        <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", fontSize: "1.2rem", color: "#666" }}>
          {t('admin_dash_loading') || "Loading dashboard stats..."}
        </div>
      ) : (
        <>
          {/* BIG CARDS */}
          <div className="dashboard-stats">
            <StatCard
              title={t('admin_dash_total_users') || "Total Users"}
              value={stats.users.all.toLocaleString()}
              sub={`${stats.users.total} ${t('admin_dash_clients') || "Clients"} · ${stats.users.providers} ${t('admin_dash_providers') || "Providers"}`}
              trend={t('admin_dash_realtime') || "Real-time"}
              icon={<FaUsers />}
              color="blue"
            />

            <StatCard
              title={t('admin_dash_active_bookings') || "Active Bookings"}
              value={stats.bookings.total.toLocaleString()}
              sub={t('admin_dash_total_bookings') || "Total Bookings"}
              icon={<FaCalendarCheck />}
              color="blue"
            />

            <StatCard
              title={t('admin_dash_total_payments') || "Total Payments"}
              value={`$${stats.payments.total.toLocaleString()}`}
              sub={t('admin_dash_processed_transactions') || "Processed Transactions"}
              icon={<FaDollarSign />}
              color="yellow"
            />

            <StatCard
              title={t('admin_dash_total_disputes') || "Total Disputes"}
              value={stats.disputes.total.toLocaleString()}
              sub={t('admin_dash_open_cases') || "Open cases requiring attention"}
              icon={<FaExclamationCircle />}
              color="red"
            />
          </div>

          {/* SMALL CARDS */}
          <div className="dashboard-mini">
            <Card className="mini-card yellow">
              <div className="mini-value">{stats.kyc.totalSubmissions}</div>
              <p className="mini-title">{t('admin_dash_pending_kyc') || "Pending KYC Verifications"}</p>
              <span className="mini-link">{t('admin_dash_view_all') || "View all →"}</span>
            </Card>

            <Card className="mini-card red">
              <div className="mini-value">{stats.disputes.total}</div>
              <p className="mini-title">{t('admin_dash_active_disputes') || "Active Disputes"}</p>
              <span className="mini-link">{t('admin_dash_view_all') || "View all →"}</span>
            </Card>

            <Card className="mini-card blue">
              <div className="mini-value">${platformRevenueMonth.toLocaleString()}</div>
              <p className="mini-title">{t('admin_dash_platform_revenue') || "Platform Revenue This Month"}</p>
              <span className="mini-link">{t('admin_dash_view_details') || "View details →"}</span>
            </Card>
          </div>


          <RecentActivity data={activityData} />
          <DashboardCharts
            bookingsData={bookingsChartData}
            revenueData={revenuePieData}
          />
        </>
      )}


    </div>
  );
}
