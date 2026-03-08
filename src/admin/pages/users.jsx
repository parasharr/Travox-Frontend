import { useState, useMemo, useEffect } from "react";
import { FiDownload, FiSearch } from "react-icons/fi";
import { FiMoreVertical, FiEye, FiEdit2, FiTrash2, FiX, FiCheck } from "react-icons/fi";
import "../admin.css";
import { useLanguage } from "../../LanguageContext";

const USERS_PER_PAGE = 5;

export default function Users() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

  // Tabs and Filters
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [role, setRole] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
        const response = await fetch(`${baseUrl}api/admin/users`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Verify if data is array
          if (Array.isArray(data)) {
            setUsers(data);
          } else {
            console.error("Users API did not return array:", data);
          }
        } else {
          console.error("Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch User Details & Open Modal
  const openModal = async (id, mode = 'view') => {
    setIsEditing(mode === 'edit');
    setShowModal(true);
    setModalLoading(true);
    setSelectedUser(null);
    setFormData({});

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
      const response = await fetch(`${baseUrl}api/admin/users/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user || data;
        setSelectedUser(user);
        setFormData(user); // Init form data
      } else {
        console.error("Failed to fetch user details");
        alert("Could not load user details.");
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      alert("Error loading user details.");
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save Changes
  const handleSave = async () => {
    if (!selectedUser?._id) return;
    setSaveLoading(true);

    try {
      const token = localStorage.getItem("token");
      const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

      const response = await fetch(`${baseUrl}api/admin/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        const userObj = updatedUser.user || updatedUser; // Handle potential response wrapper

        setUsers(prev => prev.map(u => u._id === userObj._id ? { ...u, ...userObj } : u));
        setSelectedUser(userObj);
        setIsEditing(false); // Switch back to view mode
      } else {
        const text = await response.text();
        try {
          const err = JSON.parse(text);
          alert(err.message || "Failed to update user.");
        } catch (e) {
          console.error("Non-JSON error:", text);
          alert("Failed to update user (Server Error).");
        }
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("An error occurred while saving.");
    } finally {
      setSaveLoading(false);
    }
  };

  // Toggle Block Status using specific API
  const handleToggleBlock = async () => {
    if (!selectedUser?._id) return;
    const isBlocking = selectedUser.isActive;
    const action = isBlocking ? 'block' : 'unblock';
    setBlockLoading(true);

    try {
      const token = localStorage.getItem("token");
      const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

      const response = await fetch(`${baseUrl}api/admin/users/${selectedUser._id}/${action}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const updatedUser = data.user || data;

        // Update main users list
        setUsers(prev => prev.map(u => u._id === updatedUser._id ? { ...u, isActive: updatedUser.isActive } : u));
        // Update local modal state
        setSelectedUser(prev => ({ ...prev, isActive: updatedUser.isActive }));
        setFormData(prev => ({ ...prev, isActive: updatedUser.isActive }));
      } else {
        const text = await response.text();
        try {
          const err = JSON.parse(text);
          alert(err.message || `Failed to ${action} user.`);
        } catch (e) {
          alert(`Failed to ${action} user (Server Error).`);
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert("An error occurred.");
    } finally {
      setBlockLoading(false);
    }
  };

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Initiate Delete
  const deleteUser = (id) => {
    setUserToDelete(id);
    setShowDeleteModal(true);
    setDeleteSuccess(false); // Reset success state
    setIsDeleting(false);
  };

  // Confirm Delete
  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
      const response = await fetch(`${baseUrl}api/admin/users/${userToDelete}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        setUsers(prev => prev.filter(u => u._id !== userToDelete));
        setDeleteSuccess(true);
        setTimeout(() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
          setIsDeleting(false);
          setDeleteSuccess(false);
        }, 1500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setIsDeleting(false);
        alert(errorData.message || "Failed to delete user.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setIsDeleting(false);
      alert("An error occurred while deleting the user.");
    }
  };

  // Export to CSV
  const handleExport = () => {
    if (!filteredUsers || filteredUsers.length === 0) {
      alert("No users to export.");
      return;
    }

    const headers = ["Name", "Email", "Role", "Status", "Registered", "Mobile", "Company"];
    const csvRows = [];
    csvRows.push(headers.join(","));

    filteredUsers.forEach(u => {
      const userType = (u.type || u.role || "User").toUpperCase();
      const userStatus = u.isActive ? "Active" : "Blocked";
      const row = [
        `"${u.name || ""}"`,
        `"${u.email || ""}"`,
        `"${userType}"`,
        `"${userStatus}"`,
        `"${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ""}"`,
        `"${u.mobile || ""}"`,
        `"${u.companyName || ""}"`
      ];
      csvRows.push(row.join(","));
    });

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const counts = useMemo(() => ({
    all: users.length,
    clients: users.filter(u => (u.type || u.role || "").toUpperCase() === "CLIENT").length,
    providers: users.filter(u => (u.type || u.role || "").toUpperCase() === "PROVIDER").length
  }), [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const userType = (u.type || u.role || "").toUpperCase();

      const tabMatch =
        tab === "All" ||
        (tab === "Clients" && userType === "CLIENT") ||
        (tab === "Providers" && userType === "PROVIDER");

      const searchMatch =
        (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (u._id || "").toLowerCase().includes(search.toLowerCase());

      const userStatus = u.isActive ? "Active" : "Blocked";
      const statusMatch = status === "All" || userStatus === status;

      // Filter dropdown match
      const roleMatch = role === "All" ||
        (role === "Client" && userType === "CLIENT") ||
        (role === "Provider" && userType === "PROVIDER");

      return tabMatch && searchMatch && statusMatch && roleMatch;
    });
  }, [users, tab, search, status, role]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, page]);

  return (
    <div className="users-page">

      {/* HEADER */}
      <div className="users-header">
        <h1>{t('admin_users_title') || "User Management"}</h1>
        <p>{t('admin_users_subtitle') || "Manage all platform users"}</p>
      </div>

      {/* TABS */}
      <div className="users-tabs premium-tabs">
        <button
          className={tab === "All" ? "active" : ""}
          onClick={() => { setTab("All"); setPage(1); }}
        >
          {t('admin_users_all') || "All"} <span>{counts.all}</span>
        </button>

        <button
          className={tab === "Clients" ? "active" : ""}
          onClick={() => { setTab("Clients"); setPage(1); }}
        >
          {t('admin_users_clients') || "Clients"} <span>{counts.clients}</span>
        </button>

        <button
          className={tab === "Providers" ? "active" : ""}
          onClick={() => { setTab("Providers"); setPage(1); }}
        >
          {t('admin_users_providers') || "Providers"} <span>{counts.providers}</span>
        </button>
      </div>

      {/* FILTERS */}
      <div className="users-filters premium-filters">

        <div className="users-searchbox">
          <FiSearch />
          <input
            type="text"
            placeholder={t('admin_users_search_placeholder') || "Search users..."}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="users-filter-select">
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="All">{t('admin_users_status') || "Status"}</option>
            <option value="Active">{t('admin_users_status_active') || "Active"}</option>
            <option value="Blocked">{t('admin_users_status_blocked') || "Blocked"}</option>
          </select>
        </div>

        <div className="users-filter-select">
          <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
            <option value="All">{t('admin_users_role') || "Role"}</option>
            <option value="Client">{t('admin_users_role_client') || "Client"}</option>
            <option value="Provider">{t('admin_users_role_provider') || "Provider"}</option>
          </select>
        </div>

        <button className="export-btn" onClick={handleExport}>
          <FiDownload /> {t('admin_users_export') || "Export"}
        </button>

      </div>
      <div className="users-table-card">
        <div className="users-table-scroll">
          <table className="users-table">
            <thead>
              <tr>
                <th>{t('admin_users_col_name') || "Name"}</th>
                <th>{t('admin_users_col_email') || "Email"}</th>
                <th>{t('admin_users_col_role') || "Role"}</th>
                <th>{t('admin_users_col_status') || "Status"}</th>
                <th>{t('admin_users_col_registration') || "Registration"}</th>
                <th>{t('admin_users_col_actions') || "Actions"}</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#666" }}>{t('admin_users_loading') || "Loading users..."}</td>
                </tr>
              )}

              {!loading && paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#666" }}>{t('admin_users_no_users') || "No users found."}</td>
                </tr>
              )}

              {!loading && paginatedUsers.map((u) => {
                const userType = (u.type || u.role || "User").toUpperCase();
                const userStatus = u.isActive ? "Active" : "Blocked";

                return (
                  <tr key={u._id}>
                    <td data-label="Name">
                      <div className="user-name">
                        <div className="avatar">
                          {(u.name || "U").split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <strong>{u.name || "Unknown"}</strong>
                          <span>#{u._id.substring(u._id.length - 6).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Email">{u.email}</td>
                    <td data-label={t('admin_users_col_role') || "Role"}>
                      <span className={`role ${userType === "PROVIDER" ? "provider" : "client"}`}>
                        {userType === "CLIENT" ? (t('admin_users_role_client') || "Client") : userType === "PROVIDER" ? (t('admin_users_role_provider') || "Provider") : userType}
                      </span>
                    </td>
                    <td data-label={t('admin_users_col_status') || "Status"}>
                      <span className={`status ${userStatus === "Active" ? "active" : "blocked"}`}>
                        {userStatus === "Active" ? (t('admin_users_status_active') || "Active") : (t('admin_users_status_blocked') || "Blocked")}
                      </span>
                    </td>
                    <td data-label={t('admin_users_col_registration') || "Registration"}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}</td>
                    <td data-label={t('admin_users_col_actions') || "Actions"}>
                      <div className="actions-col">
                        <button
                          className="icon-btn edit"
                          title={t('admin_users_view_details') || "View Details"}
                          onClick={() => openModal(u._id, 'view')}
                        >
                          <FiEye />
                        </button>
                        <button
                          className="icon-btn edit"
                          title={t('admin_users_edit_user') || "Edit User"}
                          onClick={() => openModal(u._id, 'edit')}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="icon-btn delete"
                          title={t('admin_users_delete') || "Delete"}
                          onClick={() => deleteUser(u._id)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="users-footer">
            <span>
              {t('admin_users_showing') || "Showing"} {filteredUsers.length > 0 ? (page - 1) * USERS_PER_PAGE + 1 : 0}–
              {Math.min(page * USERS_PER_PAGE, filteredUsers.length)} {t('admin_users_of') || "of"}{" "}
              {filteredUsers.length} {t('admin_users_users') || "users"}
            </span>

            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={page === p ? "active" : ""}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* USER DETAILS MODAL */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3>{isEditing ? (t('admin_users_modal_title_edit') || "Edit User") : (t('admin_users_modal_title_details') || "User Details")}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }}><FiX /></button>
            </div>

            {modalLoading ? (
              <p style={{ textAlign: "center", padding: "20px" }}>{t('admin_users_modal_loading') || "Loading details..."}</p>
            ) : selectedUser ? (
              <div className="user-details-content" style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: "4px" }}>
                <div style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "15px" }}>
                  <div style={{ width: "60px", height: "60px", background: "#f3f4f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold", flexShrink: 0, color: "#111827" }}>
                    {(selectedUser.name || "U").charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleChange}
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: "700",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          width: "100%",
                          outline: "none",
                          color: "#111827",
                          marginBottom: "4px"
                        }}
                      />
                    ) : (
                      <h4 style={{ margin: 0 }}>{selectedUser.name}</h4>
                    )}
                    <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>{selectedUser.email}</p>
                    <span className={`role ${(selectedUser.type || selectedUser.role || "").toLowerCase() === "provider" ? "provider" : "client"}`} style={{ fontSize: "0.75rem", padding: "2px 8px" }}>
                      {(selectedUser.type || selectedUser.role || "User").toUpperCase()}
                    </span>
                  </div>
                </div>

                <div style={{ display: "grid", gap: "12px", padding: "20px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #edf1f6" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <strong style={{ display: "block", fontSize: "0.8rem", color: "#64748b" }}>{t('admin_users_modal_language') || "Language"}</strong>
                      {isEditing ? (
                        <input type="text" name="language" value={formData.language || ""} onChange={handleChange} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", background: "#fff" }} />
                      ) : (
                        <span>{selectedUser.language || "N/A"}</span>
                      )}
                    </div>

                    <div>
                      <strong style={{ display: "block", fontSize: "0.8rem", color: "#64748b" }}>{t('admin_users_status') || "Status"}</strong>
                      {isEditing ? (
                        <select name="isActive" value={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", background: "#fff" }}>
                          <option value="true">{t('admin_users_status_active') || "Active"}</option>
                          <option value="false">{t('admin_users_status_blocked') || "Blocked"}</option>
                        </select>
                      ) : (
                        <span className={`status-pill ${selectedUser.isActive ? "active" : "blocked"}`}>{selectedUser.isActive ? (t('admin_users_status_active') || "Active") : (t('admin_users_status_blocked') || "Blocked")}</span>
                      )}
                    </div>

                    <div>
                      <strong style={{ display: "block", fontSize: "0.8rem", color: "#64748b" }}>{t('admin_users_modal_registered') || "Registered"}</strong>
                      <span>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}</span>
                    </div>
                  </div>

                  {(selectedUser.type || selectedUser.role || "").toUpperCase() === "PROVIDER" && (
                    <>
                      <hr style={{ margin: "8px 0", border: 0, borderTop: "1px solid #e2e8f0" }} />

                      <div>
                        <strong style={{ display: "block", fontSize: "0.8rem", color: "#64748b" }}>{t('admin_users_modal_company') || "Company"}</strong>
                        {isEditing ? (
                          <input type="text" name="companyName" value={formData.companyName || ""} onChange={handleChange} style={{ width: "100%", padding: "4px", border: "1px solid #ddd", borderRadius: "4px" }} />
                        ) : (
                          <span>{selectedUser.companyName || "N/A"}</span>
                        )}
                      </div>

                      <div>
                        <strong style={{ display: "block", fontSize: "0.8rem", color: "#64748b" }}>{t('admin_users_modal_address') || "Address"}</strong>
                        {isEditing ? (
                          <input type="text" name="address" value={formData.address || ""} onChange={handleChange} style={{ width: "100%", padding: "4px", border: "1px solid #ddd", borderRadius: "4px" }} />
                        ) : (
                          <span>{selectedUser.address || "N/A"}</span>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong>{t('admin_users_modal_kyc_status') || "KYC Status:"}</strong>
                        {isEditing ? (
                          <select name="kycStatus" value={formData.kycStatus || "pending"} onChange={handleChange} style={{ padding: "4px", border: "1px solid #ddd", borderRadius: "4px" }}>
                            <option value="pending">{t('admin_users_modal_kyc_pending') || "Pending"}</option>
                            <option value="approved">{t('admin_users_modal_kyc_approved') || "Approved"}</option>
                            <option value="rejected">{t('admin_users_modal_kyc_rejected') || "Rejected"}</option>
                          </select>
                        ) : (
                          <span className={`status-pill ${selectedUser.kycStatus === 'approved' ? 'active' : selectedUser.kycStatus === 'rejected' ? 'blocked' : 'pending'}`}>
                            {selectedUser.kycStatus === 'approved' ? (t('admin_users_modal_kyc_approved') || "Approved") : selectedUser.kycStatus === 'rejected' ? (t('admin_users_modal_kyc_rejected') || "Rejected") : (t('admin_users_modal_kyc_pending') || "Pending")}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {selectedUser.kycDocuments && selectedUser.kycDocuments.length > 0 && (
                  <div style={{ marginTop: "24px" }}>
                    <h5 style={{ marginBottom: "12px", fontSize: "14px", color: "#64748b" }}>{t('admin_users_modal_kyc_docs') || "KYC Documents"}</h5>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                      {selectedUser.kycDocuments.map((doc, idx) => (
                        <a key={doc._id || idx} href={doc.fileUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                          <div style={{
                            border: "1px solid #e2e8f0",
                            padding: "10px 16px",
                            borderRadius: "10px",
                            fontSize: "13px",
                            background: "#fff",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            color: "#0f172a",
                            fontWeight: "500",
                            transition: "all 0.2s"
                          }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = "#2563eb"}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                          >
                            <FiDownload className="text-blue-600" />
                            {doc.documentType || "Document"}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <p style={{ textAlign: "center", color: "red" }}>{t('admin_users_modal_failed_load') || "Failed to load user info."}</p>
            )}

            <div className="admin-modal-actions" style={{ marginTop: "20px", justifyContent: "flex-end", gap: "10px" }}>
              {isEditing ? (
                <>
                  <button className="btn-cancel" onClick={() => setShowModal(false)}>{t('admin_users_modal_cancel') || "Cancel"}</button>
                  {selectedUser && (
                    <button
                      type="button"
                      onClick={handleToggleBlock}
                      disabled={blockLoading}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "10px",
                        border: "none",
                        color: "white",
                        cursor: "pointer",
                        background: selectedUser?.isActive ? "#ef4444" : "#10b981",
                        fontWeight: "600",
                        opacity: blockLoading ? 0.7 : 1
                      }}
                    >
                      {blockLoading ? (t('admin_users_modal_saving') || "Processing...") : (selectedUser?.isActive ? (t('admin_users_modal_block') || "Block User") : (t('admin_users_modal_unblock') || "Unblock User"))}
                    </button>
                  )}
                  <button className="btn-primary" onClick={handleSave} disabled={saveLoading || !selectedUser}>
                    {saveLoading ? (t('admin_users_modal_saving') || "Saving...") : (t('admin_users_modal_save_changes') || "Save Changes")}
                  </button>
                </>
              ) : (
                <button className="primary-btn" onClick={() => setShowModal(false)}>{t('admin_users_modal_close') || "Close"}</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="admin-modal-overlay" onClick={() => !isDeleting && !deleteSuccess && setShowDeleteModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>

            {deleteSuccess ? (
              <div style={{ padding: "20px 0" }}>
                <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#10b981", color: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px", fontSize: "24px" }}>
                  <FiCheck />
                </div>
                <h3 style={{ color: "#10b981", marginBottom: "5px" }}>{t('admin_users_delete_deleted') || "Deleted!"}</h3>
                <p style={{ color: "#64748b" }}>{t('admin_users_delete_success') || "User deleted successfully."}</p>
              </div>
            ) : isDeleting ? (
              <div style={{ padding: "30px 0" }}>
                <div className="spinner" style={{ width: "30px", height: "30px", border: "3px solid #e2e8f0", borderTop: "3px solid #ef4444", borderRadius: "50%", margin: "0 auto 15px", animation: "spin 1s linear infinite" }}></div>
                <p style={{ color: "#64748b" }}>{t('admin_users_delete_deleting') || "Deleting user..."}</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <>
                <h3 style={{ color: "#ef4444", marginBottom: "10px", textAlign: "left" }}>{t('admin_users_delete_title') || "Delete User?"}</h3>
                <p style={{ color: "#64748b", marginBottom: "20px", textAlign: "left" }}>
                  {t('admin_users_delete_msg') || "Are you sure you want to delete this user? This action cannot be undone."}
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    className="btn-cancel"
                    onClick={() => setShowDeleteModal(false)}
                    style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #e2e8f0", background: "white", cursor: "pointer" }}
                  >
                    {t('admin_users_modal_cancel') || "Cancel"}
                  </button>
                  <button
                    onClick={confirmDelete}
                    style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#ef4444", color: "white", cursor: "pointer", fontWeight: "600" }}
                  >
                    {t('admin_users_delete_confirm') || "Delete"}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}