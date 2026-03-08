import {
  FiX,
  FiCalendar,
  FiUser,
  FiBriefcase,
  FiTag,
  FiMail,
  FiAlignLeft, // For Notes
  FiAlertCircle, // For Cancellation
} from "react-icons/fi";
import { useLanguage } from "../../LanguageContext";

export default function BookingViewDialog({ open, booking, onClose }) {
  const { t } = useLanguage();

  if (!open || !booking) return null;

  // Access the raw API data passed mainly via 'original' property, fall back to mapped props
  const raw = booking.original || {};
  const client = raw.client || {};
  const provider = raw.provider || {};
  const service = raw.service || {};

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "650px", padding: 0, overflow: "hidden" }}
      >
        {/* HEADER */}
        <div className="admin-modal-header" style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", margin: 0 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#1e293b" }}>{t('admin_bookings_bvm_title') || "Booking Details"}</h3>
            <p className="sub-text" style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#64748b" }}>
              {t('admin_bookings_bvm_id') || "ID:"} {raw._id || booking.id}
            </p>
          </div>
          <FiX onClick={onClose} className="modal-close" />
        </div>

        {/* CONTENT */}
        <div
          className="admin-modal-body"
          style={{
            padding: "24px",
            overflowY: "auto",
            maxHeight: "75vh",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* DATE & STATUS BAR */}
          <div
            className="status-bar"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#f8fafc",
              padding: "12px 16px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              className="date-group"
              style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569", fontSize: "0.9rem" }}
            >
              <FiCalendar />
              <span>
                {raw.date
                  ? new Date(raw.date).toLocaleString()
                  : booking.date?.toLocaleString()}
              </span>
            </div>
            <span className={`status-pill ${booking.status?.toLowerCase()}`}>
              {booking.status}
            </span>
          </div>

          {/* PEOPLE GRID */}
          <div
            className="people-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {/* CLIENT */}
            <div
              className="person-card"
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <div
                className="card-label"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#64748b",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "12px",
                  fontWeight: "700",
                }}
              >
                <FiUser /> {t('admin_bookings_bvm_client') || "Client"}
              </div>
              <div className="person-details">
                <strong style={{ display: "block", fontSize: "1rem", color: "#1e293b" }}>
                  {client.name || booking.client}
                </strong>
                {client.email && (
                  <div
                    className="email-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#64748b",
                      fontSize: "0.85rem",
                      marginTop: "6px",
                      wordBreak: "break-all",
                    }}
                  >
                    <FiMail size={14} style={{ flexShrink: 0 }} /> <span>{client.email}</span>
                  </div>
                )}
                <small
                  style={{
                    display: "block",
                    marginTop: "10px",
                    color: "#94a3b8",
                    fontSize: "0.75rem",
                    wordBreak: "break-all",
                  }}
                >
                  ID: {client._id}
                </small>
              </div>
            </div>

            {/* PROVIDER */}
            <div
              className="person-card"
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <div
                className="card-label"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#64748b",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "12px",
                  fontWeight: "700",
                }}
              >
                <FiBriefcase /> {t('admin_bookings_bvm_provider') || "Provider"}
              </div>
              <div className="person-details">
                <strong style={{ display: "block", fontSize: "1rem", color: "#1e293b" }}>
                  {provider.name || booking.provider}
                </strong>
                {provider.email && (
                  <div
                    className="email-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#64748b",
                      fontSize: "0.85rem",
                      marginTop: "6px",
                      wordBreak: "break-all",
                    }}
                  >
                    <FiMail size={14} style={{ flexShrink: 0 }} /> <span>{provider.email}</span>
                  </div>
                )}
                <small
                  style={{
                    display: "block",
                    marginTop: "10px",
                    color: "#94a3b8",
                    fontSize: "0.75rem",
                    wordBreak: "break-all",
                  }}
                >
                  ID: {provider._id}
                </small>
              </div>
            </div>
          </div>

          {/* SERVICE DETAILS */}
          <div
            className="service-details-section"
            style={{
              background: "#f8fafc",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              className="section-label"
              style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", fontSize: "0.85rem", marginBottom: "12px", color: "#475569" }}
            >
              <FiTag /> {t('admin_bookings_bvm_service_info') || "Service Info"}
            </div>
            <div className="service-row" style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.95rem" }}>
              <span style={{ color: "#64748b" }}>{t('admin_bookings_bvm_service') || "Service:"}</span>
              <strong style={{ color: "#1e293b" }}>{service.name || booking.service}</strong>
            </div>
            <div className="service-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
              <span style={{ color: "#64748b" }}>{t('admin_bookings_bvm_price') || "Price:"}</span>
              <strong style={{ color: "#1e293b" }}>₹{raw.price || booking.amount}</strong>
            </div>
          </div>

          {/* NOTES / EXTRAS */}
          {raw.notes && (
            <div className="extra-section" style={{ marginTop: "4px" }}>
              <div className="section-label" style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", fontSize: "0.85rem", marginBottom: "8px", color: "#475569" }}>
                <FiAlignLeft /> {t('admin_bookings_bvm_notes') || "Notes"}
              </div>
              <p style={{ fontSize: "0.9rem", color: "#334155", lineHeight: "1.6", margin: 0 }}>{raw.notes}</p>
            </div>
          )}

          {raw.cancellationReason && (
            <div
              className="extra-section danger"
              style={{
                marginTop: "4px",
                color: "#991b1b",
                background: "#fef2f2",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #fee2e2",
              }}
            >
              <div className="section-label" style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", fontSize: "0.85rem", marginBottom: "8px" }}>
                <FiAlertCircle /> {t('admin_bookings_bvm_cancel_reason') || "Cancellation Reason"}
              </div>
              <p style={{ fontSize: "0.9rem", lineHeight: "1.6", margin: 0 }}>{raw.cancellationReason}</p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="admin-modal-actions" style={{ padding: "20px 24px", borderTop: "1px solid #f1f5f9" }}>
          <button className="btn-secondary" onClick={onClose} style={{ width: "100%", height: "48px", borderRadius: "12px" }}>
            {t('admin_bookings_bvm_close') || "Close Details"}
          </button>
        </div>
      </div>
    </div>
  );
}
