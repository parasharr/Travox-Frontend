import { useState, useEffect } from "react";
import { FiX, FiUser, FiTag, FiDollarSign, FiClock, FiFileText, FiCheckCircle } from "react-icons/fi";
import { useLanguage } from "../../LanguageContext";

export default function ServiceEditModal({ open, onClose, serviceId, onUpdate }) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        duration: "",
        isActive: false,
        category: "",
        provider: {}
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open && serviceId) {
            fetchServiceDetails();
        } else {
            setFormData({
                name: "",
                description: "",
                price: "",
                duration: "",
                isActive: false,
                category: "",
                provider: {}
            });
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

            if (!response.ok) throw new Error("Failed to fetch service details");

            const result = await response.json();

            // Populate form with existing data
            setFormData({
                name: result.name || result.service || "",
                description: result.description || "",
                price: result.price || "",
                duration: result.duration || "",
                isActive: result.isActive || false,
                category: result.category || {},
                provider: result.provider || {}
            });

        } catch (err) {
            console.error("Error fetching service details:", err);
            setError("Failed to load service details.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem("token");
            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

            const response = await fetch(`${baseUrl}api/admin/services/${serviceId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    price: Number(formData.price),
                    duration: formData.duration,
                    isActive: formData.isActive
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Update failed:", response.status, response.statusText, errorData);
                throw new Error(`Failed to update service: ${response.status} ${errorData.message || ""}`);
            }

            // Success
            if (onUpdate) onUpdate();
            onClose();

        } catch (err) {
            console.error("Error updating service:", err);
            alert("Failed to update service. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
            display: "flex", justifyContent: "center", alignItems: "center",
            zIndex: 1200
        }} onClick={onClose}>

            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: "white",
                    borderRadius: "16px",
                    width: "90%",
                    maxWidth: "600px",
                    maxHeight: "90vh",
                    display: "flex", flexDirection: "column",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    overflow: "hidden"
                }}
            >
                {/* HEADER */}
                <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
                    <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#1e293b" }}>{t('admin_ui_sem_title') || "Edit Service"}</h3>
                    <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b", padding: "4px" }}><FiX size={24} /></button>
                </div>

                {/* BODY */}
                <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>{t('admin_ui_sem_loading') || "Loading details..."}</div>
                    ) : error ? (
                        <div style={{ padding: "20px", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", textAlign: "center" }}>{error}</div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                            {/* READ-ONLY PROVIDER INFO - Highlighting this section as requested */}
                            <div style={{ background: "#eff6ff", padding: "16px", borderRadius: "8px", border: "1px solid #dbeafe" }}>
                                <h4 style={{ margin: "0 0 12px 0", fontSize: "0.9rem", color: "#1e40af", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <FiUser size={16} /> {t('admin_ui_sem_prov_info') || "Provider Information (Read-Only)"}
                                </h4>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div>
                                        <label style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>{t('admin_ui_sem_name_tag') || "NAME"}</label>
                                        <div style={{ color: "#334155", fontWeight: "500" }}>{formData.provider?.name || "N/A"}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>{t('admin_ui_sem_company_tag') || "COMPANY"}</label>
                                        <div style={{ color: "#334155", fontWeight: "500" }}>{formData.provider?.companyName || "N/A"}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>{t('admin_ui_sem_email_tag') || "EMAIL"}</label>
                                        <div style={{ color: "#334155", fontWeight: "500" }}>{formData.provider?.email || "N/A"}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>{t('admin_ui_sem_cat_tag') || "CATEGORY"}</label>
                                        <div style={{ color: "#334155", fontWeight: "500" }}>{formData.category?.name || "N/A"}</div>
                                    </div>
                                </div>
                            </div>

                            {/* EDITABLE FIELDS */}
                            <div>
                                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", fontWeight: "500", color: "#334155" }}>{t('admin_ui_sem_svc_name') || "Service Name"}</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", fontWeight: "500", color: "#334155" }}>{t('admin_ui_sem_desc') || "Description"}</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", resize: "vertical" }}
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                <div>
                                    <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", fontWeight: "500", color: "#334155" }}>{t('admin_ui_sem_price') || "Price ($)"}</label>
                                    <div style={{ position: "relative" }}>
                                        <FiDollarSign style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            style={{ width: "100%", padding: "10px 10px 10px 32px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", fontWeight: "500", color: "#334155" }}>{t('admin_ui_sem_duration') || "Duration"}</label>
                                    <div style={{ position: "relative" }}>
                                        <FiClock style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                                        <input
                                            type="text"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleChange}
                                            placeholder={t('admin_ui_sem_duration_ph') || "e.g. 2 hours"}
                                            style={{ width: "100%", padding: "10px 10px 10px 32px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ACTIVE TOGGLE */}
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                <label className="switch" style={{ position: "relative", display: "inline-block", width: "40px", height: "24px" }}>
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                    />
                                    <span style={{
                                        position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
                                        backgroundColor: formData.isActive ? "#22c55e" : "#ccc",
                                        transition: ".4s", borderRadius: "24px"
                                    }}>
                                        <span style={{
                                            position: "absolute", content: '""', height: "16px", width: "16px",
                                            left: "4px", bottom: "4px", backgroundColor: "white",
                                            transition: ".4s", borderRadius: "50%",
                                            transform: formData.isActive ? "translateX(16px)" : "translateX(0)"
                                        }} />
                                    </span>
                                </label>
                                <span style={{ fontWeight: "500", color: formData.isActive ? "#16a34a" : "#64748b" }}>
                                    {formData.isActive ? (t('admin_ui_sem_active') || "Active Service") : (t('admin_ui_sem_inactive') || "Inactive Service")}
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    background: "#0f172a", color: "white", padding: "14px", borderRadius: "8px",
                                    border: "none", fontWeight: "600", fontSize: "1rem", cursor: "pointer",
                                    marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                    opacity: saving ? 0.7 : 1
                                }}
                            >
                                {saving ? (t('admin_ui_sem_btn_saving') || "Saving...") : <><FiCheckCircle /> {t('admin_ui_sem_btn_save') || "Save Changes"}</>}
                            </button>
                        </form>
                    )}
                </div>

            </div>
        </div>
    );
}
