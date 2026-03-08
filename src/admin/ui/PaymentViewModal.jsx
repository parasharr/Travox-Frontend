import {
    FiX,
    FiCreditCard,
    FiUser,
    FiBriefcase,
    FiTag,
    FiCalendar,
    FiHash,
    FiShield,
    FiActivity,
} from "react-icons/fi";
import { useLanguage } from "../../LanguageContext";
import { useState, useEffect } from "react";

export default function PaymentViewModal({ open, payment, onClose, onRefresh }) {
    const { t } = useLanguage();
    const [newSettlementStatus, setNewSettlementStatus] = useState(payment?.settlementStatus || "");
    const [updatingSettlement, setUpdatingSettlement] = useState(false);
    const [pendingStatus, setPendingStatus] = useState("");

    const [releasing, setReleasing] = useState(false);
    const [providerDetails, setProviderDetails] = useState(null);
    const [loadingProvider, setLoadingProvider] = useState(false);
    const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'info' });
    const [confirmConfig, setConfirmConfig] = useState({ show: false, title: '', message: '', onConfirm: null, icon: null });

    useEffect(() => {
        if (payment) {
            setNewSettlementStatus(payment.settlementStatus);
            fetchProviderDetails();
        } else {
            setProviderDetails(null);
        }
    }, [payment]);

    const fetchProviderDetails = async () => {
        if (!payment?.providerId) return;
        setLoadingProvider(true);
        try {
            const token = localStorage.getItem("token");
            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
            const response = await fetch(`${baseUrl}api/admin/users/${payment.providerId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProviderDetails(data);
            }
        } catch (err) {
            console.error("Error fetching provider details:", err);
        } finally {
            setLoadingProvider(false);
        }
    };

    if (!open || !payment) return null;

    const handleRelease = async () => {
        setConfirmConfig({
            show: true,
            title: t('admin_payments_pvm_release') || "Release Funds",
            message: t('admin_payments_pvm_release_hint') || "Are you sure you want to release funds to the provider?",
            icon: <FiShield size={32} />,
            onConfirm: performRelease
        });
    };

    const performRelease = async () => {
        setConfirmConfig(prev => ({ ...prev, show: false }));
        setReleasing(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

            const response = await fetch(`${baseUrl}api/admin/settlements`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ paymentId: payment._id })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to release payment");
            }

            setNotification({
                show: true,
                title: "Success",
                message: "Funds released successfully!",
                type: "success"
            });
            setTimeout(() => {
                if (onRefresh) onRefresh();
                onClose();
            }, 1500);
        } catch (err) {
            setNotification({
                show: true,
                title: "Error",
                message: err.message,
                type: "error"
            });
        } finally {
            setReleasing(false);
        }
    };


    const triggerUpdateStatus = (status) => {
        setPendingStatus(status);
        setConfirmConfig({
            show: true,
            title: "Confirm Status Change",
            message: `Are you sure you want to change the settlement status to ${status}?`,
            icon: <FiActivity size={32} />,
            onConfirm: () => handleUpdateSettlementStatus(status)
        });
    };

    const handleUpdateSettlementStatus = async (statusOverride) => {
        setConfirmConfig(prev => ({ ...prev, show: false }));
        const statusToUpdate = statusOverride || pendingStatus || newSettlementStatus;

        const payload = {
            status: statusToUpdate,
            settlementStatus: statusToUpdate
        };

        setNewSettlementStatus(statusToUpdate);
        setUpdatingSettlement(true);
        try {
            const token = localStorage.getItem("token");
            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

            console.log(`Updating status to ${statusToUpdate} at ${baseUrl}api/admin/payments/${payment._id}/settlement-status`);

            const response = await fetch(`${baseUrl}api/admin/payments/${payment._id}/settlement-status`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                // Handle known backend bug where it updates DB but returns 500
                if (response.status === 500) {
                    console.warn("Server returned 500. Refreshing UI to check if update succeeded anyway.");
                    setNotification({
                        show: true,
                        title: "Update Requested",
                        message: "Status change requested. If it doesn't reflect immediately, please wait a moment.",
                        type: "info"
                    });
                    setTimeout(() => {
                        if (onRefresh) onRefresh();
                        onClose();
                    }, 2000);
                    return;
                }

                let errorMsg = `Error ${response.status}: ${response.statusText}`;
                try {
                    const errData = await response.json();
                    errorMsg = errData.error || errData.message || errorMsg;
                } catch (e) {
                    // Not JSON
                }
                throw new Error(errorMsg);
            }

            setNotification({
                show: true,
                title: "Updated",
                message: "Status updated successfully!",
                type: "success"
            });
            setTimeout(() => {
                if (onRefresh) onRefresh();
                onClose();
            }, 1500);
        } catch (err) {
            console.error("Status update failed:", err);
            setNotification({
                show: true,
                title: "Update Failed",
                message: err.message,
                type: "error"
            });
        } finally {
            setUpdatingSettlement(false);
        }
    };

    const amountVal = (payment.amount || 0) / 100;
    const feeVal = amountVal * 0.1;
    const netVal = amountVal - feeVal;
    const dateStr = new Date(payment.createdAt).toLocaleString();
    const isReady = payment.status === "PAID" && payment.settlementStatus === "UNSETTLED";

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div
                className="admin-modal"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "600px", padding: 0, overflow: "hidden" }}
            >
                {/* HEADER */}
                <div className="admin-modal-header" style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", margin: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "40px", height: "40px", background: "#e0e7ff", color: "#4f46e5", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                            <FiCreditCard />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#1e293b", fontWeight: "700" }}>{t('admin_payments_pvm_title') || "Payment Details"}</h3>
                            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                                {t('admin_payments_pvm_id') || "Internal ID"}: {payment._id}
                            </p>
                        </div>
                    </div>
                    <FiX onClick={onClose} className="modal-close" style={{ cursor: 'pointer', fontSize: '20px', color: '#64748b' }} />
                </div>

                {/* BODY */}
                <div className="admin-modal-body" style={{ padding: "32px 24px", overflowY: "auto", maxHeight: "70vh", display: "flex", flexDirection: "column", gap: "24px" }}>

                    {/* TOP IDS & DATE */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                                <FiHash style={{ marginRight: "4px" }} /> {t('admin_payments_pvm_pay_intent') || "Stripe ID"}
                            </span>
                            <span style={{ fontSize: "13px", color: "#1e293b", fontWeight: "600", wordBreak: "break-all" }}>{payment.paymentIntentId || "N/A"}</span>
                        </div>
                        <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "100px", border: "1px solid #e2e8f0", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <FiCalendar style={{ color: "#64748b" }} />
                            <span style={{ fontSize: "13px", color: "#1e293b", fontWeight: "600" }}>{dateStr}</span>
                        </div>
                    </div>

                    {/* CUSTOMER & PROVIDER */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div style={{ border: "1px solid #e5e7eb", borderRadius: "14px", padding: "16px" }}>
                            <h4 style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                                <FiUser /> {t('admin_payments_pvm_cust') || "Customer Info"}
                            </h4>
                            <div style={{ fontSize: "14px", color: "#1e293b", fontWeight: "600" }}>{payment.customerName}</div>
                            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>ID: {payment.customerId}</div>
                        </div>
                        <div style={{ border: "1px solid #e5e7eb", borderRadius: "14px", padding: "16px" }}>
                            <h4 style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                                <FiBriefcase /> {t('admin_payments_pvm_prov') || "Provider Info"}
                            </h4>
                            <div style={{ fontSize: "14px", color: "#1e293b", fontWeight: "600" }}>{payment.providerName}</div>
                            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>ID: {payment.providerId}</div>
                        </div>
                    </div>

                    {/* BANK DETAILS (IF ANY) */}
                    {providerDetails?.bankDetails && (
                        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px" }}>
                            <h4 style={{ fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                                <FiCreditCard /> {t('pset_bank_details') || "Bank Account Details"}
                            </h4>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div>
                                    <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>{t('pset_bank_name')}</label>
                                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{providerDetails.bankDetails.bankName || "N/A"}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>{t('pset_account_number')}</label>
                                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{providerDetails.bankDetails.accountNumber || "N/A"}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>{t('pset_ifsc_code')}</label>
                                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{providerDetails.bankDetails.ifscCode || "N/A"}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>{t('pset_account_holder')}</label>
                                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{providerDetails.bankDetails.accountHolderName || "N/A"}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AMOUNT DETAILS */}
                    <div style={{ background: "#f0fdf4", border: "1px solid #dcfce7", borderRadius: "14px", padding: "20px" }}>
                        <h4 style={{ fontSize: "12px", fontWeight: "700", color: "#166534", textTransform: "uppercase", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                            <FiTag /> {t('admin_payments_pvm_amount') || "Amount Details"}
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "#166534", fontSize: "14px" }}>{t('admin_payments_pvm_total') || "Total Paid"}</span>
                                <span style={{ fontWeight: "700", color: "#166534" }}>₹{amountVal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "#166534", fontSize: "14px" }}>{t('admin_payments_pvm_fee') || "Platform Fee"}</span>
                                <span style={{ color: "#166534" }}>- ₹{feeVal.toFixed(2)}</span>
                            </div>
                            <div style={{ height: "1px", background: "#dcfce7", margin: "4px 0" }}></div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem" }}>
                                <span style={{ fontWeight: "700", color: "#166534" }}>{t('admin_payments_pvm_net') || "Net Earnings"}</span>
                                <span style={{ fontWeight: "800", color: "#166534" }}>₹{netVal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* SETTLEMENT ALERT / ACTION */}
                    {isReady && (
                        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#1e40af" }}>
                                <FiShield />
                                <span style={{ fontSize: "13px", fontWeight: "600" }}>{t('admin_payments_pvm_release') || "Release Funds to Provider"}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: "12px", color: "#1e40af", opacity: 0.8 }}>
                                {t('admin_payments_pvm_release_hint') || "This will transfer the net earnings to the provider's Stripe account."}
                            </p>
                            <button
                                onClick={handleRelease}
                                disabled={releasing}
                                style={{
                                    height: "44px",
                                    borderRadius: "10px",
                                    background: "#2563eb",
                                    color: "#fff",
                                    border: "none",
                                    fontWeight: "700",
                                    cursor: releasing ? "not-allowed" : "pointer"
                                }}
                            >
                                {releasing ? "..." : t('admin_payments_pvm_release') || "Release Funds"}
                            </button>
                        </div>
                    )}

                    {/* STATUS UPDATER - Premium Redesign */}
                    <div style={{
                        background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "16px",
                        padding: "24px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h4 style={{ fontSize: "12px", fontWeight: "800", color: "#4f46e5", textTransform: "uppercase", margin: 0, display: "flex", alignItems: "center", gap: "8px", letterSpacing: "0.05em" }}>
                                <FiActivity /> {t('admin_payments_pvm_update') || "Update Status"}
                            </h4>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <div style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "6px", background: "#f1f5f9", color: "#64748b", fontWeight: "700" }}>{payment.status}</div>
                                <div style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "6px", background: "#e0e7ff", color: "#4338ca", fontWeight: "700" }}>{payment.settlementStatus}</div>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                            {['UNSETTLED', 'SETTLED', 'PAID', 'FAILED', 'HOLD', 'PENDING'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => triggerUpdateStatus(status)}
                                    disabled={updatingSettlement || payment.settlementStatus === status}
                                    style={{
                                        padding: "12px 8px",
                                        borderRadius: "10px",
                                        border: "1px solid",
                                        borderColor: payment.settlementStatus === status ? "#4f46e5" : "#e2e8f0",
                                        background: payment.settlementStatus === status ? "#f5f3ff" : "#fff",
                                        color: payment.settlementStatus === status ? "#4f46e5" : "#475569",
                                        fontSize: "11px",
                                        fontWeight: "700",
                                        cursor: payment.settlementStatus === status || updatingSettlement ? "default" : "pointer",
                                        transition: "all 0.2s ease",
                                        opacity: payment.settlementStatus === status ? 1 : (updatingSettlement ? 0.5 : 1),
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "4px",
                                        boxShadow: payment.settlementStatus === status ? "0 4px 6px -1px rgba(79, 70, 229, 0.1)" : "none"
                                    }}
                                    onMouseEnter={e => {
                                        if (payment.settlementStatus !== status && !updatingSettlement) {
                                            e.currentTarget.style.borderColor = "#4f46e5";
                                            e.currentTarget.style.background = "#fbfaff";
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (payment.settlementStatus !== status && !updatingSettlement) {
                                            e.currentTarget.style.borderColor = "#e2e8f0";
                                            e.currentTarget.style.background = "#fff";
                                        }
                                    }}
                                >
                                    {status}
                                    <div style={{
                                        width: "6px",
                                        height: "6px",
                                        borderRadius: "50%",
                                        background: payment.settlementStatus === status ? "#4f46e5" : "transparent"
                                    }}></div>
                                </button>
                            ))}
                        </div>

                        {updatingSettlement && (
                            <div style={{ marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#4f46e5", fontSize: "12px", fontWeight: "600" }}>
                                <div style={{ width: "12px", height: "12px", border: "2px solid #4f46e5", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
                                {t('admin_ui_sem_btn_saving') || "Updating..."}
                            </div>
                        )}
                        <style>{`
                            @keyframes spin {
                                to { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="admin-modal-actions" style={{ padding: "20px 24px", borderTop: "1px solid #f1f5f9", background: "#f8fafc" }}>
                    <button className="btn-secondary" onClick={onClose} style={{ width: "100%", height: "48px", borderRadius: "12px", fontWeight: "600" }}>
                        {t('admin_payments_pvm_close') || "Close Details"}
                    </button>
                </div>

                {/* Custom Confirmation Modal */}
                {confirmConfig.show && (
                    <div style={{
                        position: "absolute",
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(15, 23, 42, 0.4)",
                        backdropFilter: "blur(8px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 150,
                        padding: "20px"
                    }}>
                        <div style={{
                            background: "#fff",
                            borderRadius: "24px",
                            padding: "40px 32px",
                            width: "100%",
                            maxWidth: "360px",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
                            textAlign: "center",
                            animation: "modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
                        }}>
                            <div style={{
                                width: "72px",
                                height: "72px",
                                background: "#fef3c7",
                                color: "#d97706",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 24px"
                            }}>
                                {confirmConfig.icon || <FiActivity size={32} />}
                            </div>
                            <h4 style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", margin: "0 0 12px 0" }}>{confirmConfig.title}</h4>
                            <p style={{ fontSize: "15px", color: "#64748b", margin: "0 0 32px 0", lineHeight: "1.6" }}>
                                {confirmConfig.message}
                            </p>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <button
                                    onClick={() => setConfirmConfig({ ...confirmConfig, show: false })}
                                    style={{
                                        flex: 1,
                                        padding: "14px",
                                        borderRadius: "14px",
                                        border: "1px solid #e2e8f0",
                                        background: "#fff",
                                        color: "#475569",
                                        fontWeight: "700",
                                        fontSize: "14px",
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmConfig.onConfirm}
                                    style={{
                                        flex: 2,
                                        padding: "14px",
                                        borderRadius: "14px",
                                        border: "none",
                                        background: "#4f46e5",
                                        color: "#fff",
                                        fontWeight: "700",
                                        fontSize: "14px",
                                        cursor: "pointer",
                                        boxShadow: "0 8px 16px rgba(79, 70, 229, 0.25)",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Custom Notification Modal */}
                {notification.show && (
                    <div style={{
                        position: "absolute",
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(15, 23, 42, 0.4)",
                        backdropFilter: "blur(8px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 200,
                        padding: "20px"
                    }}>
                        <div style={{
                            background: "#fff",
                            borderRadius: "24px",
                            padding: "40px 32px",
                            width: "100%",
                            maxWidth: "360px",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
                            textAlign: "center",
                            animation: "modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
                        }}>
                            <div style={{
                                width: "72px",
                                height: "72px",
                                background: notification.type === 'success' ? "#dcfce7" : (notification.type === 'error' ? "#fee2e2" : "#e0e7ff"),
                                color: notification.type === 'success' ? "#16a34a" : (notification.type === 'error' ? "#dc2626" : "#4f46e5"),
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 24px"
                            }}>
                                {notification.type === 'success' ? <FiActivity size={32} /> : (notification.type === 'error' ? <FiX size={32} /> : <FiActivity size={32} />)}
                            </div>
                            <h4 style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", margin: "0 0 12px 0" }}>{notification.title}</h4>
                            <p style={{ fontSize: "15px", color: "#64748b", margin: "0 0 32px 0", lineHeight: "1.6" }}>
                                {notification.message}
                            </p>
                            <button
                                onClick={() => setNotification({ ...notification, show: false })}
                                style={{
                                    width: "100%",
                                    padding: "14px",
                                    borderRadius: "14px",
                                    border: "none",
                                    background: "#1e293b",
                                    color: "#fff",
                                    fontWeight: "700",
                                    fontSize: "14px",
                                    cursor: "pointer",
                                    boxShadow: "0 8px 16px rgba(15, 23, 42, 0.2)",
                                    transition: "all 0.2s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes modalPop {
                        from { opacity: 0; transform: scale(0.9) translateY(20px); }
                        to { opacity: 1; transform: scale(1) translateY(0); }
                    }
                `}</style>
            </div>
        </div>
    );
}
