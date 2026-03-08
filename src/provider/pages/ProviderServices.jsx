import React, { useState, useMemo, useEffect } from "react";
import {
    FiSearch,
    FiPlus,
    FiMoreHorizontal,
    FiEdit2,
    FiTrash2,
    FiCopy,
    FiEye,
    FiFilter,
    FiX,
    FiCheck,
    FiLoader
} from "react-icons/fi";
import "../provider.css";
import { useLanguage } from "../../LanguageContext";
const logoPath = "/logo.png";

const ProviderServices = () => {
    // State
    const [services, setServices] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        categoryId: "",
        price: "",
        priceUnit: "Fixed",
        status: "active"
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [notification, setNotification] = useState({ show: false, message: "", type: "" });
    const [categories, setCategories] = useState([]);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const { t } = useLanguage();

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
                const token = localStorage.getItem("token");

                const response = await fetch(`${baseUrl}api/admin/categories`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    setCategories(data.categories || data || []);
                } else {
                    console.error("Failed to fetch categories:", data.message);
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };

        fetchCategories();
    }, []);

    // Fetch provider's services on component mount
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
                const token = localStorage.getItem("token");

                const response = await fetch(`${baseUrl}api/services`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    setServices(data.services || data || []);
                } else {
                    console.error("Failed to fetch services:", data.message);
                }
            } catch (err) {
                console.error("Error fetching services:", err);
            }
        };

        fetchServices();
    }, []);

    // Derived Data
    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const serviceName = (service.name || service.title || "").toLowerCase();
            const matchesSearch = serviceName.includes(searchTerm.toLowerCase());
            const serviceStatus = (service.status || 'active').toLowerCase();
            const matchesFilter = filterStatus === "All" ||
                serviceStatus === filterStatus.toLowerCase();
            return matchesSearch && matchesFilter;
        });
    }, [services, searchTerm, filterStatus]);

    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
    const paginatedServices = filteredServices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Handlers
    const handleDelete = (id) => {
        console.log(">>> Opening custom confirm for ID:", id);
        setDeleteConfirmId(id);
    };

    const confirmDelete = async () => {
        const id = deleteConfirmId;
        if (!id) return;

        setDeleteConfirmId(null); // Close the confirm modal
        console.log(">>> Proceeding with deletion for service ID:", id);
        setNotification({ show: true, message: "Deleting...", type: "loading" });
        setError("");

        try {
            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
            const token = localStorage.getItem("token");
            console.log(">>> Token present:", !!token);
            console.log(">>> Request URL:", `${baseUrl}api/services/${id}`);

            const response = await fetch(`${baseUrl}api/services/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            console.log(">>> Delete response status:", response.status);

            let data = {};
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            }

            if (!response.ok) {
                throw new Error(data.message || `Failed to delete service (Status: ${response.status})`);
            }

            setServices(prev => prev.filter(s => (s._id || s.id) !== id));
            setNotification({ show: true, message: "Deleted Successfully", type: "success" });

            setTimeout(() => {
                setNotification({ show: false, message: "", type: "" });
            }, 3000);
        } catch (err) {
            console.error("Error deleting service:", err);
            setError(err.message || "Failed to delete service. Please try again.");
            setNotification({ show: false, message: "", type: "" });
        }
    };

    const handleToggleStatus = async (id) => {
        const service = services.find(s => (s._id || s.id) === id);
        if (!service) return;

        const currentStatus = service.status || 'active';
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        const endpoint = newStatus === "active" ? "activate" : "deactivate";

        console.log(`>>> Toggling status for ${id} to ${newStatus} using ${endpoint}`);
        setNotification({ show: true, message: "Updating status...", type: "loading" });
        setError("");

        try {
            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
            const token = localStorage.getItem("token");

            const response = await fetch(`${baseUrl}api/services/${id}/${endpoint}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            console.log(">>> Status update response status:", response.status);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || `Failed to ${endpoint} service`);
            }

            setServices(prev => prev.map(s => {
                if ((s._id || s.id) === id) {
                    return { ...s, status: newStatus };
                }
                return s;
            }));

            setNotification({ show: true, message: "Status updated successfully", type: "success" });

            setTimeout(() => {
                setNotification({ show: false, message: "", type: "" });
            }, 3000);
        } catch (err) {
            console.error("Error toggling service status:", err);
            setError(err.message || "Failed to update status. Please try again.");
            setNotification({ show: false, message: "", type: "" });
        }
    };

    const handleCopy = (service) => {
        const newService = {
            ...service,
            id: Date.now(),
            title: `${service.title} (Copy)`,
            status: "draft",
            views: 0,
            bookings: 0
        };
        setServices(prev => [newService, ...prev]);
    };

    const openAddModal = () => {
        setEditingService(null);
        setFormData({ title: "", categoryId: "", price: "", priceUnit: "Fixed", status: "active" });
        setError("");
        setShowModal(true);
    };

    const openEditModal = (service) => {
        setEditingService(service);
        setFormData({ ...service });
        setError("");
        setShowModal(true);
    };

    const handleSaveService = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Show "Creating..." notification
        setNotification({ show: true, message: "Creating...", type: "loading" });

        try {
            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
            const token = localStorage.getItem("token");

            if (editingService) {
                // Update existing service (you can implement this later)
                setServices(prev => prev.map(s => (s._id || s.id) === (editingService._id || editingService.id) ? { ...s, ...formData } : s));
                setShowModal(false);
                setNotification({ show: true, message: "Updated Successfully", type: "success" });
            } else {
                // Create new service
                const response = await fetch(`${baseUrl}api/services`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: formData.title,
                        description: formData.description,
                        price: formData.price,
                        duration: formData.duration,
                        categoryId: formData.categoryId,
                        status: formData.status
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to create service");
                }

                // Add the new service to the list
                setServices(prev => [data.service || data, ...prev]);
                setShowModal(false);
                setFormData({ title: "", categoryId: "", price: "", priceUnit: "Fixed", status: "active" });

                // Show success notification
                setNotification({ show: true, message: "Created Successfully", type: "success" });
            }

            // Auto-hide notification after 3 seconds
            setTimeout(() => {
                setNotification({ show: false, message: "", type: "" });
            }, 3000);

        } catch (err) {
            console.error("Error saving service:", err);
            setError(err.message || "Failed to save service. Please try again.");
            setNotification({ show: false, message: "", type: "" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page">

            {/* Header */}
            <div className="page-header-row">
                <div>
                    <h1 className="page-title">{t('pserv_title')}</h1>
                </div>
                <button className="primary-btn" onClick={openAddModal}>
                    <FiPlus /> {t('pserv_add_new')}
                </button>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar-card">
                <div className="search-input-wrapper">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder={t('pserv_search')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-actions">
                    <select
                        className="filter-select"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">{t('pserv_all')}</option>
                        <option value="Active">{t('pserv_active')}</option>
                        <option value="Inactive">{t('pserv_inactive')}</option>
                        <option value="Draft">{t('pserv_draft')}</option>
                    </select>
                    <select className="filter-select">
                        <option>{t('pserv_recently_updated')}</option>
                        <option>{t('pserv_newest')}</option>
                        <option>{t('pserv_price_low')}</option>
                    </select>
                </div>
            </div>

            {/* Service Grid */}
            <div className="services-grid">
                {paginatedServices.map(service => (
                    <div key={service._id || service.id} className="service-card-item">
                        <div className="service-img-placeholder">
                            {/* Using provided logo if no image */}
                            <img
                                src={service.image || logoPath}
                                alt={service.name || service.title || "Service"}
                                className="service-img"
                            />
                        </div>

                        <div className="service-info-col">
                            <div className="service-header">
                                <span className="sc-category">{service.category?.name || service.category || "General"}</span>
                                <div className="sc-actions" style={{ position: "relative", zIndex: 10 }}>
                                    <button
                                        className="icon-btn-sm danger"
                                        title="Delete"
                                        style={{ cursor: "pointer" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log("Delete button clicked for ID:", service._id || service.id);
                                            handleDelete(service._id || service.id);
                                        }}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>

                            <h3 className="sc-title">{service.name || service.title}</h3>

                            <div className="sc-price-row">
                                <span className="sc-price">${service.price}</span>
                                <span className="sc-unit">{service.priceUnit}</span>
                            </div>

                            <div className="sc-stats">
                                <span><FiEye /> {service.views || 0} {t('pserv_views')}</span>
                                <span><FiCopy /> {service.bookings || 0} {t('pserv_bookings_label')}</span>
                            </div>

                            <div className="sc-footer">
                                <div className={`status-dot ${service.status || 'active'}`}>
                                    {(service.status || 'active').charAt(0).toUpperCase() + (service.status || 'active').slice(1)}
                                </div>

                                <div className="sc-controls">
                                    <button className="edit-btn" onClick={() => openEditModal(service)}>{t('pserv_edit')}</button>
                                    <label className="switch-sm">
                                        <input
                                            type="checkbox"
                                            checked={(service.status || 'active').toLowerCase().trim() === 'active'}
                                            onChange={() => handleToggleStatus(service._id || service.id)}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="pagination-bar">
                <span>{t('pserv_showing')} {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredServices.length)} {t('pserv_of')} {filteredServices.length} {t('pserv_services')}</span>

                <div className="pagination-controls">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                    >
                        &lt;
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            className={currentPage === i + 1 ? "active" : ""}
                            onClick={() => setCurrentPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                    >
                        &gt;
                    </button>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="provider-modal-content large-modal">
                        <div className="modal-header" style={{ padding: "20px 24px" }}>
                            <h2>{editingService ? t('pserv_edit_service') : t('pserv_add_service')}</h2>
                            <button onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleSaveService}>
                            {error && (
                                <div style={{
                                    backgroundColor: "#fee2e2",
                                    color: "#b91c1c",
                                    padding: "12px 24px",
                                    fontSize: "14px",
                                    borderBottom: "1px solid #fecaca"
                                }}>
                                    {error}
                                </div>
                            )}
                            <div className="modal-body" style={{ padding: "24px" }}>
                                <div className="form-row-grid">
                                    {/* Left Col */}
                                    <div className="form-col">
                                        <div className="form-group">
                                            <label>{t('pserv_service_title')}</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Deep Home Cleaning"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>{t('pserv_category')}</label>
                                            <select
                                                required
                                                value={formData.categoryId}
                                                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                            >
                                                <option value="">{t('pserv_select_category')}</option>
                                                {categories.map((category) => (
                                                    <option key={category._id || category.id} value={category._id || category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>{t('pserv_price')}</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="0"
                                                    placeholder="0.00"
                                                    value={formData.price}
                                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>{t('pserv_unit')}</label>
                                                <select
                                                    value={formData.priceUnit}
                                                    onChange={e => setFormData({ ...formData, priceUnit: e.target.value })}
                                                >
                                                    <option>{t('pserv_per_visit')}</option>
                                                    <option>{t('pserv_per_hour')}</option>
                                                    <option>{t('pserv_per_project')}</option>
                                                    <option>{t('pserv_fixed')}</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>{t('pserv_duration')}</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 2 hours, 3 days"
                                                value={formData.duration || ""}
                                                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Right Col */}
                                    <div className="form-col">
                                        <div className="form-group">
                                            <label>{t('pserv_description')}</label>
                                            <textarea
                                                rows="4"
                                                placeholder="Describe your service in detail..."
                                                value={formData.description || ""}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", resize: "none" }}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>{t('pserv_service_status')}</label>
                                            <select
                                                value={formData.status}
                                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                <option value="active">{t('pserv_active')}</option>
                                                <option value="inactive">{t('pserv_inactive')}</option>
                                                <option value="draft">{t('pserv_draft')}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ padding: "20px 24px" }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} disabled={loading}>{t('pserv_cancel')}</button>
                                <button type="submit" className="primary-btn" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                                    {loading ? t('pserv_saving') : (editingService ? t('pserv_update') : t('pserv_create'))}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Deletion Confirmation Modal */}
            {deleteConfirmId && (
                <div className="modal-overlay" style={{ zIndex: 11000 }}>
                    <div className="provider-modal-content" style={{ maxWidth: "400px", textAlign: "center", padding: "32px" }}>
                        <div style={{ color: "#ef4444", fontSize: "48px", marginBottom: "16px" }}>
                            <FiTrash2 />
                        </div>
                        <h2 style={{ marginBottom: "12px" }}>{t('pserv_delete_title')}</h2>
                        <p style={{ color: "#64748b", marginBottom: "24px" }}>
                            {t('pserv_delete_msg')}
                        </p>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                            <button
                                className="btn-secondary"
                                style={{ padding: "10px 24px" }}
                                onClick={() => setDeleteConfirmId(null)}
                            >
                                {t('pserv_cancel')}
                            </button>
                            <button
                                className="primary-btn"
                                style={{ backgroundColor: "#ef4444", padding: "10px 24px" }}
                                onClick={confirmDelete}
                            >
                                {t('pserv_yes_delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Dialog */}
            {notification.show && (
                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "white",
                    padding: "32px 48px",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                    zIndex: 10000,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                    minWidth: "280px"
                }}>
                    {notification.type === "loading" ? (
                        <FiLoader style={{
                            fontSize: "48px",
                            color: "#3b82f6",
                            animation: "spin 1s linear infinite"
                        }} />
                    ) : (
                        <div style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                            backgroundColor: "#10b981",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <FiCheck style={{
                                fontSize: "36px",
                                color: "white",
                                fontWeight: "bold"
                            }} />
                        </div>
                    )}
                    <p style={{
                        margin: 0,
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "#1f2937"
                    }}>
                        {notification.message}
                    </p>
                </div>
            )}

            {/* Add keyframe animation for loader */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>

        </div>
    );
};

export default ProviderServices;
