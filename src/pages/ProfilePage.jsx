import React, { useState, useEffect } from 'react';
import Header from "../Component/Home/Navbar/Navbar";
import { FiUser, FiMail, FiMapPin, FiCalendar, FiEdit2, FiShield, FiStar, FiClock, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import CustomDialog from '../Component/UI/CustomDialog';
import { useLanguage } from '../LanguageContext';
import '../user.css';

const UserProfile = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: ''
    });
    const [updateLoading, setUpdateLoading] = useState(false);
    const [dialogConfig, setDialogConfig] = useState({
        isOpen: false,
        type: 'info',
        title: '',
        message: ''
    });

    const showDialog = (type, title, message) => {
        setDialogConfig({ isOpen: true, type, title, message });
    };

    const closeDialog = () => {
        setDialogConfig(prev => ({ ...prev, isOpen: false }));
    };

    useEffect(() => {
        console.log("UserProfile component mounted");
        const fetchUserProfile = async () => {
            try {
                const userId = localStorage.getItem('userId');
                const token = localStorage.getItem('token');
                const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

                if (!userId) {
                    setError("User ID not found. Please log in.");
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${baseUrl}api/users/${userId}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error("Failed to fetch user profile");

                const data = await response.json();
                console.log("Raw Profile Response:", data);

                // Robust data extraction (handles data.data.user, data.user, data.data, or data)
                const userData = data.user || data.data?.user || data.data || data;

                if (userData) {
                    setUser(userData);
                    setFormData({
                        name: userData.name || ''
                    });
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError("Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateProfile = async () => {
        setUpdateLoading(true);
        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

            if (!userId) {
                throw new Error("User ID not found. Please log in again.");
            }

            console.log(`Attempting profile update for user: ${userId}`);

            const response = await fetch(`${baseUrl}api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log("Update Response:", data);

            if (!response.ok) {
                throw new Error(data.message || "Failed to update profile");
            }

            // SUCCESS - Extract updated data robustly
            const updatedUser = data.user || data.data?.user || data.data || data;

            // Sync local state with the actual data we sent (or returned from server)
            const newName = formData.name || updatedUser?.name;

            setUser(prev => ({
                ...prev,
                ...updatedUser,
                name: newName || prev.name
            }));

            // Sync updated name to localStorage
            if (formData.name) {
                localStorage.setItem('loginName', formData.name);
            }

            setIsEditing(false);
            showDialog('success', t('profile_updated'), t('profile_updated_msg'));

        } catch (err) {
            console.error("Error updating profile:", err);
            showDialog('error', t('profile_update_failed'), err.message || "Failed to update profile. Please try again.");
        } finally {
            setUpdateLoading(false);
        }
    };

    const inputStyle = {
        padding: "0.75rem",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
        fontSize: "0.95rem",
        outline: "none",
    };

    const cancelBtn = {
        padding: "0.6rem 1.2rem",
        background: "transparent",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        cursor: "pointer",
        color: "#64748b",
    };

    const InfoRow = ({ label, value }) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{label}</span>
            <span style={{ fontWeight: "500", color: "#334155" }}>{value}</span>
        </div>
    );

    const StatCard = ({ title, value, color }) => (
        <div
            style={{
                background: "#f8fafc",
                padding: "1.5rem",
                borderRadius: "12px",
                textAlign: "center",
            }}
        >
            <span
                style={{
                    display: "block",
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: color,
                }}
            >
                {value}
            </span>
            <span style={{ fontSize: "0.9rem", color: "#64748b" }}>{title}</span>
        </div>
    );

    if (loading) {
        return (
            <div className="dashboard-page">
                <Header />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: '#64748b' }}>
                    {t('profile_loading')}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-page">
                <Header />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
                    <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
                    <button className="primary-btn" onClick={() => window.location.reload()}>{t('profile_retry')}</button>
                    <button className="secondary-btn" onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>{t('profile_go_back')}</button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page" style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <Header />

            <CustomDialog
                isOpen={dialogConfig.isOpen}
                type={dialogConfig.type}
                title={dialogConfig.title}
                message={dialogConfig.message}
                onClose={closeDialog}
            />

            <div className="profile-container">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: "transparent",
                        border: "none",
                        color: "#64748b",
                        cursor: "pointer",
                        marginBottom: "2rem",
                        fontSize: "0.95rem",
                    }}
                >
                    <FiArrowLeft /> {t('profile_back')}
                </button>

                {/* GRID LAYOUT */}
                <div className="profile-grid">
                    {/* ================= LEFT: PROFILE CARD ================= */}
                    <div
                        className="profile-card-padding"
                        style={{
                            background: "white",
                            borderRadius: "20px",
                            padding: "2.5rem",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "2rem",
                        }}
                    >
                        {/* Profile Header */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                flexWrap: "wrap",
                                gap: "1.5rem",
                            }}
                        >
                            <div className="profile-header-content" style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                                {/* Avatar */}
                                <div
                                    style={{
                                        width: "90px",
                                        height: "90px",
                                        borderRadius: "50%",
                                        background: "#eff6ff",
                                        color: "#2563eb",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "2rem",
                                        fontWeight: "bold",
                                        flexShrink: 0
                                    }}
                                >
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    ) : (
                                        user.name?.charAt(0) || "U"
                                    )}
                                </div>

                                {/* User Info */}
                                <div style={{ minWidth: 0 }}>
                                    <h1
                                        style={{
                                            fontSize: "1.6rem",
                                            fontWeight: "700",
                                            color: "#1e293b",
                                            marginBottom: "0.4rem",
                                            wordBreak: "break-word"
                                        }}
                                    >
                                        {user.name}
                                    </h1>

                                    <p
                                        style={{
                                            color: "#64748b",
                                            fontSize: "0.95rem",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.5rem",
                                            wordBreak: "break-all"
                                        }}
                                    >
                                        <FiMail /> {user.email}
                                    </p>

                                    <span
                                        style={{
                                            marginTop: "0.75rem",
                                            background: "#dcfce7",
                                            color: "#166534",
                                            padding: "0.3rem 0.9rem",
                                            borderRadius: "20px",
                                            fontSize: "0.75rem",
                                            fontWeight: "600",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "0.3rem",
                                        }}
                                    >
                                        <FiShield />
                                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)} {t('profile_account')}
                                    </span>
                                </div>
                            </div>

                            {!isEditing && (
                                <div className="profile-header-actions">
                                    <button
                                        className="primary-btn"
                                        onClick={() => setIsEditing(true)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.5rem",
                                            padding: "0.6rem 1.2rem",
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        <FiEdit2 /> {t('profile_edit')}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div style={{ height: "1px", background: "#e2e8f0" }} />

                        {/* Personal Info */}
                        <div style={{ overflow: "hidden" }}>
                            <h3
                                style={{
                                    fontSize: "1rem",
                                    fontWeight: "600",
                                    color: "#1e293b",
                                    marginBottom: "1.5rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                }}
                            >
                                <FiUser /> {t('profile_personal_info')}
                            </h3>

                            {isEditing ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder={t('profile_full_name')}
                                        style={inputStyle}
                                    />

                                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
                                        <button
                                            className="primary-btn"
                                            onClick={handleUpdateProfile}
                                            disabled={updateLoading}
                                            style={{ flex: "1 1 auto", minWidth: "120px" }}
                                        >
                                            {updateLoading ? t('profile_saving') : t('profile_save')}
                                        </button>

                                        <button
                                            onClick={() => setIsEditing(false)}
                                            style={{ ...cancelBtn, flex: "1 1 auto", minWidth: "100px" }}
                                        >
                                            {t('sd_cancel')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <InfoRow label={t('profile_full_name')} value={user.name} />
                                    <InfoRow label={t('profile_email')} value={user.email} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ================= RIGHT: STATS CARD ================= */}
                    <div
                        className="profile-card-padding"
                        style={{
                            background: "white",
                            borderRadius: "20px",
                            padding: "2rem",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
                            height: "fit-content",
                        }}
                    >
                        <h3
                            style={{
                                fontSize: "1rem",
                                fontWeight: "600",
                                color: "#1e293b",
                                marginBottom: "1.5rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                            }}
                        >
                            <FiCalendar /> {t('profile_stats')}
                        </h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <StatCard title={t('profile_bookings')} value={user.bookingsCount || 0} color="#3b82f6" />
                            <StatCard title={t('profile_reviews')} value={user.reviewsCount || 0} color="#eab308" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
