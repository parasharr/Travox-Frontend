import React, { useState, useEffect, useCallback } from "react";
import {
    FiAlertTriangle,
    FiCalendar,
    FiBell,
    FiClock,
    FiCheckCircle,
    FiPlus,
    FiDollarSign,
    FiTrendingUp,
    FiMoreHorizontal
} from "react-icons/fi";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import "../provider.css";
import { useNavigate } from "react-router-dom";
import { FiX, FiMapPin, FiUser, FiMessageSquare, FiLoader } from "react-icons/fi";
import { useLanguage } from "../../LanguageContext";

const ProviderDashboard = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [showClientModal, setShowClientModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({
        active: 0,
        pending: 0,
        completed: 0,
        totalEarnings: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        try {
            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
            const token = localStorage.getItem("token");

            const response = await fetch(`${baseUrl}api/bookings/my`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                const bookingList = data.data || (Array.isArray(data) ? data : []);
                setBookings(bookingList.slice(0, 5)); // Get recent 5

                // Calculate stats
                const activeCount = bookingList.filter(b =>
                    ["accepted", "in progress", "in_progress"].includes((b.status || "").toLowerCase())
                ).length;

                const pendingCount = bookingList.filter(b =>
                    ["pending", "created"].includes((b.status || "").toLowerCase())
                ).length;

                // Simple mock for earnings as we don't have a transaction API yet
                // We'll calculate completed bookings value
                const completedBookings = bookingList.filter(b =>
                    ["completed", "approved"].includes((b.status || "").toLowerCase())
                );
                const earnings = completedBookings.reduce((acc, curr) => acc + (curr.price || curr.service?.price || 0), 0);

                setStats({
                    active: activeCount,
                    pending: pendingCount,
                    completed: completedBookings.length,
                    totalEarnings: 0
                });
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const openClientProfile = (clientName, initials, email) => {
        setSelectedClient({
            name: clientName,
            initials: initials,
            email: email || `${clientName.toLowerCase().replace(" ", ".")}@example.com`,
            memberSince: "Jan 2024",
            totalBookings: 12,
            rating: 4.8,
            location: "Kinshasa, DRC",
            bio: "Regular client who values punctuality and quality service for home maintenance."
        });
        setShowClientModal(true);
    };

    const chartData = [
        { name: "Mon", income: 0, held: 0 },
        { name: "Tue", income: 0, held: 0 },
        { name: "Wed", income: 0, held: 0 },
        { name: "Thu", income: 0, held: 0 },
        { name: "Fri", income: 0, held: 0 },
        { name: "Sat", income: 0, held: 0 },
        { name: "Sun", income: 0, held: 0 },
    ];

    return (
        <div className="dashboard-page">
            {/* Alert Banner */}
            <div className="dashboard-alert">
                <div className="alert-content">
                    <FiAlertTriangle size={20} />
                    <div>
                        <strong>{t('pd_kyc_pending')}</strong>
                        <p style={{ margin: 0, fontSize: "13px" }}>
                            {t('pd_kyc_msg')}
                        </p>
                    </div>
                </div>
                <button className="alert-btn" onClick={() => navigate("/provider/kyc")}>
                    {t('pd_complete_now')}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                {loading ? (
                    // Skeleton Stats
                    [1, 2, 3, 4].map((i) => (
                        <div className="stat-card" key={i}>
                            <div className="stat-icon-wrapper skeleton" style={{ width: "40px", height: "40px" }}></div>
                            <div className="skeleton" style={{ width: "60px", height: "32px", marginBottom: "8px" }}></div>
                            <div className="skeleton" style={{ width: "120px", height: "16px", marginBottom: "8px" }}></div>
                            <div className="skeleton" style={{ width: "80px", height: "12px" }}></div>
                        </div>
                    ))
                ) : (
                    <>
                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ background: "#eff6ff", color: "#2563eb" }}>
                                <FiCalendar />
                            </div>
                            <div className="stat-value">{stats.active}</div>
                            <div className="stat-label">{t('pd_active_bookings')}</div>
                            <div className="stat-meta meta-green">
                                <FiTrendingUp /> {t('pd_from_last_week')}
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ background: "#fff7ed", color: "#d97706" }}>
                                <FiBell />
                            </div>
                            <div className="stat-value">{stats.pending}</div>
                            <div className="stat-label">{t('pd_pending_requests')}</div>
                            <div className="stat-meta meta-yellow">
                                <FiClock /> {t('pd_action_required')}
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ background: "#fffceb", color: "#b45309" }}>
                                <FiClock />
                            </div>
                            <div className="stat-value">$450</div>
                            <div className="stat-label">{t('pd_pending_release')}</div>
                            <div className="stat-meta">{t('pd_awaiting_approval')}</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                                <FiCheckCircle />
                            </div>
                            <div className="stat-value">${(stats.totalEarnings * 0.9).toFixed(0)}</div>
                            <div className="stat-label">{t('pd_available_withdraw')}</div>
                            <div className="stat-meta meta-blue" style={{ cursor: "pointer" }}>
                                {t('pd_view_details')}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Quick Actions */}
            {/* Quick Actions */}
            <div className="section-header section-spacer">
                <h3 className="section-title">{t('pd_quick_actions')}</h3>
            </div>
            <div className="quick-actions-grid">
                <div className="quick-action-card" onClick={() => navigate("/provider/services")}>
                    <div className="action-icon">
                        <FiPlus />
                    </div>
                    <div className="action-title">{t('pd_add_service')}</div>
                    <div className="action-desc">{t('pd_expand_offerings')}</div>
                </div>

                <div className="quick-action-card" onClick={() => navigate("/provider/bookings")}>
                    <div className="action-icon">
                        <FiCalendar />
                    </div>
                    <div className="action-title">{t('pd_manage_bookings')}</div>
                    <div className="action-desc">{t('pd_see_all_bookings')}</div>
                </div>

                <div className="quick-action-card" onClick={() => navigate("/provider/payments")}>
                    <div className="action-icon">
                        <FiDollarSign />
                    </div>
                    <div className="action-title">{t('pd_view_payments')}</div>
                    <div className="action-desc">{t('pd_track_earnings')}</div>
                </div>
            </div>

            {/* Lower Section Grid */}
            <div className="dashboard-lower-grid">

                {/* Recent Bookings */}
                <div>
                    <div className="section-header">
                        <h3 className="section-title">{t('pd_recent_bookings')}</h3>
                        <span className="view-all" onClick={() => navigate("/provider/bookings")}>{t('pd_view_all')}</span>
                    </div>
                    <div className="table-card">
                        {loading ? (
                            <div style={{ padding: "0" }}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} style={{ padding: "20px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: "20px" }}>
                                        <div className="skeleton" style={{ width: "100px", height: "20px" }}></div>
                                        <div className="skeleton" style={{ width: "150px", height: "20px" }}></div>
                                        <div className="skeleton" style={{ width: "100px", height: "20px" }}></div>
                                        <div className="skeleton" style={{ width: "80px", height: "20px" }}></div>
                                        <div className="skeleton" style={{ width: "60px", height: "20px" }}></div>
                                    </div>
                                ))}
                            </div>
                        ) : bookings.length === 0 ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                                <p>{t('pd_no_bookings')}</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <table className="provider-table">
                                    <thead>
                                        <tr>
                                            <th className="hide-on-mobile">{t('pd_booking_id')}</th>
                                            <th>{t('pd_client')}</th>
                                            <th>{t('pd_service')}</th>
                                            <th className="hide-on-mobile">{t('pd_date')}</th>
                                            <th>{t('pd_status')}</th>
                                            <th>{t('pd_amount')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map((booking) => {
                                            const status = (booking.status || "pending").toLowerCase();
                                            let badgeClass = "status-pending";
                                            if (status === "in progress" || status === "accepted") badgeClass = "status-progress";
                                            if (status === "completed" || status === "approved") badgeClass = "status-completed";

                                            const clientName = booking.client?.name || "Client";
                                            const clientInitial = clientName.charAt(0);
                                            const clientEmail = booking.client?.email || "";

                                            return (
                                                <tr key={booking._id || booking.id} onClick={() => navigate(`/provider/booking/${booking._id || booking.id}`)} style={{ cursor: "pointer" }}>
                                                    <td data-label="Booking ID" className="hide-on-mobile">#{(booking._id || booking.id).substring(0, 8)}...</td>
                                                    <td data-label="Client">
                                                        <div className="client-cell" onClick={(e) => e.stopPropagation()}>
                                                            <div
                                                                className="client-avatar"
                                                                onClick={() => openClientProfile(clientName, clientInitial, clientEmail)}
                                                                style={{ cursor: "pointer", background: booking.client?.avatar ? "transparent" : "#475569" }}
                                                            >
                                                                {booking.client?.avatar ? <img src={booking.client.avatar} alt="" /> : clientInitial}
                                                            </div>
                                                            <span onClick={() => openClientProfile(clientName, clientInitial, clientEmail)} style={{ cursor: "pointer" }}>
                                                                {clientName}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td data-label="Service">{booking.service?.name || "Service"}</td>
                                                    <td data-label="Date" className="hide-on-mobile">{booking.date ? new Date(booking.date).toLocaleDateString() : "TBD"}</td>
                                                    <td data-label="Status"><span className={`status-badge ${badgeClass}`}>{status}</span></td>
                                                    <td data-label="Amount">${booking.price || booking.service?.price || 0}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Earnings Chart */}
                <div>
                    <div className="section-header">
                        <h3 className="section-title">{t('pd_earnings_overview')}</h3>
                    </div>
                    <div className="chart-card">
                        <div style={{ height: 300, width: "100%" }}>
                            <ResponsiveContainer>
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip
                                        cursor={{ fill: "transparent" }}
                                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                    />
                                    <Bar dataKey="held" fill="#fbbf24" radius={[4, 4, 0, 0]} stackId="a" name={t('pd_held_payments')} barSize={32} />
                                    <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} stackId="a" name={t('pd_released_payments')} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px" }}>
                            <div style={{ display: "flex", itemsAlign: "center", gap: "6px", fontSize: "12px", color: "#64748b" }}>
                                <div style={{ width: 8, height: 8, background: "#fbbf24", borderRadius: 2 }}></div> {t('pd_held_payments')}
                            </div>
                            <div style={{ display: "flex", itemsAlign: "center", gap: "6px", fontSize: "12px", color: "#64748b" }}>
                                <div style={{ width: 8, height: 8, background: "#22c55e", borderRadius: 2 }}></div> {t('pd_released_payments')}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            {/* Client Profile Modal */}
            {showClientModal && selectedClient && (
                <div className="modal-overlay">
                    <div className="provider-modal-content" style={{ padding: "0", overflow: "hidden", borderRadius: "20px" }}>
                        {/* Modal Header/Banner */}
                        <div style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", height: "100px", position: "relative" }}>
                            <button
                                onClick={() => setShowClientModal(false)}
                                style={{ position: "absolute", top: "15px", right: "15px", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "30px", height: "30px", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                                <FiX />
                            </button>
                        </div>

                        <div style={{ padding: "0 32px 32px", marginTop: "-50px", textAlign: "center" }}>
                            <div style={{
                                width: "100px",
                                height: "100px",
                                borderRadius: "50%",
                                border: "5px solid white",
                                background: "#f1f5f9",
                                margin: "0 auto 16px",
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "36px",
                                fontWeight: "bold",
                                color: "#2563eb",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                            }}>
                                {selectedClient.avatar ? <img src={selectedClient.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (selectedClient.initials || selectedClient.name.charAt(0))}
                            </div>

                            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>{selectedClient.name}</h2>
                            <div style={{ fontSize: "16px", color: "#2563eb", marginBottom: "24px", fontWeight: "500" }}>{selectedClient.email}</div>

                            <button
                                className="primary-btn"
                                style={{ width: "100%", padding: "12px" }}
                                onClick={() => setShowClientModal(false)}
                            >
                                {t('pd_close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderDashboard;
