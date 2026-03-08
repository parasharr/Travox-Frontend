import { FiAlertTriangle, FiX } from "react-icons/fi";
import { useLanguage } from "../../LanguageContext";

export default function ConfirmDeleteModal({ open, onClose, onConfirm, categoryName }) {
    const { t } = useLanguage();

    if (!open) return null;

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div
                className="admin-modal"
                onClick={e => e.stopPropagation()}
            >

                {/* Header */}
                <div style={{ display: "flex", alignItems: "start", gap: "16px" }}>
                    <div style={{
                        background: "#fee2e2",
                        color: "#dc2626",
                        width: "48px", height: "48px",
                        borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0
                    }}>
                        <FiAlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: "0 0 8px 0", fontSize: "1.1rem", color: "#111827", fontWeight: "600" }}>{t('admin_services_cdm_title') || "Deactivate Category?"}</h3>
                        <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", lineHeight: "1.5" }}>
                            {t('admin_services_cdm_msg_1') || "Are you sure you want to deactivate"} <b>{categoryName}</b>?
                            <br /><br />
                            {t('admin_services_cdm_msg_2') || "This action will mark the category as inactive but will"} <b>{t('admin_services_cdm_msg_3') || "not permanently delete"}</b> {t('admin_services_cdm_msg_4') || "it to preserve historical data."}
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="admin-modal-actions" style={{ marginTop: "8px" }}>
                    <button
                        className="btn-cancel"
                        onClick={onClose}
                    >
                        {t('admin_services_cdm_cancel') || "Cancel"}
                    </button>
                    <button
                        className="btn-primary"
                        onClick={onConfirm}
                        style={{ background: "#dc2626" }}
                    >
                        {t('admin_services_cdm_confirm') || "Deactivate"}
                    </button>
                </div>

            </div>
        </div>
    );
}
