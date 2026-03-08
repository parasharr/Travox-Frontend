import { useState, useEffect } from "react";
import { FiX, FiMapPin, FiUser, FiTag, FiClock, FiDollarSign } from "react-icons/fi";
import { useLanguage } from "../../LanguageContext";

export default function ServiceViewModal({ open, onClose, serviceId }) {
    const { t } = useLanguage();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open && serviceId) {
            fetchServiceDetails();
        } else {
            // Reset state when closed
            setData(null);
            setLoading(true);
            setError(null);
        }
    }, [open, serviceId]);

    const fetchServiceDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

            const response = await fetch(`${baseUrl}api/services/${serviceId}`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });

            if (!response.ok) {
                throw new Error("Failed to fetch service details");
            }

            const result = await response.json();
            console.log("Service View Modal Data:", result); // Debugging log
            setData(result);
        } catch (err) {
            console.error("Error fetching service details:", err);
            setError("Failed to load service details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div
                className="admin-modal"
                onClick={e => e.stopPropagation()}
                style={{
                    maxWidth: "700px",
                    padding: "0",
                    overflow: "hidden"
                }}
            >
                {/* HEADER */}
                <div className="admin-modal-header" style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", margin: 0 }}>
                    <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#1e293b" }}>{t('admin_services_svm_title') || "Service Details"}</h3>
                    <FiX className="modal-close" size={24} onClick={onClose} />
                </div>

                {/* BODY */}
                <div style={{ padding: "24px", overflowY: "auto", maxHeight: "75vh", flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>

                    {loading ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>{t('admin_services_svm_loading') || "Loading details..."}</div>
                    ) : error ? (
                        <div style={{ padding: "20px", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", textAlign: "center" }}>
                            {error}
                        </div>
                    ) : data ? (
                        <>
                            {/* IMAGE COVER */}
                            <div style={{ width: "100%", height: "200px", borderRadius: "12px", overflow: "hidden", background: "#f1f5f9", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                {data.image || data.thumbnail ? (
                                    <img
                                        src={data.image || data.thumbnail}
                                        alt={data.name}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : (
                                    <div style={{
                                        width: "100%", height: "100%",
                                        background: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        flexDirection: "column", gap: "8px"
                                    }}>
                                        <FiTag size={40} color="#3b82f6" style={{ opacity: 0.5 }} />
                                        <span style={{ fontSize: "1.2rem", fontWeight: "600", color: "#3b82f6", textAlign: 'center', padding: '0 10px' }}>
                                            {data.name || data.service}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* TITLE & HEADER INFO */}
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px", flexWrap: 'wrap', gap: '8px' }}>
                                    <h2 style={{ fontSize: "1.5rem", margin: 0, color: "#0f172a" }}>{data.name || data.service}</h2>
                                    <span style={{
                                        padding: "4px 12px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "600",
                                        background: data.isActive ? "#dcfce7" : "#fee2e2",
                                        color: data.isActive ? "#16a34a" : "#dc2626"
                                    }}>
                                        {data.isActive ? (t('admin_services_svm_active') || "Active") : (t('admin_services_svm_inactive') || "Inactive")}
                                    </span>
                                </div>
                                <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
                                    {data.description || (t('admin_services_svm_no_desc') || "No description provided.")}
                                </p>
                            </div>

                            {/* GRID DETAILS */}
                            <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", padding: "20px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>

                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", border: "1px solid #e2e8f0", flexShrink: 0 }}>
                                        <FiUser size={20} />
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <span style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>{t('admin_services_svm_provider') || "PROVIDER"}</span>
                                        <span style={{ display: "block", color: "#334155", fontWeight: "600", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {data.provider?.name || data.providerName || (t('admin_services_svm_na') || "N/A")}
                                        </span>
                                        {data.provider?.email && (
                                            <span style={{ display: "block", fontSize: "0.8rem", color: "#64748b", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.provider.email}</span>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6", border: "1px solid #e2e8f0", flexShrink: 0 }}>
                                        <FiTag size={20} />
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <span style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>{t('admin_services_svm_category') || "CATEGORY"}</span>
                                        <span style={{ color: "#334155", fontWeight: "500", display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.category?.name || (t('admin_services_svm_uncategorized') || "Uncategorized")}</span>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981", border: "1px solid #e2e8f0", flexShrink: 0 }}>
                                        <FiDollarSign size={20} />
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <span style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>{t('admin_services_svm_price_duration') || "PRICE & DURATION"}</span>
                                        <span style={{ color: "#334155", fontWeight: "500", display: 'block' }}>${data.price} <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>• {data.duration || (t('admin_services_svm_na') || "N/A")}</span></span>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b", border: "1px solid #e2e8f0", flexShrink: 0 }}>
                                        <FiClock size={20} />
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <span style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>{t('admin_services_svm_created') || "CREATED"}</span>
                                        <span style={{ color: "#334155", fontWeight: "500", display: 'block' }}>{new Date(data.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                            </div>
                        </>
                    ) : null}

                </div>

                <div className="admin-modal-actions" style={{ padding: '0 24px 24px' }}>
                    <button className="btn-cancel" onClick={onClose}>{t('admin_services_svm_close') || "Close Details"}</button>
                </div>
            </div>
        </div>
    );
}
