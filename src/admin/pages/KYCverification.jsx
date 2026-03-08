import { useState, useMemo, useEffect } from "react";
import {
  FiSearch,
  FiFileText,
  FiCheckCircle,
  FiFlag,
  FiXCircle,
  FiEye,
  FiX,
  FiAlertCircle
} from "react-icons/fi";
import "../admin.css";
import { MdCancel } from "react-icons/md";
import { useLanguage } from "../../LanguageContext";

/* helper */
const daysAgo = (dateString) => {
  const d = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - d);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function KYCVerification() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  // Custom Modal States
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, kycId: null, docId: null, docType: '', rejectionReason: '' });
  const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'info' });

  // Fetch KYC Requests
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
        const response = await fetch(`${baseUrl}api/admin/kyc`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setRequests(data);
          }
        } else {
          console.error("Failed to fetch kyc requests");
        }
      } catch (error) {
        console.error("Error fetching kyc requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Open Review Modal
  const handleReview = (request) => {
    setSelectedRequest(request);
  };

  // Update Document Status
  const openConfirmModal = (kycId, docId, action, docType) => {
    setConfirmModal({ show: true, action, kycId, docId, docType, rejectionReason: '' });
  };

  const handleDocumentAction = async () => {
    const { action, kycId, docId } = confirmModal;
    setConfirmModal({ ...confirmModal, show: false });

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
      const response = await fetch(`${baseUrl}api/admin/kyc/${kycId}/document/${docId}/${action}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: action === 'reject' ? JSON.stringify({ reason: confirmModal.rejectionReason }) : undefined
      });

      if (response.ok) {
        // Update local state deeply
        const updatedDocStatus = action === 'approve' ? 'approved' : 'rejected';

        setRequests(prev => prev.map(req => {
          if (req._id === kycId) {
            const updatedDocs = req.documents.map(doc =>
              doc._id === docId ? { ...doc, status: updatedDocStatus } : doc
            );
            return { ...req, documents: updatedDocs };
          }
          return req;
        }));

        // Also update selectedRequest if it's open
        if (selectedRequest && selectedRequest._id === kycId) {
          const updatedDocs = selectedRequest.documents.map(doc =>
            doc._id === docId ? { ...doc, status: updatedDocStatus } : doc
          );
          setSelectedRequest({ ...selectedRequest, documents: updatedDocs });
        }

        setNotification({
          show: true,
          title: 'Action Successful',
          message: `The document has been successfully ${updatedDocStatus}.`,
          type: 'success'
        });
      } else {
        const err = await response.json();
        setNotification({
          show: true,
          title: 'Action Failed',
          message: err.message || `Failed to ${action} document`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing document:`, error);
      setNotification({
        show: true,
        title: 'Error',
        message: "An unexpected error occurred. Please try again.",
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };



  const filteredData = useMemo(() => {
    let data = [...requests];

    if (tab !== "All") {
      data = data.filter(d => {
        const status = d.status || "pending";
        return status.toLowerCase() === tab.toLowerCase();
      });
    }

    if (dateFilter !== "all") {
      const days = Number(dateFilter);
      const now = new Date();
      data = data.filter(d => {
        const date = new Date(d.submittedAt || d.createdAt || Date.now());
        return (now - date) / 86400000 <= days;
      });
    }

    if (search) {
      data = data.filter(d =>
        (d.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (d._id || "").toLowerCase().includes(search.toLowerCase()) ||
        (d.email || "").toLowerCase().includes(search.toLowerCase())
      );
    }

    data.sort((a, b) => {
      const dateA = new Date(a.submittedAt || a.createdAt || 0);
      const dateB = new Date(b.submittedAt || b.createdAt || 0);
      return sort === "newest" ? dateB - dateA : dateA - dateB;
    });

    return data;
  }, [requests, tab, search, dateFilter, sort]);

  return (
    <div className="dashboard-page">

      {/* HEADER */}
      <div className="page-header">
        <h1>
          {t('admin_kyc_title') || "KYC Verification"}
          <span className="kyc-badge">
            {requests.filter(i => (i.status || "pending") === "pending").length} {t('admin_kyc_pending_reviews') || "Pending Reviews"}
          </span>
        </h1>
      </div>

      {/* TABS */}
      <div className="kyc-tabs">
        {[
          { key: "All", label: t('admin_kyc_tab_all') || "All" },
          { key: "Pending", label: t('admin_kyc_tab_pending') || "Pending" },
          { key: "Approved", label: t('admin_kyc_tab_approved') || "Approved" },
          { key: "Rejected", label: t('admin_kyc_tab_rejected') || "Rejected" }
        ].map(tObj => (
          <span
            key={tObj.key}
            className={tab === tObj.key ? "active" : ""}
            onClick={() => setTab(tObj.key)}
          >
            {tObj.label}
          </span>
        ))}
      </div>

      {/* FILTER BAR */}
      <div className="kyc-filters">

        <div className="kyc-search">
          <FiSearch />
          <input
            placeholder={t('admin_kyc_search_placeholder') || "Search provider name or ID..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="kyc-filter-select">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">{t('admin_kyc_filter_date') || "Submission date"}</option>
            <option value="7">{t('admin_kyc_filter_7days') || "Last 7 days"}</option>
            <option value="14">{t('admin_kyc_filter_14days') || "Last 14 days"}</option>
            <option value="30">{t('admin_kyc_filter_30days') || "Last 30 days"}</option>
          </select>
        </div>

        <div className="kyc-filter-select">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">{t('admin_kyc_sort_newest') || "Newest first"}</option>
            <option value="oldest">{t('admin_kyc_sort_oldest') || "Oldest first"}</option>
          </select>
        </div>

      </div>

      {/* TABLE */}
      <div className="dashboard-table-card">
        <table className="kyc-table">
          <thead>
            <tr>
              <th>{t('admin_kyc_col_provider') || "Provider"}</th>
              <th>{t('admin_kyc_col_date') || "Submission Date"}</th>
              <th>{t('admin_kyc_col_docs') || "Documents"}</th>
              <th>{t('admin_kyc_col_status') || "Status"}</th>
              <th>{t('admin_kyc_col_actions') || "Actions"}</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>{t('admin_kyc_loading') || "Loading requests..."}</td></tr>
            )}

            {!loading && filteredData.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>{t('admin_kyc_no_requests') || "No KYC requests found."}</td></tr>
            )}

            {!loading && filteredData.map((item, i) => {
              const status = item.status || "pending";
              const docCount = item.documents ? item.documents.length : 0;
              const submittedDate = item.submittedAt || item.createdAt || new Date();

              return (
                <tr key={item._id || i}>


                  <td data-label="Provider">
                    <div className="provider">
                      <div className="avatar">
                        {(item.name || "P").split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="name">{item.name}</p>
                        <span className="id">#{item._id.substring(item._id.length - 6).toUpperCase()}</span>
                      </div>
                    </div>
                  </td>

                  <td data-label={t('admin_kyc_col_date') || "Submission Date"}>
                    <div className="kyc-date">
                      <span className="date">
                        {new Date(submittedDate).toLocaleDateString()}
                      </span>
                      <span className="muted">
                        {daysAgo(submittedDate)} {t('admin_kyc_days_ago') || "days ago"}
                      </span>
                    </div>
                  </td>


                  <td data-label={t('admin_kyc_col_docs') || "Documents"}>
                    <div className="doc-cell">
                      <div className="doc-icons">
                        <FiFileText title={`${docCount} Documents`} />
                        <span style={{ fontSize: "0.85rem", marginLeft: "5px" }}>{docCount} {t('admin_kyc_docs_count') || "Docs"}</span>
                      </div>
                    </div>
                  </td>

                  <td data-label={t('admin_kyc_col_status') || "Status"}>
                    <span
                      className={`status`}
                      style={{
                        textTransform: "capitalize",
                        fontWeight: "600",
                        color: status === "approved" ? "#16a34a" : status === "rejected" ? "#dc2626" : "#d97706",
                        background: status === "approved" ? "#dcfce7" : status === "rejected" ? "#fee2e2" : "#fef3c7",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "0.8rem",
                        display: "inline-block"
                      }}
                    >
                      {status === "approved" ? (t('admin_kyc_status_approved') || "Approved") : status === "rejected" ? (t('admin_kyc_status_rejected') || "Rejected") : (t('admin_kyc_status_pending') || "Pending")}
                    </span>
                  </td>

                  <td data-label={t('admin_kyc_col_actions') || "Actions"}>
                    <button
                      className="review-btn"
                      onClick={() => handleReview(item)}
                      style={{
                        padding: "8px 16px",
                        background: "#2563eb",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 2px 5px rgba(37, 99, 235, 0.2)"
                      }}
                    >
                      <FiEye /> {t('admin_kyc_action_review') || "Review"}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* REVIEW MODAL */}
      {selectedRequest && (
        <div className="admin-modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: "900px", maxHeight: "85vh", display: "flex", flexDirection: "column", padding: 0 }}>

            {/* Modal Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", borderTopLeftRadius: "16px", borderTopRightRadius: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", background: "#3b82f6", color: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "bold" }}>
                  {(selectedRequest.name || "U").charAt(0)}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.1rem", color: "#1e293b" }}>{t('admin_kyc_modal_title') || "KYC Review"}</h2>
                  <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                    {selectedRequest.name} <span style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem", marginLeft: "6px" }}>#{selectedRequest._id.substring(selectedRequest._id.length - 6).toUpperCase()}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedRequest(null)} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", padding: "8px", display: "flex", color: "#64748b", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#ef4444"} onMouseOut={e => e.currentTarget.style.color = "#64748b"}>
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: "24px", overflowY: "auto", maxHeight: "70vh", flex: 1, background: "#fff", display: "flex", flexDirection: "column", gap: "24px" }}>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", padding: "0 4px" }}>
                <h3 style={{ fontSize: "1.05rem", margin: 0, color: "#1e293b", fontWeight: "700" }}>{t('admin_kyc_modal_submitted_docs') || "Submitted Documents"}</h3>
                <span style={{ fontSize: "0.85rem", color: "#64748b", background: "#f1f5f9", padding: "4px 12px", borderRadius: "20px", fontWeight: "600" }}>
                  {selectedRequest.documents ? selectedRequest.documents.length : 0} {t('admin_kyc_modal_files') || "Files"}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {selectedRequest.documents && selectedRequest.documents.map((doc, idx) => (
                  <div key={doc._id || idx} style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "white", padding: "16px", display: "flex", alignItems: "center", gap: "24px", transition: "all 0.2s" }} className="doc-row-hover">

                    {/* 1. Doc Info (Left) */}
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      <div style={{ width: "42px", height: "42px", background: "#f8fafc", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0", flexShrink: 0 }}>
                        <FiFileText size={20} color="#3b82f6" />
                      </div>
                      <div>
                        <span style={{ fontWeight: "700", display: "block", fontSize: "0.95rem", color: "#1e293b" }}>{doc.documentType || "Document"}</span>
                        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{new Date(doc.uploadedAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* 2. File Info (Middle) */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }} className="doc-file-info">
                      {/* Rejection Reason if exists */}
                      {doc.rejectionReason && (
                        <div style={{ background: "#fff5f5", color: "#b91c1c", padding: "8px 12px", borderRadius: "8px", fontSize: "0.75rem", border: "1px solid #fecaca", display: "inline-flex", alignItems: "center", gap: "6px", alignSelf: "start" }}>
                          <FiAlertCircle size={14} />
                          <span>{doc.rejectionReason}</span>
                        </div>
                      )}

                      {/* File Link */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.85rem", color: "#475569", fontWeight: "500" }} className="doc-filename">
                          {doc.fileUrl ? doc.fileUrl.split("/").pop() : "No File"}
                        </span>
                        {doc.fileUrl && (
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "none", fontSize: "0.8rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px", background: "#eff6ff", padding: "6px 12px", borderRadius: "8px", whiteSpace: "nowrap" }}>
                            <FiEye size={14} /> {t('admin_kyc_modal_view') || "View"}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* 3. Actions (Right) */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }} className="doc-actions">
                      {doc.status === 'approved' ? (
                        <div style={{
                          padding: "8px 16px",
                          background: "#dcfce7",
                          border: "1px solid #16a34a",
                          color: "#16a34a",
                          borderRadius: "8px",
                          display: "flex", alignItems: "center", gap: "6px",
                          fontWeight: "600",
                          fontSize: "0.9rem"
                        }}>
                          <FiCheckCircle /> {t('admin_kyc_status_approved') || "Approved"}
                        </div>
                      ) : doc.status === 'rejected' ? (
                        <div style={{
                          padding: "8px 16px",
                          background: "#fee2e2",
                          border: "1px solid #dc2626",
                          color: "#b91c1c",
                          borderRadius: "8px",
                          display: "flex", alignItems: "center", gap: "6px",
                          fontWeight: "600",
                          fontSize: "0.9rem"
                        }}>
                          <FiXCircle /> {t('admin_kyc_status_rejected') || "Rejected"}
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => openConfirmModal(selectedRequest._id, doc._id, "approve", doc.documentType)}
                            disabled={actionLoading}
                            title="Approve"
                            style={{
                              padding: "8px 16px",
                              background: "white",
                              border: "1px solid #cbd5e1",
                              color: "#475569",
                              borderRadius: "8px",
                              cursor: actionLoading ? "not-allowed" : "pointer",
                              opacity: actionLoading ? 0.7 : 1,
                              display: "flex", alignItems: "center", gap: "6px",
                              fontWeight: "500",
                              transition: "all 0.2s"
                            }}
                            onMouseOver={e => !actionLoading && (e.currentTarget.style.borderColor = "#16a34a", e.currentTarget.style.color = "#16a34a", e.currentTarget.style.background = "#f0fdf4")}
                            onMouseOut={e => !actionLoading && (e.currentTarget.style.borderColor = "#cbd5e1", e.currentTarget.style.color = "#475569", e.currentTarget.style.background = "white")}
                          >
                            <FiCheckCircle /> {t('admin_kyc_modal_approve') || "Approve"}
                          </button>
                          <button
                            onClick={() => openConfirmModal(selectedRequest._id, doc._id, "reject", doc.documentType)}
                            disabled={actionLoading}
                            title="Reject"
                            style={{
                              padding: "8px 16px",
                              background: "white",
                              border: "1px solid #cbd5e1",
                              color: "#475569",
                              borderRadius: "8px",
                              cursor: actionLoading ? "not-allowed" : "pointer",
                              opacity: actionLoading ? 0.7 : 1,
                              display: "flex", alignItems: "center", gap: "6px",
                              fontWeight: "500",
                              transition: "all 0.2s"
                            }}
                            onMouseOver={e => !actionLoading && (e.currentTarget.style.borderColor = "#dc2626", e.currentTarget.style.color = "#dc2626", e.currentTarget.style.background = "#fef2f2")}
                            onMouseOut={e => !actionLoading && (e.currentTarget.style.borderColor = "#cbd5e1", e.currentTarget.style.color = "#475569", e.currentTarget.style.background = "white")}
                          >
                            <FiXCircle /> {t('admin_kyc_modal_reject') || "Reject"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {(!selectedRequest.documents || selectedRequest.documents.length === 0) && (
                  <div style={{ padding: "40px", textAlign: "center", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                    <FiFileText size={40} color="#94a3b8" style={{ marginBottom: "10px" }} />
                    <p style={{ color: "#64748b", margin: 0 }}>{t('admin_kyc_modal_no_docs') || "No documents uploaded yet."}</p>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="admin-modal-actions" style={{ padding: "20px 24px" }}>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "#1e293b",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "1rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.2s"
                }}
                onMouseOver={e => e.currentTarget.style.background = "#0f172a"}
                onMouseOut={e => e.currentTarget.style.background = "#1e293b"}
              >
                {t('admin_kyc_modal_close') || "Close Review"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="admin-modal-overlay">
          <div style={{ background: "white", borderRadius: "16px", width: "450px", padding: "32px", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
            <div style={{ width: "64px", height: "64px", backgroundColor: confirmModal.action === "approve" ? "#dcfce7" : "#fee2e2", color: confirmModal.action === "approve" ? "#16a34a" : "#dc2626", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              {confirmModal.action === "approve" ? <FiCheckCircle size={32} /> : <FiAlertCircle size={32} />}
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px", color: "#1e293b" }}>{confirmModal.action === "approve" ? (t('admin_kyc_confirm_approve_title') || "Approve Document?") : (t('admin_kyc_confirm_reject_title') || "Reject Document?")}</h2>
            <p style={{ color: "#64748b", marginBottom: confirmModal.action === 'reject' ? "16px" : "32px", lineHeight: "1.6" }}>
              {t('admin_kyc_confirm_msg_1') || "Are you sure you want to"} {confirmModal.action} {t('admin_kyc_confirm_msg_2') || "the"} <strong>{confirmModal.docType}</strong> {t('admin_kyc_confirm_msg_3') || "for this provider?"}
            </p>

            {confirmModal.action === 'reject' && (
              <div style={{ textAlign: "left", marginBottom: "32px" }}>
                <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569", marginBottom: "8px", display: "block" }}>{t('admin_kyc_reject_reason_label') || "Rejection Reason"}</label>
                <textarea
                  placeholder={t('admin_kyc_reject_reason_placeholder') || "e.g. Identity card is blurry or expired"}
                  value={confirmModal.rejectionReason}
                  onChange={(e) => setConfirmModal({ ...confirmModal, rejectionReason: e.target.value })}
                  style={{
                    width: "100%",
                    height: "100px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px",
                    outline: "none",
                    resize: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                  onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                className="btn-secondary"
                style={{ flex: 1, padding: "12px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                onClick={() => setConfirmModal({ ...confirmModal, show: false })}
              >
                {t('admin_kyc_confirm_cancel') || "Cancel"}
              </button>
              <button
                className="primary-btn"
                style={{ flex: 1, padding: "12px", background: confirmModal.action === "approve" ? "#16a34a" : "#dc2626", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                onClick={handleDocumentAction}
              >
                {confirmModal.action === "approve" ? (t('admin_kyc_confirm_btn_approve') || "Confirm Approve") : (t('admin_kyc_confirm_btn_reject') || "Confirm Reject")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notification.show && (
        <div className="admin-modal-overlay">
          <div style={{ background: "white", borderRadius: "16px", width: "400px", padding: "32px", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", overflowY: "auto", maxHeight: "70vh", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{
              width: "64px",
              height: "64px",
              backgroundColor: notification.type === 'success' ? "#dcfce7" : "#fee2e2",
              color: notification.type === 'success' ? "#16a34a" : "#dc2626",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px"
            }}>
              {notification.type === 'success' ? <FiCheckCircle size={32} /> : <FiAlertCircle size={32} />}
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "12px", color: "#1e293b" }}>{notification.title}</h2>
            <p style={{ color: "#64748b", marginBottom: "32px", lineHeight: "1.6" }}>
              {notification.message}
            </p>
            <button
              className="primary-btn"
              style={{ width: "100%", padding: "12px", background: "#334155", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
              onClick={() => setNotification({ ...notification, show: false })}
            >
              {t('admin_kyc_notif_got_it') || "Got it"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
