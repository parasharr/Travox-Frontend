import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../admin.css";
import { FiSearch, FiAlertCircle, FiX } from "react-icons/fi";
import { useLanguage } from "../../LanguageContext";

export default function Disputes() {
    const { t } = useLanguage();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [page, setPage] = useState(1);
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [resolution, setResolution] = useState("");
    const [resolveStatus, setResolveStatus] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const location = useLocation();
    const PAGE_SIZE = 10;

    /* =====================
       MODAL HANDLERS
    ===================== */
    const openReviewModal = (dispute) => {
        setSelectedDispute(dispute);
        setResolution(dispute.original.resolution || "");
        setResolveStatus(dispute.original.status || "pending");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedDispute(null);
        setResolution("");
        setResolveStatus("");
    };

    const handleCloseDispute = async () => {
        if (!selectedDispute || !resolution.trim()) {
            alert(t('admin_disputes_err_provide_res') || "Please provide a resolution before closing the dispute.");
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

            const response = await fetch(
                `${baseUrl}api/admin/disputes/${selectedDispute.original._id}/resolve`,
                {
                    method: "PATCH",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        status: resolveStatus,
                        resolution: resolution
                    })
                }
            );

            if (response.ok) {
                alert(t('admin_disputes_msg_res_success') || "Dispute resolved successfully!");
                closeModal();
                // Refresh disputes list
                const fetchResponse = await fetch(`${baseUrl}api/admin/disputes`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (fetchResponse.ok) {
                    const data = await fetchResponse.json();
                    setDisputes(Array.isArray(data) ? data : []);
                }
            } else {
                // Handle non-JSON error responses
                let errorMessage = `${t('admin_disputes_err_res_fail') || "Failed to resolve dispute"} (${response.status})`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // Response is not JSON (e.g., 404 HTML page)
                    if (response.status === 404) {
                        errorMessage = t('admin_disputes_err_api_missing') || "API endpoint not found. Please check if the backend route '/api/admin/disputes/:id/resolve' exists.";
                    } else {
                        errorMessage = `${errorMessage}: ${response.statusText}`;
                    }
                }
                alert(errorMessage);
            }
        } catch (error) {
            console.error("Error resolving dispute:", error);
            alert(t('admin_disputes_err_generic') || "An error occurred while resolving the dispute.");
        } finally {
            setSubmitting(false);
        }
    };

    /* =====================
       FETCH DISPUTES
    ===================== */
    useEffect(() => {
        const fetchDisputes = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

                const response = await fetch(`${baseUrl}api/admin/disputes`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        setDisputes(data);
                    } else {
                        console.warn("Disputes API returned non-array:", data);
                        setDisputes([]);
                    }
                } else {
                    console.error("Failed to fetch disputes:", response.status);
                }
            } catch (error) {
                console.error("Error fetching disputes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDisputes();
    }, [location.key]);

    /* =====================
       FILTER
    ===================== */
    const filtered = useMemo(() => {
        // Map API data to UI structure
        const mappedDisputes = disputes.map(d => {
            const daysAgo = Math.floor((new Date() - new Date(d.createdAt)) / 86400000);
            let daysText;
            if (daysAgo === 0) {
                daysText = t('admin_disputes_time_today') || "Today";
            } else if (daysAgo === 1) {
                daysText = t('admin_disputes_time_yesterday') || "Yesterday";
            } else {
                daysText = `${daysAgo} ${t('admin_disputes_time_days_ago') || "days ago"}`;
            }

            return {
                id: `#${(d._id || "").slice(-6).toUpperCase()}`,
                booking: (d.bookingId || t('admin_disputes_val_na') || "N/A"), // Shorten if it's an ID
                bookingIdDisplay: `#${(d.bookingId || "").slice(-6).toUpperCase()}`,
                date: new Date(d.createdAt).toLocaleDateString(),
                days: daysText,
                client: d.raisedByModel === 'User' ? (d.raisedBy?.name || t('admin_disputes_val_unknown') || "Unknown") : (t('admin_disputes_val_na') || "N/A"),
                provider: d.providerDetails?.name || d.providerDetails?.companyName || t('admin_disputes_val_na') || "N/A",
                service: t('admin_disputes_val_na') || "N/A",
                amount: t('admin_disputes_val_na') || "N/A",
                reason: d.reason || t('admin_disputes_val_no_reason') || "No reason",
                priority: "Medium", // Default
                status: d.status || "Open",
                assigned: "Unassigned", // Default
                original: d
            };
        });

        return mappedDisputes.filter((d) => {
            const matchSearch =
                d.id.toLowerCase().includes(search.toLowerCase()) ||
                d.client.toLowerCase().includes(search.toLowerCase()) ||
                d.booking.toLowerCase().includes(search.toLowerCase());

            const matchStatus =
                statusFilter === "All" || d.status.toLowerCase() === statusFilter.toLowerCase();

            return matchSearch && matchStatus;
        });
    }, [search, statusFilter, disputes]);

    /* =====================
       PAGINATION
    ===================== */
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h1>
                    {t('admin_disputes_title') || "Disputes & Refunds"}
                    <span className="danger-badge">{filtered.length} {t('admin_disputes_total') || "Total"}</span>
                </h1>
                <p>{t('admin_disputes_subtitle') || "Manage and resolve booking disputes."}</p>
            </div>

            {/* FILTER BAR - Reusing existing structure */}
            <div className="dispute-filters" style={{ marginTop: '20px' }}>

                <div className="status-tabs-container" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    {[
                        { key: "All", label: t('admin_disputes_status_all') || "All" },
                        { key: "open", label: t('admin_disputes_status_open') || "open" },
                        { key: "resolved", label: t('admin_disputes_status_resolved') || "resolved" },
                        { key: "escalated", label: t('admin_disputes_status_escalated') || "escalated" }
                    ].map(tObj => (
                        <button
                            key={tObj.key}
                            className={statusFilter === tObj.key ? "active-tab-btn" : "tab-btn"}
                            onClick={() => setStatusFilter(tObj.key)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: 'none',
                                background: statusFilter === tObj.key ? '#6366f1' : '#e2e8f0',
                                color: statusFilter === tObj.key ? 'white' : '#64748b',
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tObj.label}
                        </button>
                    ))}
                </div>

                <div className="cool-search">
                    <FiSearch />
                    <input
                        placeholder={t('admin_disputes_search_placeholder') || "Search by dispute ID, booking or client..."}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* TABLE */}
            <div className="dashboard-table-card">
                <div className="admin-table-wrapper">
                    {loading ? (
                        <p style={{ textAlign: "center", padding: "40px" }}>{t('admin_disputes_loading') || "Loading disputes..."}</p>
                    ) : (
                        <table className="dispute-table">
                            <thead>
                                <tr>
                                    <th>{t('admin_disputes_table_id') || "ID"}</th>
                                    <th>{t('admin_disputes_table_booking') || "Booking"}</th>
                                    <th>{t('admin_disputes_table_date') || "Date"}</th>
                                    <th>{t('admin_disputes_table_client') || "Client"}</th>
                                    <th>{t('admin_disputes_table_provider') || "Provider"}</th>
                                    {/* Service/Amount removed as they are not in API response */}
                                    <th>{t('admin_disputes_table_reason') || "Reason"}</th>
                                    <th>{t('admin_disputes_table_status') || "Status"}</th>
                                    <th>{t('admin_disputes_table_resolution') || "Resolution"}</th>
                                    <th>{t('admin_disputes_table_action') || "Action"}</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginated.length > 0 ? (
                                    paginated.map((d, i) => (
                                        <tr key={i} className="dispute-row">
                                            <td data-label="Dispute ID" className="dispute-id-cell"><b>{d.id}</b></td>
                                            <td data-label="Booking" className="link">{d.bookingIdDisplay}</td>

                                            <td data-label="Date">
                                                <div className="stack">
                                                    <span>{d.date}</span>
                                                    <small>{d.days}</small>
                                                </div>
                                            </td>

                                            <td data-label="Client">{d.client}</td>
                                            <td data-label="Provider">{d.provider}</td>
                                            <td data-label="Reason">{d.reason}</td>

                                            <td data-label="Status">
                                                <span className={`status ${d.status.toLowerCase().replace(" ", "")}`}>
                                                    {d.status}
                                                </span>
                                            </td>

                                            <td data-label="Resolution">{d.original.resolution || "-"}</td>

                                            <td data-label="Action" className="actions">
                                                <button
                                                    className="review-btn"
                                                    onClick={() => openReviewModal(d)}
                                                >
                                                    {t('admin_disputes_btn_review') || "Review"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>{t('admin_disputes_no_disputes') || "No disputes found"}</td>
                                    </tr>
                                )}
                            </tbody>

                        </table>
                    )}
                </div>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="pagination" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        {t('admin_disputes_page_prev') || "Prev"}
                    </button>
                    <span>
                        {t('admin_disputes_page_of')?.replace('{page}', page).replace('{totalPages}', totalPages) || `Page ${page} of ${totalPages}`}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        {t('admin_disputes_page_next') || "Next"}
                    </button>
                </div>
            )}

            {/* REVIEW MODAL */}
            {showModal && selectedDispute && (
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div
                        className="admin-modal"
                        onClick={e => e.stopPropagation()}
                        style={{
                            maxWidth: "750px",
                            width: "90%",
                            maxHeight: "90vh",
                            padding: 0,
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column"
                        }}
                    >
                        {/* Modal Header */}
                        <div
                            className="admin-modal-header"
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "20px 24px",
                                borderBottom: "1px solid #f1f5f9",
                                background: "#f8fafc",
                                margin: 0,
                                width: "100%",
                                boxSizing: "border-box",
                                flexShrink: 0
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                                <div style={{ width: "40px", height: "40px", background: "#ef4444", color: "white", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                                    <FiAlertCircle />
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#1e293b", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t('admin_disputes_modal_review_title') || "Review Dispute"} {selectedDispute.id}</h3>
                                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {t('admin_disputes_modal_booking') || "Booking"} {selectedDispute.bookingIdDisplay} • {t('admin_disputes_modal_raised') || "Raised"} {selectedDispute.days}
                                    </p>
                                </div>
                            </div>
                            <FiX
                                onClick={closeModal}
                                className="modal-close"
                                style={{
                                    flexShrink: 0,
                                    padding: "6px",
                                    marginLeft: "12px",
                                    fontSize: "24px",
                                    color: "#64748b",
                                    cursor: "pointer",
                                    background: "#fff",
                                    borderRadius: "8px",
                                    border: "1px solid #e2e8f0"
                                }}
                            />
                        </div>

                        {/* Modal Content */}
                        <div className="admin-modal-body" style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px", flex: 1 }}>
                            {/* User and Provider Details Side by Side / Stacked */}
                            <div className="details-container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                                {/* User Details */}
                                <div style={{ border: "1px solid #e5e7eb", borderRadius: "14px", background: "#f9fafb", overflow: "hidden" }}>
                                    <h4 style={{ fontSize: "14px", fontWeight: "700", padding: "12px 16px", background: "#fff", borderBottom: "1px solid #e5e7eb", margin: 0, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>{t('admin_disputes_modal_user_details') || "User Details"}</h4>
                                    <div style={{ padding: "16px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", gap: "12px" }}>
                                            <strong style={{ fontSize: "12px", color: "#64748b", flexShrink: 0 }}>{t('admin_disputes_modal_name') || "Name:"}</strong>
                                            <span style={{ fontSize: "14px", color: "#1e293b", fontWeight: "600", textAlign: "right" }}>{selectedDispute.original.userDetails?.name || t('admin_disputes_val_na') || "N/A"}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", gap: "12px" }}>
                                            <strong style={{ fontSize: "12px", color: "#64748b", flexShrink: 0 }}>{t('admin_disputes_modal_email') || "Email:"}</strong>
                                            <span style={{ fontSize: "13px", color: "#1e293b", fontWeight: "600", textAlign: "right", wordBreak: "break-all" }}>{selectedDispute.original.userDetails?.email || t('admin_disputes_val_na') || "N/A"}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                                            <strong style={{ fontSize: "12px", color: "#64748b", flexShrink: 0 }}>{t('admin_disputes_modal_raised_by') || "Raised By:"}</strong>
                                            <span style={{ fontSize: "14px", color: "#1e293b", fontWeight: "600", textAlign: "right" }}>{selectedDispute.original.raisedBy?.name || t('admin_disputes_val_na') || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Provider Details */}
                                <div style={{ border: "1px solid #e5e7eb", borderRadius: "14px", background: "#f9fafb", overflow: "hidden" }}>
                                    <h4 style={{ fontSize: "14px", fontWeight: "700", padding: "12px 16px", background: "#fff", borderBottom: "1px solid #e5e7eb", margin: 0, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>{t('admin_disputes_modal_provider_details') || "Provider Details"}</h4>
                                    <div style={{ padding: "16px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", gap: "12px" }}>
                                            <strong style={{ fontSize: "12px", color: "#64748b", flexShrink: 0 }}>{t('admin_disputes_modal_name') || "Name:"}</strong>
                                            <span style={{ fontSize: "14px", color: "#1e293b", fontWeight: "600", textAlign: "right" }}>{selectedDispute.original.providerDetails?.name || t('admin_disputes_val_na') || "N/A"}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", gap: "12px" }}>
                                            <strong style={{ fontSize: "12px", color: "#64748b", flexShrink: 0 }}>{t('admin_disputes_modal_company') || "Company:"}</strong>
                                            <span style={{ fontSize: "14px", color: "#1e293b", fontWeight: "600", textAlign: "right" }}>{selectedDispute.original.providerDetails?.companyName || t('admin_disputes_val_na') || "N/A"}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                                            <strong style={{ fontSize: "12px", color: "#64748b", flexShrink: 0 }}>{t('admin_disputes_modal_email') || "Email:"}</strong>
                                            <span style={{ fontSize: "13px", color: "#1e293b", fontWeight: "600", textAlign: "right", wordBreak: "break-all" }}>{selectedDispute.original.providerDetails?.email || t('admin_disputes_val_na') || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dispute Message */}
                            <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "14px", padding: "18px" }}>
                                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#92400e", margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>{t('admin_disputes_modal_dispute_reason') || "Dispute Reason"}</h4>
                                <p style={{ margin: 0, color: "#92400e", lineHeight: "1.6", fontSize: "0.95rem" }}>{selectedDispute.reason}</p>
                            </div>

                            {/* Status and Resolution */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
                                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <label htmlFor="status" style={{ fontWeight: "700", color: "#475569", fontSize: "13px", textTransform: "uppercase" }}>{t('admin_disputes_modal_decision_status') || "Decision Status"}</label>
                                    <select
                                        id="status"
                                        value={resolveStatus}
                                        onChange={(e) => setResolveStatus(e.target.value)}
                                        style={{ height: "48px", borderRadius: "12px", border: "1px solid #d1d5db", fontSize: "14px", width: "100%", padding: "0 12px" }}
                                    >
                                        <option value="pending">{t('admin_disputes_modal_status_pending') || "Pending"}</option>
                                        <option value="resolved">{t('admin_disputes_modal_status_resolved') || "Resolved"}</option>
                                        <option value="rejected">{t('admin_disputes_modal_status_rejected') || "Rejected"}</option>
                                    </select>
                                </div>

                                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <label htmlFor="resolution" style={{ fontWeight: "700", color: "#475569", fontSize: "13px", textTransform: "uppercase" }}>{t('admin_disputes_modal_resolution_details') || "Resolution Details"}</label>
                                    <textarea
                                        id="resolution"
                                        rows="4"
                                        placeholder={t('admin_disputes_modal_resolution_placeholder') || "Type resolution notes here..."}
                                        value={resolution}
                                        onChange={(e) => setResolution(e.target.value)}
                                        style={{ padding: "14px", borderRadius: "12px", border: "1px solid #d1d5db", fontSize: "14px", width: "100%", resize: "none", lineHeight: "1.5" }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="admin-modal-actions" style={{ padding: "20px 24px", borderTop: "1px solid #f1f5f9", background: "#f8fafc", margin: 0 }}>
                            <div className="modal-btn-group" style={{ display: "flex", gap: "12px", width: "100%" }}>
                                <button className="btn-secondary" onClick={closeModal} style={{ flex: 1, padding: "12px 16px", borderRadius: "12px", fontWeight: "600", fontSize: "14px" }}>{t('admin_disputes_modal_btn_cancel') || "Cancel"}</button>
                                <button
                                    className="btn-primary"
                                    onClick={handleCloseDispute}
                                    disabled={submitting}
                                    style={{
                                        flex: 2,
                                        padding: "12px 20px",
                                        background: "#1e293b",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "12px",
                                        fontWeight: "600",
                                        fontSize: "14px",
                                        cursor: submitting ? "not-allowed" : "pointer",
                                        opacity: submitting ? 0.7 : 1
                                    }}
                                >
                                    {submitting ? (t('admin_disputes_modal_btn_processing') || "Processing...") : (t('admin_disputes_modal_btn_submit') || "Submit Resolution")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
