import { useState, useEffect } from "react";
import { FiUser, FiLock, FiTrash2, FiPlus, FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "../admin.css";
import { useLanguage } from "../../LanguageContext";

export default function Settings() {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Custom Modal States
  const [confirmModal, setConfirmModal] = useState({ show: false, adminId: null, adminName: '' });
  const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'info' });

  // Load initial admins from local storage if available
  const [admins, setAdmins] = useState(() => {
    const cached = localStorage.getItem("cachedAdmins");
    return cached ? JSON.parse(cached) : [];
  });

  // Save to local storage whenever admins change
  useEffect(() => {
    localStorage.setItem("cachedAdmins", JSON.stringify(admins));
  }, [admins]);

  // Fetch Admins
  const fetchAdmins = async (updateState = true) => {
    if (updateState) setLoading(true); // Set loading to true
    try {
      const token = localStorage.getItem("token");
      if (!token) return [];

      const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

      console.log("Fetching users from:", `${baseUrl}api/admin/all`);

      // Correct endpoint provided by user
      const response = await fetch(`${baseUrl}api/admin/all`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      });

      const data = await response.json();
      console.log("Admin API Response:", data);

      if (response.ok) {
        // Try to find the list in common places
        let adminList = [];

        if (Array.isArray(data)) {
          adminList = data;
        } else if (data.admins && Array.isArray(data.admins)) {
          adminList = data.admins;
        } else if (data.data && Array.isArray(data.data)) {
          adminList = data.data;
        } else if (data.users && Array.isArray(data.users)) {
          adminList = data.users;
        }

        if (Array.isArray(adminList) && adminList.length > 0) {
          if (updateState) {
            console.log("Updating admin list with:", adminList);
            setAdmins(adminList);
          }
          return adminList;
        } else {
          // If we got an empty list or couldn't parse it, but request was OK,
          // only clear if we are SURE.
          // If local storage has items and backend returns empty, maybe keep local?
          // But valid backend empty means empty.
          // We'll trust the backend if it's explicitly empty array.
          if (Array.isArray(adminList)) {
            if (updateState) setAdmins(adminList);
            return adminList;
          } else {
            console.warn("Could not find admin array in response.");
            return [];
          }
        }
      } else {
        console.error("Fetch admins failed status:", response.status, data);
        return [];
      }
    } catch (error) {
      console.error("Failed to fetch admins", error);
      return [];
    } finally {
      if (updateState) setLoading(false); // Set loading to false
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Remove Admin
  const openRemoveConfirm = (id, name) => {
    setConfirmModal({ show: true, adminId: id, adminName: name });
  };

  const handleRemoveAdmin = async () => {
    const { adminId } = confirmModal;
    setConfirmModal({ ...confirmModal, show: false });

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setNotification({ show: true, title: t('admin_settings_msg_auth_fail') || 'Auth Failed', message: t('admin_settings_msg_auth_lost') || "Authentication lost. Please login again.", type: 'error' });
        return;
      }

      const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
      console.log("Attempting DELETE:", `${baseUrl}api/admin/${id}`);

      const response = await fetch(`${baseUrl}api/admin/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Delete Response Status:", response.status);

      if (response.ok) {
        // Update local state and cache on success
        setAdmins(prev => prev.filter(a => (a._id || a.id) !== id));
        setNotification({ show: true, title: t('admin_settings_msg_rm_success_title') || 'Admin Removed', message: t('admin_settings_msg_rm_success') || "The administrator has been successfully removed.", type: 'success' });
      } else {
        // Backend might return 500 even if delete succeeded (known issue)
        // Check if admin is truly gone
        console.warn("Delete reported error, verifying if admin exists...");

        // Wait a brief moment for DB to update if needed
        await new Promise(r => setTimeout(r, 1000));

        const freshList = await fetchAdmins(false);
        const stillExists = freshList.some(a => (a._id || a.id) === id);

        if (!stillExists) {
          console.log("Admin verified as deleted despite error response.");
          // Now update the UI manually since we did a silent fetch
          setAdmins(prev => prev.filter(a => (a._id || a.id) !== id));
          setNotification({ show: true, title: t('admin_settings_msg_rm_success_title') || 'Admin Removed', message: t('admin_settings_msg_rm_success') || "The administrator has been successfully removed.", type: 'success' });
          return;
        }

        // Parse actual error if still exists
        const text = await response.text();
        console.error("Delete failed body:", text);

        let errorMessage = t('admin_settings_msg_rm_fail') || "Failed to delete admin";
        try {
          const json = JSON.parse(text);
          errorMessage = json.message || errorMessage;
        } catch {
          if (text.length < 100) errorMessage = text;
        }

        throw new Error(`Server Error (${response.status}): ${errorMessage}`);
      }
    } catch (error) {
      console.error("Delete admin error:", error);
      setNotification({ show: true, title: t('admin_settings_msg_err_title') || 'Error', message: error.message || t('admin_settings_msg_err_rm') || "Could not delete admin. Please try again.", type: 'error' });
    }
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const addAdmin = async () => {
    if (!form.name || !form.email || !form.password) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setNotification({ show: true, title: t('admin_settings_msg_auth_req') || 'Auth Required', message: t('admin_settings_msg_auth_lost') || "You are not authenticated. Please login again.", type: 'error' });
        return;
      }

      const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

      // Call API
      const response = await fetch(`${baseUrl}api/admin/create-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('admin_settings_msg_add_fail') || "Failed to create admin");
      }

      // Success
      setAdmins([
        ...admins,
        // If the backend returns the created admin, use it. Otherwise use form data.
        data.admin || { id: Date.now(), name: form.name, email: form.email },
      ]);

      setForm({ name: "", email: "", password: "" });
      setShowModal(false);
      setNotification({ show: true, title: t('admin_settings_msg_add_success_title') || 'Admin Added', message: t('admin_settings_msg_add_success') || "New administrator has been added successfully!", type: 'success' });

    } catch (error) {
      console.error("Error adding admin:", error);
      setNotification({ show: true, title: t('admin_settings_msg_err_title') || 'Error', message: error.message, type: 'error' });
    }
  };

  const [loginEmail, setLoginEmail] = useState("");
  const [loginName, setLoginName] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("loginEmail");
    const storedName = localStorage.getItem("loginName");

    if (storedEmail) setLoginEmail(storedEmail);
    if (storedName) setLoginName(storedName);
  }, []);

  // Update name from admins list if not in local storage but we have the list
  useEffect(() => {
    if (!loginName && loginEmail && admins.length > 0) {
      const match = admins.find(a => a.email === loginEmail);
      if (match) {
        setLoginName(match.name);
        // Optional: save it for next time
        localStorage.setItem("loginName", match.name);
      }
    }
  }, [admins, loginEmail, loginName]);

  return (
    <div className="settings-page">

      {/* HEADER */}
      <div className="page-header">
        <h1>{t('admin_settings_title') || "Settings"}</h1>
        <p>{t('admin_settings_subtitle') || "Account preferences and admin access"}</p>
      </div>

      {/* GRID */}
      <div className="settings-grid">

        {/* LEFT */}
        <div className="settings-column">

          <section className="settings-box">
            <h2>{t('admin_settings_my_account') || "My Account"}</h2>

            <div className="profile-row">
              <div className="avatar xl">
                {loginName ? loginName.charAt(0).toUpperCase() : "A"}
              </div>

              <div className="profile-info">
                <p className="name">{loginName || "Admin"}</p>
                <p className="email">{loginEmail || "admin@travox.com"}</p>
                <span className="settings-badge">{t('admin_settings_admin_badge') || "Administrator"}</span>
              </div>
            </div>
          </section>

          <section className="pass-box">
            <h2>{t('admin_settings_change_pass') || "Change Password"}</h2>

            <div className="form-grid">
              <input type="password" placeholder={t('admin_settings_curr_pass') || "Current password"} />
              <input type="password" placeholder={t('admin_settings_new_pass') || "New password"} />
              <input type="password" placeholder={t('admin_settings_conf_pass') || "Confirm new password"} />

              <button className="primary-btn full">
                {t('admin_settings_btn_update') || "Update Password"}
              </button>
            </div>
          </section>

        </div>

        {/* RIGHT */}
        <div className="settings-column">

          <section className="settings-box">
            <div className="box-header">
              <h2>{t('admin_settings_platform_admins') || "Platform Admins"}</h2>
              <button
                className="primary-btn"
                onClick={() => setShowModal(true)}
              >
                {t('admin_settings_btn_add_admin') || "+ Add Admin"}
              </button>
            </div>

            <div className="admin-table">
              <div className="admin-row header">
                <div>{t('admin_settings_table_name') || "Name"}</div>
                <div>{t('admin_settings_table_email') || "Email"}</div>
                <div>{t('admin_settings_table_action') || "Action"}</div>
              </div>

              {loading && <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>{t('admin_settings_loading') || "Loading admins..."}</div>}

              {!loading && admins.length === 0 && (
                <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>{t('admin_settings_no_admins') || "No admins found."}</div>
              )}

              {!loading && admins.map(a => (
                <div className="admin-row" key={a._id || a.id}>
                  <div>{a.name}</div>
                  <div>{a.email}</div>
                  <div>
                    <button
                      className="danger-btn"
                      onClick={() => openRemoveConfirm(a._id || a.id, a.name)}
                    >
                      {t('admin_settings_btn_remove') || "Remove"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>

      {/* ADD ADMIN MODAL (BOOTSTRAP SAFE) */}
      {showModal && (
        <div
          className="admin-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="admin-modal"
            onClick={e => e.stopPropagation()}
          >
            <h3>{t('admin_settings_modal_add_title') || "Add New Admin"}</h3>

            <input
              placeholder={t('admin_settings_modal_name_ph') || "Name"}
              value={form.name}
              onChange={e =>
                setForm({ ...form, name: e.target.value })
              }
            />
            <input
              placeholder={t('admin_settings_modal_email_ph') || "Email"}
              value={form.email}
              onChange={e =>
                setForm({ ...form, email: e.target.value })
              }
            />
            <input
              type="password"
              placeholder={t('admin_settings_modal_pass_ph') || "Password"}
              value={form.password}
              onChange={e =>
                setForm({ ...form, password: e.target.value })
              }
            />

            <div className="admin-modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                {t('admin_settings_modal_btn_cancel') || "Cancel"}
              </button>
              <button className="primary-btn" onClick={addAdmin}>
                {t('admin_settings_modal_btn_add') || "Add Admin"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="admin-modal-overlay">
          <div style={{ background: "white", borderRadius: "16px", width: "450px", padding: "32px", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
            <div style={{ width: "64px", height: "64px", backgroundColor: "#fee2e2", color: "#dc2626", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <FiTrash2 size={32} />
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px", color: "#1e293b" }}>{t('admin_settings_modal_rm_title') || "Remove Admin?"}</h2>
            <p style={{ color: "#64748b", marginBottom: "32px", lineHeight: "1.6" }}>
              {t('admin_settings_modal_rm_msg')?.replace('{name}', confirmModal.adminName) || `Are you sure you want to remove ${confirmModal.adminName} as an administrator? They will lose all access to the panel.`}
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                className="btn-secondary"
                style={{ flex: 1, padding: "12px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                onClick={() => setConfirmModal({ ...confirmModal, show: false })}
              >
                {t('admin_settings_modal_btn_cancel') || "Cancel"}
              </button>
              <button
                className="primary-btn"
                style={{ flex: 1, padding: "12px", background: "#dc2626", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                onClick={handleRemoveAdmin}
              >
                {t('admin_settings_modal_btn_yes_rm') || "Yes, Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notification.show && (
        <div className="admin-modal-overlay">
          <div style={{ background: "white", borderRadius: "16px", width: "400px", padding: "32px", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
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
              {t('admin_settings_msg_btn_got_it') || "Got it"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
