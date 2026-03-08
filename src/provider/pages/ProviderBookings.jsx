import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiClock,
    FiCalendar,
    FiMapPin,
    FiUser,
    FiCheck,
    FiX,
    FiAlertCircle,
    FiMessageSquare,
    FiLoader
} from "react-icons/fi";
import "../provider.css";
import { useLanguage } from "../../LanguageContext";

const ProviderBookings = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState("All");
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [showKYCModal, setShowKYCModal] = useState(false);
    const [kycMessage, setKycMessage] = useState("");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showClientModal, setShowClientModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError(null);
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

                // Map API data to UI structure
                const mappedBookings = bookingList.map(b => {
                    const status = (b.status || "pending").toLowerCase();
                    const isPending = status === "pending" || status === "created";

                    return {
                        id: b._id || b.id,
                        clientName: b.client?.name || "Client",
                        clientAvatar: b.client?.avatar || null,
                        clientEmail: b.client?.email || "",
                        service: b.service?.name || "General Service",
                        date: b.date ? new Date(b.date).toLocaleDateString() : "TBD",
                        time: b.date ? new Date(b.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD",
                        duration: b.service?.duration || "N/A",
                        price: b.price || b.service?.price || 0,
                        status: isPending ? "pending" : status,
                        specialInstructions: b.notes || "",
                        receivedTime: b.createdAt ? getTimeAgo(b.createdAt) : "Recently",
                        respondBy: isPending ? "Within 24 hours" : null
                    };
                });

                setBookings(mappedBookings);
            } else {
                throw new Error(data.message || "Failed to fetch bookings");
            }
        } catch (err) {
            console.error("Error fetching provider bookings:", err);
            setError("Failed to load bookings. Please check your connection.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const getTimeAgo = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now - past;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHrs / 24);

        if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffHrs > 0) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
        return "Just now";
    };

    const handleAction = async (id, newStatus) => {
        setActionLoading(id);
        const action = newStatus.toLowerCase() === "accepted" ? "accept" : "reject";
        try {
            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
            const token = localStorage.getItem("token");

            const response = await fetch(`${baseUrl}api/bookings/${id}/${action}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                setBookings(prev => prev.map(b =>
                    b.id === id ? { ...b, status: newStatus } : b
                ));
                if (action === "accept") {
                    setShowConfirmModal(false);
                    setShowSuccessDialog(true);
                    setTimeout(() => setShowSuccessDialog(false), 3000);
                }
            } else {
                const data = await response.json();
                setShowConfirmModal(false);
                setKycMessage(data.message || `Failed to ${action} booking`);
                setShowKYCModal(true);
            }
        } catch (err) {
            console.error(`Error ${action}ing booking:`, err);
            setShowConfirmModal(false);
            setKycMessage("An error occurred while processing your request. Please try again.");
            setShowKYCModal(true);
        } finally {
            setActionLoading(null);
        }
    };

    const openAcceptConfirm = (booking) => {
        setSelectedBooking(booking);
        setShowConfirmModal(true);
    };

    const openClientProfile = (booking) => {
        // In a real app, you might fetch more detailed info here
        // For now, we use the client data from the booking
        setSelectedClient({
            name: booking.clientName,
            avatar: booking.clientAvatar,
            email: booking.clientEmail,
            memberSince: "Jan 2024", // Mock data
            totalBookings: 12, // Mock data
            rating: 4.8, // Mock data
            location: "Kinshasa, DRC", // Mock data
            bio: "Regular client who values punctuality and quality service for home maintenance."
        });
        setShowClientModal(true);
    };

    const filteredBookings = bookings.filter(b => {
        if (activeTab === "All") return true;

        const status = b.status.toLowerCase();
        if (activeTab === "Pending" && status === "pending") return true;
        if (activeTab === "Accepted" && ["accepted", "confirmed", "in progress", "completed"].includes(status)) return true;
        if (activeTab === "Rejected" && ["rejected", "cancelled"].includes(status)) return true;

        return false;
    });

    const pendingCount = bookings.filter(b => b.status === "pending").length;
    const acceptedCount = bookings.filter(b => ["accepted", "confirmed", "in progress", "completed"].includes(b.status.toLowerCase())).length;
    const rejectedCount = bookings.filter(b => ["rejected", "cancelled"].includes(b.status.toLowerCase())).length;

    return (
        <div className="dashboard-page">
            <div className="page-header-row">
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <h1 className="page-title">{t('pb_title')}</h1>
                    {pendingCount > 0 && <span className="badge-highlight">{pendingCount} {t('pb_pending')}</span>}
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab-btn ${activeTab === "All" ? "active" : ""}`}
                    onClick={() => setActiveTab("All")}
                >
                    {t('pb_all')} ({bookings.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === "Pending" ? "active" : ""}`}
                    onClick={() => setActiveTab("Pending")}
                >
                    {t('pb_pending')} ({pendingCount})
                </button>
                <button
                    className={`tab-btn ${activeTab === "Accepted" ? "active" : ""}`}
                    onClick={() => setActiveTab("Accepted")}
                >
                    {t('pb_accepted')} ({acceptedCount})
                </button>
                <button
                    className={`tab-btn ${activeTab === "Rejected" ? "active" : ""}`}
                    onClick={() => setActiveTab("Rejected")}
                >
                    {t('pb_rejected')} ({rejectedCount})
                </button>
            </div>

            {pendingCount > 0 && activeTab !== "Rejected" && activeTab !== "Accepted" && (
                <div className="warning-banner">
                    <FiAlertCircle />
                    <span>{t('pb_you_have')} <strong>{pendingCount} {t('pb_pending_warning')}</strong> - {t('pb_respond_warning')}</span>
                </div>
            )}

            <div className="bookings-list">
                {loading ? (
                    <div className="empty-state" style={{ padding: "80px" }}>
                        <FiLoader className="spin-icon" size={32} />
                        <p style={{ marginTop: "16px" }}>{t('pb_loading')}</p>
                    </div>
                ) : error ? (
                    <div className="empty-state">
                        <p style={{ color: "#ef4444" }}>{error}</p>
                        <button className="btn-view" onClick={fetchBookings} style={{ marginTop: "16px" }}>{t('pb_retry')}</button>
                    </div>
                ) : filteredBookings.length > 0 ? (
                    filteredBookings.map(booking => (
                        <div key={booking.id} className="booking-card-row">

                            {/* Header & Meta */}
                            <div className="bc-header">
                                <span className="bc-id">#{booking.id?.slice(-8).toUpperCase() || booking.id}</span>
                                <span className="bc-received">{t('pb_received')} {booking.receivedTime}</span>
                            </div>

                            {/* Main Content */}
                            <div className="bc-body">
                                <div className="bc-client-info">
                                    <div className="client-avatar-lg">
                                        {booking.clientAvatar ? <img src={booking.clientAvatar} alt="" /> : (booking.clientName?.charAt(0) || "C")}
                                    </div>
                                    <div>
                                        <h3 className="client-name">{booking.clientName}</h3>
                                        <span
                                            className="client-link"
                                            onClick={() => openClientProfile(booking)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            View Client Profile
                                        </span>
                                    </div>
                                </div>

                                <div className="bc-service-details">
                                    <div className="service-info-block">
                                        <div className="service-icon-box"><FiCalendar /></div>
                                        <div>
                                            <h4 className="service-title">{booking.service}</h4>
                                            <div className="service-meta">
                                                <span><FiCalendar /> {booking.date} at {booking.time}</span>
                                                <span><FiClock /> {booking.duration}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {booking.specialInstructions && (
                                        <div className="special-instructions">
                                            <strong>{t('pb_special_instructions')}</strong>
                                            <p>{booking.specialInstructions}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Price & Actions Column */}
                                <div className="bc-actions-col">
                                    {booking.status === "pending" && booking.respondBy && (
                                        <div className="respond-box">
                                            <FiClock />
                                            <div>
                                                <strong>{t('pb_respond_by')}</strong>
                                                <div>{booking.respondBy}</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="price-tag">${parseFloat(booking.price).toFixed(2)}</div>

                                    <div className="action-buttons">
                                        {booking.status === "pending" && (
                                            <>
                                                <button
                                                    className="btn-accept"
                                                    onClick={() => openAcceptConfirm(booking)}
                                                    disabled={actionLoading === booking.id}
                                                >
                                                    <FiCheck /> {t('pb_accept')}
                                                </button>
                                                <button
                                                    className="btn-reject"
                                                    onClick={() => handleAction(booking.id, "rejected")}
                                                    disabled={actionLoading === booking.id}
                                                >
                                                    {t('pb_reject')}
                                                </button>
                                            </>
                                        )}

                                        {["accepted", "confirmed", "in progress", "completed"].includes(booking.status) && (
                                            <button
                                                className="btn-view"
                                                onClick={() => navigate(`/provider/bookings/${booking.id}`)}
                                            >
                                                {t('pb_view_details')}
                                            </button>
                                        )}

                                        {["rejected", "cancelled"].includes(booking.status) && (
                                            <button className="btn-rejected-status" disabled>
                                                <FiX /> {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <p>{t('pb_no_bookings')}</p>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="provider-modal-content" style={{ maxWidth: "450px", padding: "32px", textAlign: "center" }}>
                        <div style={{ width: "64px", height: "64px", backgroundColor: "#dbeafe", color: "#2563eb", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                            <FiCheck size={32} />
                        </div>
                        <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px", color: "#1e293b" }}>{t('pb_accept_title')}</h2>
                        <p style={{ color: "#64748b", marginBottom: "32px", lineHeight: "1.6" }}>
                            {t('pb_accept_msg_prefix')} <strong>{selectedBooking?.clientName}</strong> {t('pb_accept_msg_for')} <strong>{selectedBooking?.service}</strong>?
                        </p>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                className="btn-secondary"
                                style={{ flex: 1, padding: "12px" }}
                                onClick={() => setShowConfirmModal(false)}
                                disabled={actionLoading}
                            >
                                {t('pb_cancel')}
                            </button>
                            <button
                                className="primary-btn"
                                style={{ flex: 1, padding: "12px" }}
                                onClick={() => handleAction(selectedBooking.id, "accepted")}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <FiLoader className="spin-icon" /> : t('pb_confirm_accept')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Notification */}
            {showSuccessDialog && (
                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "white",
                    padding: "32px 48px",
                    borderRadius: "16px",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                    zIndex: 10000,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                    minWidth: "300px",
                    textAlign: "center"
                }}>
                    <div style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        backgroundColor: "#10b981",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "8px"
                    }}>
                        <FiCheck size={32} color="white" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#1f2937" }}>{t('pb_accepted_success')}</h3>
                    <p style={{ margin: 0, color: "#64748b" }}>{t('pb_accepted_msg')}</p>
                </div>
            )}

            {/* Client Profile Modal */}
            {showClientModal && selectedClient && (
                <div className="modal-overlay">
                    <div className="provider-modal-content" style={{ maxWidth: "500px", padding: "0", overflow: "hidden", borderRadius: "20px" }}>
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
                                {selectedClient.avatar ? <img src={selectedClient.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : selectedClient.name.charAt(0)}
                            </div>

                            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>{selectedClient.name}</h2>
                            <div style={{ fontSize: "16px", color: "#2563eb", marginBottom: "24px", fontWeight: "500" }}>{selectedClient.email}</div>

                            <button
                                className="primary-btn"
                                style={{ width: "100%", padding: "12px" }}
                                onClick={() => setShowClientModal(false)}
                            >
                                {t('pb_close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* KYC / Error Modal */}
            {showKYCModal && (
                <div className="modal-overlay">
                    <div className="provider-modal-content" style={{ maxWidth: "400px", padding: "32px", textAlign: "center" }}>
                        <div style={{ width: "64px", height: "64px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                            <FiAlertCircle size={32} />
                        </div>
                        <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "12px", color: "#1e293b" }}>{t('pb_approval_required')}</h2>
                        <p style={{ color: "#64748b", marginBottom: "32px", lineHeight: "1.6" }}>
                            {kycMessage}
                        </p>
                        <button
                            className="primary-btn"
                            style={{ width: "100%", padding: "12px" }}
                            onClick={() => setShowKYCModal(false)}
                        >
                            {t('pb_got_it')}
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin-icon {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default ProviderBookings;
