import React, { useState, useEffect } from "react";
import { FiUser, FiLock, FiCamera, FiSave, FiCheckCircle, FiAlertCircle, FiInfo, FiCreditCard } from "react-icons/fi";
import "../provider.css";
import { useLanguage } from "../../LanguageContext";

const ProviderSettings = () => {
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        companyName: "",
        mobile: "",
        address: "",
        language: "",
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        accountHolderName: ""
    });

    const [loading, setLoading] = useState(true);
    const [providerId, setProviderId] = useState(null);

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [modal, setModal] = useState({ show: false, title: '', message: '', type: 'info' });
    const { t } = useLanguage();

    // Fetch provider details on component mount
    useEffect(() => {
        const fetchProviderDetails = async () => {
            try {
                const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
                const token = localStorage.getItem("token");

                // Use /me endpoint to get current logged-in provider
                const response = await fetch(`${baseUrl}api/providers/me`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    console.error('Failed to fetch provider details');
                    setLoading(false);
                    return;
                }

                const data = await response.json();

                // Store provider ID for future use
                if (data._id) {
                    setProviderId(data._id);
                }

                // Map API data to profileData state
                setProfileData({
                    name: data.name || "",
                    email: data.email || "",
                    companyName: data.companyName || "",
                    mobile: data.mobile || "",
                    address: data.address || "",
                    language: data.language || "",
                    bankName: data.bankDetails?.bankName || "",
                    accountNumber: data.bankDetails?.accountNumber || "",
                    ifscCode: data.bankDetails?.ifscCode || "",
                    accountHolderName: data.bankDetails?.accountHolderName || ""
                });

                setLoading(false);
            } catch (error) {
                console.error('Error fetching provider details:', error);
                setLoading(false);
            }
        };

        fetchProviderDetails();
    }, []);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        if (!providerId) {
            setModal({ show: true, title: "Error", message: "Provider ID not found.", type: 'error' });
            return;
        }

        try {
            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
            const token = localStorage.getItem("token");

            const response = await fetch(`${baseUrl}api/providers/${providerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...profileData,
                    bankDetails: {
                        bankName: profileData.bankName,
                        accountNumber: profileData.accountNumber,
                        ifscCode: profileData.ifscCode,
                        accountHolderName: profileData.accountHolderName
                    }
                })
            });

            if (!response.ok) {
                throw new Error("Failed to update profile");
            }

            setModal({ show: true, title: t('pset_profile_updated') || "Profile Updated", message: t('pset_profile_msg') || "Your profile has been updated successfully.", type: 'success' });
        } catch (error) {
            console.error('Error updating profile:', error);
            setModal({ show: true, title: "Update Failed", message: "Could not update profile. Please try again.", type: 'error' });
        }
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setModal({ show: true, title: t('pset_pass_mismatch'), message: t('pset_pass_mismatch_msg'), type: 'error' });
            return;
        }
        setModal({ show: true, title: t('pset_pass_changed'), message: t('pset_pass_msg'), type: 'success' });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    };

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="page-header-row">
                    <h1 className="page-title">{t('pset_title')}</h1>
                </div>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>{t('pset_loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="page-header-row">
                <h1 className="page-title">{t('pset_title')}</h1>
            </div>

            <div className="settings-grid">
                {/* Profile Settings */}
                <div className="settings-card">
                    <div className="settings-header">
                        <h3><FiUser /> {t('pset_profile_info')}</h3>
                    </div>
                    <div className="settings-body">
                        <form onSubmit={handleProfileSubmit}>
                            <div className="form-group">
                                <label>{t('pset_full_name')}</label>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={profileData.name}
                                    onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>{t('pset_email')}</label>
                                <input
                                    type="email"
                                    placeholder="yourname@example.com"
                                    value={profileData.email}
                                    onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>{t('pset_company')}</label>
                                <input
                                    type="text"
                                    placeholder="Your agency or company"
                                    value={profileData.companyName}
                                    onChange={e => setProfileData({ ...profileData, companyName: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label>{t('pset_mobile')}</label>
                                    <input
                                        type="tel"
                                        placeholder="+1..."
                                        value={profileData.mobile}
                                        onChange={e => setProfileData({ ...profileData, mobile: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('pset_language')}</label>
                                    <input
                                        type="text"
                                        placeholder="English, French, etc."
                                        value={profileData.language}
                                        onChange={e => setProfileData({ ...profileData, language: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>{t('pset_address')}</label>
                                <input
                                    type="text"
                                    placeholder="Street, City, Country"
                                    value={profileData.address}
                                    onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                                />
                            </div>

                            <div style={{ marginTop: "24px", marginBottom: "16px", fontWeight: "600", fontSize: "16px", color: "#1e293b", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <FiCreditCard /> {t('pset_bank_details')}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label>{t('pset_bank_name')}</label>
                                    <input
                                        type="text"
                                        placeholder={t('pset_bank_name_placeholder') || "e.g. State Bank of India"}
                                        value={profileData.bankName}
                                        onChange={e => setProfileData({ ...profileData, bankName: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('pset_account_number')}</label>
                                    <input
                                        type="text"
                                        placeholder={t('pset_account_number_placeholder') || "Enter account number"}
                                        value={profileData.accountNumber}
                                        onChange={e => setProfileData({ ...profileData, accountNumber: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label>{t('pset_ifsc_code')}</label>
                                    <input
                                        type="text"
                                        placeholder={t('pset_ifsc_placeholder') || "e.g. SBIN0001234"}
                                        value={profileData.ifscCode}
                                        onChange={e => setProfileData({ ...profileData, ifscCode: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('pset_account_holder')}</label>
                                    <input
                                        type="text"
                                        placeholder={t('pset_account_holder_placeholder') || "Enter account holder name"}
                                        value={profileData.accountHolderName}
                                        onChange={e => setProfileData({ ...profileData, accountHolderName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-actions" style={{ marginTop: '32px' }}>
                                <button type="submit" className="primary-btn" style={{ minWidth: '160px', padding: '12px 24px' }}>
                                    <FiSave style={{ marginRight: '8px' }} /> {t('pset_save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Password Settings */}
                <div className="settings-card">
                    <div className="settings-header">
                        <h3><FiLock /> {t('pset_change_password')}</h3>
                    </div>
                    <div className="settings-body">
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="form-group">
                                <label>{t('pset_current_password')}</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={passwordData.currentPassword}
                                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>{t('pset_new_password')}</label>
                                <input
                                    type="password"
                                    placeholder="At least 8 characters"
                                    required
                                    value={passwordData.newPassword}
                                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>{t('pset_confirm_password')}</label>
                                <input
                                    type="password"
                                    placeholder="Repeat new password"
                                    required
                                    value={passwordData.confirmPassword}
                                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                />
                            </div>

                            <div className="form-actions" style={{ marginTop: '32px' }}>
                                <button type="submit" className="primary-btn outline" style={{ width: '100%', padding: '12px', border: '1px solid #2563eb', color: '#2563eb', background: 'transparent' }}>
                                    {t('pset_update_password')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

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
                            {t('pset_got_it')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderSettings;
