import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FiArrowLeft,
    FiMessageSquare,
    FiPhone,
    FiShield,
    FiMapPin,
    FiCalendar,
    FiClock,
    FiCheckCircle,
    FiAlertTriangle,
    FiFileText,
    FiX,
    FiLoader,
    FiInfo,
    FiAlertCircle
} from "react-icons/fi";
import "../provider.css";
import { useLanguage } from "../../LanguageContext";
// import logo from "../../../public/logo.png";
const logoPath = "/logo.png";

const ProviderBookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBookingDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
            const token = localStorage.getItem("token");

            const response = await fetch(`${baseUrl}api/bookings/provider/${id}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                const b = data.data || data;

                // Map API status to UI status
                let uiStatus = b.status || "Pending";
                if (uiStatus.toLowerCase() === "created") uiStatus = "Pending";

                // Map payment status
                let payStatus = "Payment Held";
                if (b.status === "Completed") payStatus = "Awaiting Approval";
                if (b.status === "Approved") payStatus = "Released";

                const price = b.price || b.service?.price || 0;

                const mappedBooking = {
                    id: b._id || b.id,
                    status: uiStatus,
                    serviceTitle: b.service?.name || "General Service",
                    category: b.service?.category?.name || b.service?.categoryName || b.service?.category || "General Service",
                    duration: b.service?.duration || "N/A",
                    type: "On-site service",
                    date: b.date ? new Date(b.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "TBD",
                    time: b.date ? new Date(b.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD",
                    location: b.location || "Location not provided",
                    specialInstructions: b.notes || "No special instructions provided.",
                    createdAt: b.createdAt,
                    updatedAt: b.updatedAt,
                    timeline: [
                        { status: "Created", date: b.createdAt ? new Date(b.createdAt).toLocaleString() : "TBD", completed: true, active: false },
                        { status: b.status === "Created" ? "Awaiting Accept" : "Accepted", date: "Recently", completed: b.status !== "Created", active: b.status === "Accepted" },
                        { status: "In Progress", date: "Service status", completed: ["In Progress", "Completed", "Approved"].includes(b.status), active: b.status === "In Progress" },
                        { status: "Completed", date: "Final status", completed: ["Completed", "Approved"].includes(b.status), active: b.status === "Completed" }
                    ],
                    client: {
                        name: b.client?.name || "Client",
                        email: b.client?.email || "",
                        rating: b.client?.rating ?? b.client?.averageRating ?? 0,
                        reviews: b.client?.reviews ?? b.client?.totalReviews ?? 0,
                        initials: b.client?.name?.charAt(0) || "C",
                        createdAt: b.client?.createdAt,
                        location: b.client?.location || b.client?.address,
                        bio: b.client?.bio,
                        avatar: b.client?.avatar || b.client?.profileImage,
                        totalBookings: b.client?.totalBookings || 1
                    },
                    payment: {
                        servicePrice: price,
                        platformFee: -price * 0.1,
                        clientTotal: price,
                        earnings: price * 0.9,
                        status: payStatus
                    }
                };
                setBooking(mappedBooking);
            } else {
                throw new Error(data.message || "Failed to fetch booking details");
            }
        } catch (err) {
            console.error("Error fetching booking details:", err);
            setError("Failed to load booking details. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchBookingDetails();
    }, [fetchBookingDetails]);

    const [modal, setModal] = useState({ show: false, title: '', message: '', type: 'info' });
    const [showClientModal, setShowClientModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    const handleMarkCompleted = async () => {
        try {
            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
            const token = localStorage.getItem("token");

            const response = await fetch(`${baseUrl}api/bookings/${id}/complete`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to mark booking as completed");
            }

            // Update local state
            setBooking(prev => ({
                ...prev,
                status: "Completed",
                timeline: prev.timeline.map(step => {
                    if (step.status === "In Progress") return { ...step, completed: true, active: false };
                    if (step.status === "Completed") return { ...step, completed: true, active: true, date: new Date().toLocaleString() };
                    return step;
                }),
                payment: { ...prev.payment, status: "Awaiting Approval" }
            }));

            setModal({ show: true, title: 'Service Completed', message: 'The booking has been successfully marked as completed.', type: 'success' });
        } catch (err) {
            console.error("Error completing booking:", err);
            setModal({ show: true, title: 'Error', message: err.message || 'Failed to update booking status.', type: 'error' });
        }
    };

    const openClientProfile = () => {
        if (!booking?.client) return;
        setSelectedClient({
            name: booking.client.name,
            avatar: booking.client.avatar || null,
            email: booking.client.email,
            initials: booking.client.initials,
            memberSince: booking.client.createdAt ? new Date(booking.client.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "New Member",
            totalBookings: booking.client.totalBookings,
            rating: booking.client.rating,
            location: booking.client.location || "Local Area",
            bio: booking.client.bio || "Registered client on ServiceHub."
        });
        setShowClientModal(true);
    };

    if (loading) {
        return (
            <div className="dashboard-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
                <div style={{ textAlign: "center" }}>
                    <FiLoader className="spin-animation" size={48} color="#2563eb" />
                    <p style={{ marginTop: "16px", color: "#64748b", fontWeight: "500" }}>Loading booking details...</p>
                    <style>{`
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                        .spin-animation {
                            animation: spin 1s linear infinite;
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="dashboard-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
                <div style={{ textAlign: "center", maxWidth: "400px", padding: "32px", background: "white", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
                    <FiAlertTriangle size={48} color="#ef4444" style={{ marginBottom: "16px" }} />
                    <h2 style={{ marginBottom: "8px", color: "#1e293b" }}>Oops!</h2>
                    <p style={{ color: "#64748b", marginBottom: "24px" }}>{error || "Booking not found"}</p>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button className="back-btn" style={{ flex: 1, justifyContent: "center" }} onClick={() => navigate("/provider/bookings")}>Go Back</button>
                        <button className="primary-btn" style={{ flex: 1 }} onClick={fetchBookingDetails}>Retry</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            {/* Top Header */}
            <div className="details-header-row">
                <div className="dh-left">
                    <button className="back-btn" onClick={() => navigate("/provider/bookings")}>
                        <FiArrowLeft /> All Bookings
                    </button>
                    <h1 className="dh-id">#{booking.id}</h1>
                    <span className="status-badge-lg">{booking.status}</span>
                </div>
            </div>

            <div className="details-grid">
                {/* Left Column: Summary & Progress */}
                <div className="details-main-col">

                    {/* Booking Summary Card */}
                    <div className="info-card">
                        <h3 className="card-title">Booking Summary</h3>

                        <div className="service-header-block">
                            <div className="service-img-thumb">
                                <img src={logoPath} alt="Service" />
                            </div>
                            <div>
                                <h2 className="service-full-title">{booking.serviceTitle}</h2>
                                <div className="service-tags">
                                    <span className="tag-pill">{booking.category}</span>
                                    <span className="tag-text"><FiClock /> {booking.duration}</span>
                                    <span className="tag-text"><FiMapPin /> {booking.type}</span>
                                </div>
                            </div>
                        </div>

                        <div className="info-row-grid">
                            <div className="info-item">
                                <label>Service Date</label>
                                <div className="info-val"><FiCalendar /> {booking.date}</div>
                            </div>
                            <div className="info-item">
                                <label>Time</label>
                                <div className="info-val"><FiClock /> {booking.time}</div>
                            </div>
                            <div className="info-item full-width">
                                <label>Location</label>
                                <div className="info-val"><FiMapPin /> {booking.location}</div>
                            </div>
                        </div>

                        <div className="special-instr-box">
                            <label>Special Instructions</label>
                            <p>{booking.specialInstructions}</p>
                        </div>
                    </div>

                    {/* Progress Timeline */}
                    <div className="info-card">
                        <h3 className="card-title">Progress</h3>
                        <div className="timeline-container">
                            {booking.timeline.map((step, index) => (
                                <div key={index} className={`timeline-step ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}>
                                    <div className="step-marker">
                                        <div className="dot"></div>
                                        {index !== booking.timeline.length - 1 && <div className="line"></div>}
                                    </div>
                                    <div className="step-content">
                                        <h4 className="step-title">{step.status}</h4>
                                        <p className="step-desc">{step.description || step.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {(booking.status === "In Progress" || booking.status === "Accepted") && (
                            <button className="mark-complete-btn" onClick={handleMarkCompleted}>
                                <FiCheckCircle /> Mark as Completed
                            </button>
                        )}
                    </div>

                </div>

                {/* Right Column: Client & Payment */}
                <div className="details-sidebar-col">

                    {/* Client Details */}
                    <div className="info-card center-align">
                        <h3 className="card-title left">Client Details</h3>
                        <div className="client-avatar-xl" onClick={openClientProfile} style={{ cursor: "pointer" }}>{booking.client.initials}</div>
                        <h4 className="client-name-lg" onClick={openClientProfile} style={{ cursor: "pointer" }}>{booking.client.name}</h4>
                        <div className="client-rating">
                            ⭐ {booking.client.rating ? booking.client.rating.toFixed(1) : "0.0"} <span>({booking.client.reviews} {t?.('sd_reviews_label') || "reviews"})</span>
                        </div>
                        <div style={{ marginTop: "8px", marginBottom: "16px" }}>
                            <span
                                className="link"
                                style={{ fontSize: "14px", fontWeight: "600", color: "#2563eb", cursor: "pointer" }}
                                onClick={openClientProfile}
                            >
                                View Client Profile
                            </span>
                        </div>

                    </div>

                    {/* Payment Details */}
                    <div className="info-card">
                        <h3 className="card-title">Payment Details</h3>
                        <div className="payment-rows">
                            <div className="pay-row">
                                <span>Service price</span>
                                <span>${booking.payment.servicePrice.toFixed(2)}</span>
                            </div>
                            <div className="pay-row divider">
                                <span>Client total</span>
                                <span>${booking.payment.clientTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="earnings-box">
                            <span>Your Earnings</span>
                            <span className="amount">${booking.payment.earnings.toFixed(2)}</span>
                        </div>

                        <div className="payment-status-badge">
                            <FiClock /> {booking.payment.status}
                        </div>

                        <div className="payment-note">
                            <FiShield /> Payment will be released to your account within 24 hours after the client approves service completion.
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="info-card plain">
                        <h3 className="card-title">Booking Information</h3>
                        <div className="meta-list">
                            <div className="meta-row">
                                <span>Booking date</span>
                                <span>{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "TBD"}</span>
                            </div>
                            {booking.status !== "Pending" && (
                                <div className="meta-row">
                                    <span>Accepted on</span>
                                    <span>{booking.updatedAt ? new Date(booking.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}</span>
                                </div>
                            )}
                            <div className="meta-row">
                                <span>Category</span>
                                <span>{booking.category}</span>
                            </div>
                        </div>

                        <div className="sidebar-footer-actions">
                            <button className="text-btn" onClick={() => navigate("/provider/help")}>Need Help?</button>
                        </div>
                    </div>

                </div>
            </div>

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

                        <div style={{ padding: "0 32px 32px", marginTop: "-50px", textAlign: "center", position: "relative", zIndex: 1 }}>
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
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Modal */}
            {modal.show && (
                <div className="modal-overlay">
                    <div className="provider-modal-content" style={{ maxWidth: "400px", padding: "32px", textAlign: "center" }}>
                        <div style={{
                            width: "64px",
                            height: "64px",
                            backgroundColor: modal.type === 'error' ? "#fef2f2" : "#dcfce7",
                            color: modal.type === 'error' ? "#ef4444" : "#10b981",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px"
                        }}>
                            {modal.type === 'error' ? <FiAlertCircle size={32} /> : (modal.type === 'success' ? <FiCheckCircle size={32} /> : <FiInfo size={32} />)}
                        </div>
                        <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "12px", color: "#1e293b" }}>{modal.title}</h2>
                        <p style={{ color: "#64748b", marginBottom: "32px", lineHeight: "1.6" }}>
                            {modal.message}
                        </p>
                        <button
                            className="primary-btn"
                            style={{ width: "100%", padding: "12px" }}
                            onClick={() => setModal({ ...modal, show: false })}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderBookingDetails;
