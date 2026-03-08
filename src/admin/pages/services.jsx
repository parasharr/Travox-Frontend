import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import "../admin.css";
import CategoryCard from "../ui/categoryCard";
import ServicesTable from "../ui/serviceTable";
import AddCategoryModal from "../ui/categoryModal";
import ConfirmDeleteModal from "../ui/confirmDeleteModal";
import ServiceViewModal from "../ui/serviceViewModal";
import { useLanguage } from "../../LanguageContext";

export default function Services() {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [status, setStatus] = useState("All");
    const [page, setPage] = useState(1);
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: "" });
    const [viewModal, setViewModal] = useState({ open: false, id: null });
    // const [editModal, setEditModal] = useState({ open: false, id: null });

    // Data State
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const { t } = useLanguage();
    const location = useLocation(); // Hook to detect location changes

    const PAGE_SIZE = 20;

    /* =====================
       FETCH DATA (Categories + Services)
    ===================== */
    /* =====================
       FETCH DATA (Categories + Services)
    ===================== */
    const fetchServices = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

            // Fetch in parallel but handle independently
            // Updated URL to api/services as requested
            const [categoriesRes, servicesRes] = await Promise.all([
                fetch(`${baseUrl}api/admin/categories`, { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(`${baseUrl}api/services`, { headers: { "Authorization": `Bearer ${token}` } })
            ]);

            let servicesData = [];
            let categoriesData = [];

            // Validates Services Response
            if (servicesRes.ok) {
                const data = await servicesRes.json();
                if (Array.isArray(data)) {
                    servicesData = data;
                    setServices(data);
                } else {
                    console.warn("Services API returned non-array:", data);
                }
            } else {
                console.error("Failed to fetch services:", servicesRes.status);
            }

            // Validates Categories Response
            if (categoriesRes.ok) {
                const data = await categoriesRes.json();
                if (Array.isArray(data)) {
                    categoriesData = data;

                    // Calculate counts from services (handling nested category object)
                    const counts = servicesData.reduce((acc, curr) => {
                        // curr.category is now an object { _id, name }
                        const catName = curr.category?.name || "Uncategorized";
                        acc[catName] = (acc[catName] || 0) + 1;
                        return acc;
                    }, {});

                    // Map API categories to UI state
                    const mappedCategories = categoriesData.map(c => ({
                        id: c._id,
                        type: (c.name || "default").toLowerCase().split(' ')[0],
                        title: c.name,
                        count: `${counts[c.name] || 0} services`,
                        active: c.isActive !== undefined ? c.isActive : true
                    }));

                    setCategories(mappedCategories);
                } else {
                    console.warn("Categories API returned non-array:", data);
                }
            } else {
                console.error("Failed to fetch categories:", categoriesRes.status);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
        // Added location.key to dependencies to trigger re-fetch on navigation
    }, [location.key]);

    /* =====================
       FILTER + SEARCH
    ===================== */
    const filtered = useMemo(() => {
        // Map API data to table expected format if needed
        const mappedServices = services.map(s => ({
            ...s,
            // Fallbacks for display
            image: s.image || s.thumbnail || "https://via.placeholder.com/150",
            // Correctly map nested fields from api/services
            service: s.name || s.service || "Untitled Service",
            provider: s.provider?.name || s.providerName || "Unknown Provider",
            providerInitials: (s.provider?.name || s.providerName || "U").substring(0, 2).toUpperCase(),
            category: s.category?.name || "Uncategorized",
            price: s.price || 0,
            status: s.isActive ? "Active" : "Inactive",
            bookings: s.bookings || 0
        }));

        return mappedServices.filter((s) => {
            const matchSearch =
                (s.service || "").toLowerCase().includes(search.toLowerCase()) ||
                (s.provider || "").toLowerCase().includes(search.toLowerCase());

            const matchCategory =
                category === "All" || category === (t('admin_services_filter_all') || "All") || s.category === category;

            const matchStatus =
                status === "All" || status === (t('admin_services_filter_all') || "All") || s.status.toLowerCase() === status.toLowerCase();

            return matchSearch && matchCategory && matchStatus;
        });
    }, [search, category, status, services]);

    /* =====================
       RESET PAGE ON FILTER CHANGE
    ===================== */
    useEffect(() => {
        setPage(1);
    }, [search, category, status]);

    /* =====================
       PAGINATION
    ===================== */
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

    const paginated = filtered.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    const start = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, filtered.length);

    /* =====================
       ADD CATEGORY
    ===================== */
    const handleAddCategory = async (catData) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

            const response = await fetch(`${baseUrl}api/admin/categories`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(catData)
            });

            if (response.ok) {
                const newCat = await response.json();

                // Optimistically update UI or re-fetch
                // Mapping the new category to match UI structure
                const mappedCat = {
                    id: newCat._id,
                    type: (newCat.name || "default").toLowerCase().split(' ')[0],
                    title: newCat.name,
                    count: "0 services", // New category has 0 services
                    active: newCat.isActive !== undefined ? newCat.isActive : true
                };

                setCategories(prev => [...prev, mappedCat]);
                setShowModal(false);
            } else {
                console.error("Failed to add category");
                // Optional: Show error toast here
            }
        } catch (error) {
            console.error("Error adding category:", error);
        }
    };

    /* =====================
       DELETE CATEGORY
    ===================== */
    /* =====================
       TOGGLE CATEGORY STATUS
    ===================== */
    const handleCategoryToggle = async (cat) => {
        // Optimistic Update
        const newStatus = !cat.active;
        setCategories(prev => prev.map(c =>
            c.id === cat.id ? { ...c, active: newStatus } : c
        ));

        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

            // Using PUT to update status
            const response = await fetch(`${baseUrl}api/admin/categories/${cat.id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ isActive: newStatus })
            });

            if (!response.ok) {
                console.error("Failed to toggle category status");
                // Revert optimistic update
                setCategories(prev => prev.map(c =>
                    c.id === cat.id ? { ...c, active: !newStatus } : c
                ));
            }
        } catch (error) {
            console.error("Error toggling category:", error);
            // Revert optimistic update
            setCategories(prev => prev.map(c =>
                c.id === cat.id ? { ...c, active: !newStatus } : c
            ));
        }
    };

    /* =====================
       HANDLE UPDATES
    ===================== */
    // const handleServiceUpdate = () => {
    //     // Refresh the list after edit
    //     fetchServices();
    //     setEditModal({ open: false, id: null });
    // };

    /* =====================
       DELETE HANDLERS (Category + Service)
    ===================== */
    const handleDeleteClick = (cat) => {
        setDeleteModal({ open: true, id: cat.id, name: cat.title, type: 'category' });
    };

    const handleDeleteServiceClick = (service) => {
        setDeleteModal({
            open: true,
            id: service._id || service.id,
            name: service.service || service.name,
            type: 'service'
        });
    };

    const confirmDelete = async () => {
        const { id, type } = deleteModal;
        if (!id) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

            let url;
            if (type === 'service') {
                url = `${baseUrl}api/admin/services/${id}`;
            } else {
                url = `${baseUrl}api/admin/categories/${id}`;
            }

            const response = await fetch(url, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                if (type === 'service') {
                    // Update services state
                    setServices(prev => prev.filter(s => (s._id || s.id) !== id));
                    // Re-fetch to ensure counts update or just close modal? 
                    // Let's refetch to keep everything in sync (counts etc)
                    fetchServices();
                } else {
                    // Optimistic update for categories - Mark as inactive
                    setCategories(prev => prev.map(c =>
                        c.id === id ? { ...c, active: false } : c
                    ));
                }
                setDeleteModal({ open: false, id: null, name: "", type: null });
            } else {
                console.error(`Failed to delete ${type}`);
                alert(`Failed to delete ${type}. Access denied or server error.`);
                setDeleteModal({ open: false, id: null, name: "", type: null });
            }
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
            setDeleteModal({ open: false, id: null, name: "", type: null });
        }
    };

    return (
        <div className="services-page">

            {/* ADD CATEGORY MODAL */}
            <AddCategoryModal
                open={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleAddCategory}
            />

            {/* CONFIRM DELETE MODAL */}
            <ConfirmDeleteModal
                open={deleteModal.open}
                categoryName={deleteModal.name} // You might want to rename this prop toitemName in the generic modal component, but keeping it for now
                onClose={() => setDeleteModal({ open: false, id: null, name: "", type: null })}
                onConfirm={confirmDelete}
            />

            {/* HEADER */}
            <div className="page-header">
                <h1>{t('admin_services_title') || "Services & Categories"}</h1>
                <p>{t('admin_services_subtitle') || "Manage platform offerings and service catalog"}</p>
            </div>

            <div className="services-layout">

                {/* LEFT — CATEGORIES */}
                <div className="categories-box">
                    <div className="categories-header">
                        <h3>{t('admin_services_categories_title') || "Categories"}</h3>
                        <button
                            className="btn-primary"
                            onClick={() => setShowModal(true)}
                        >
                            {t('admin_services_add_category') || "+ Add Category"}
                        </button>
                    </div>

                    <div style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto", paddingRight: "8px" }} className="custom-scroll">
                        {categories.map((cat) => (
                            <CategoryCard
                                key={cat.id}
                                type={cat.type}
                                title={cat.title}
                                count={cat.count}
                                active={cat.active}
                                onToggle={() => handleCategoryToggle(cat)}
                                onDelete={() => handleDeleteClick(cat)}
                            />
                        ))}
                    </div>
                </div>

                {/* RIGHT — SERVICES */}
                <div className="services">

                    <h2 className="page-title">{t('admin_services_all_services') || "All Services"}</h2>

                    {/* FILTER BAR */}
                    <div className="services-filters">
                        <input
                            className="filter-input"
                            placeholder={t('admin_services_search_placeholder') || "Search services..."}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <select
                            className="filter-select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option>{t('admin_services_filter_all') || "All"}</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.title}>{cat.title}</option>
                            ))}
                        </select>

                        <select
                            className="filter-select"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option>{t('admin_services_filter_all') || "All"}</option>
                            <option>{t('admin_services_filter_active') || "Active"}</option>
                            <option>{t('admin_services_filter_inactive') || "Inactive"}</option>
                            <option>{t('admin_services_filter_flagged') || "Flagged"}</option>
                            <option>{t('admin_services_filter_updated') || "Updated"}</option>

                        </select>
                    </div>

                    {/* SCROLLABLE TABLE */}
                    <div className="services-table-wrapper">
                        {loading ? (
                            <p style={{ textAlign: "center", padding: "20px" }}>{t('admin_services_loading') || "Loading services..."}</p>
                        ) : (
                            <ServicesTable
                                data={paginated}
                                onView={(service) => setViewModal({ open: true, id: service._id || service.id })}
                                // onEdit={(service) => setEditModal({ open: true, id: service._id || service.id })}
                                onDelete={handleDeleteServiceClick}
                            />
                        )}
                        {!loading && paginated.length === 0 && (
                            <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>{t('admin_services_no_services') || "No services found."}</p>
                        )}
                    </div>

                    {/* VIEW SERVICE MODAL */}
                    <ServiceViewModal
                        open={viewModal.open}
                        serviceId={viewModal.id}
                        onClose={() => setViewModal({ open: false, id: null })}
                    />

                    {/* EDIT SERVICE MODAL */}
                    {/* <ServiceEditModal
                        open={editModal.open}
                        serviceId={editModal.id}
                        onClose={() => setEditModal({ open: false, id: null })}
                        onUpdate={handleServiceUpdate}
                    /> */}

                    {/* PAGINATION */}
                    <div className="services-pagination">
                        <span>
                            {t('admin_services_showing') || "Showing"} {start}–{end} {t('admin_services_of') || "of"} {filtered.length}
                        </span>

                        <div className="pagination-buttons">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                ‹
                            </button>

                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    className={page === i + 1 ? "active" : ""}
                                    onClick={() => setPage(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                ›
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
