import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookingCard from "./BookingCard";
import Header from "../Home/Navbar/Navbar";
import { FaSearch, FaBroom, FaWrench, FaDumbbell, FaPen, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaArrowLeft, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useLanguage } from "../../LanguageContext";

const ITEMS_PER_PAGE = 4;

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState(30);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [quickFilters, setQuickFilters] = useState({ held: false, released: false });
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
        const response = await fetch(`${baseUrl}api/bookings/my`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.warn("Session expired. Please log in again.");
            setError("Session expired. Please log in again.");
            return;
          }
          throw new Error("Failed to fetch bookings");
        }

        const data = await response.json();
        const bookingsData = Array.isArray(data) ? data : (data.data && Array.isArray(data.data) ? data.data : []);

        const mappedBookings = bookingsData.map(b => {
          let pStatus = "Unpaid";
          // Check both the backend provided paymentStatus and the legacy workflow status
          if (b.paymentStatus === 'PAID' || ["paymentreleased", "clientapproved"].includes(b.status?.toLowerCase())) {
            pStatus = "Paid";
          } else if (b.paymentStatus === 'REFUNDED') {
            pStatus = "Refunded";
          } else if (b.status?.toLowerCase() === "approved") {
            pStatus = "Released";
          }

          return {
            ...b,
            id: b._id || b.id,
            providerId: b.providerId || b.provider?._id || b.provider?.id,
            title: b.serviceName || b.service?.name || "Service Booking",
            provider: b.providerName || b.provider?.name || b.company || "Provider",
            company: b.providerName || b.provider?.name || b.company || "Provider Name",
            time: new Date(b.bookingDate || b.createdAt).toLocaleDateString(),
            price: b.totalAmount || b.price || 0,
            status: b.status || "Pending",
            paymentStatus: pStatus,
            paymentStatusLabel: pStatus === "Paid" ? t("mb_payment_paid") : (pStatus === "Released" ? t("mb_payment_released") : pStatus),
            color: getStatusColor(b.status),
            icon: (
              <img
                src={b.serviceImage || b.service?.image || b.providerLogo || b.provider?.logo || "/logo.png"}
                alt={b.serviceName || "Service"}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
              />
            ),
          };
        });
        setBookings(mappedBookings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load your bookings.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'green';
      case 'pending': return 'blue';
      case 'cancelled': return 'red';
      case 'confirmed': return 'purple';
      default: return 'gray';
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesTab = activeTab === "All" || (
      activeTab === "Active"
        ? ['pending', 'confirmed', 'accepted', 'created', 'in progress'].includes(b.status?.toLowerCase())
        : b.status?.toLowerCase() === activeTab.toLowerCase()
    );
    const matchesSearch = !searchQuery.trim() ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = dateRange === 0 || (() => {
      const bDate = new Date(b.bookingDate || b.createdAt);
      const now = new Date();
      const diffDays = (now - bDate) / (1000 * 60 * 60 * 24);
      return diffDays <= dateRange;
    })();
    const activeQuickFilters = Object.keys(quickFilters).filter(key => quickFilters[key]);
    const matchesQuickFilter = activeQuickFilters.length === 0 ||
      activeQuickFilters.includes(b.paymentStatus.toLowerCase());
    return matchesTab && matchesSearch && matchesDate && matchesQuickFilter;
  }).sort((a, b) => {
    const dateA = new Date(a.bookingDate || a.createdAt);
    const dateB = new Date(b.bookingDate || b.createdAt);
    return dateB - dateA;
  });

  const tabs = [
    { label: t('mb_all'), key: "All", count: bookings.length },
    { label: t('mb_active'), key: "Active", count: bookings.filter(b => ['pending', 'confirmed', 'accepted', 'created', 'in progress'].includes(b.status?.toLowerCase())).length },
    { label: t('mb_completed'), key: "Completed", count: bookings.filter(b => b.status?.toLowerCase() === 'completed').length },
    { label: t('mb_cancelled'), key: "Cancelled", count: bookings.filter(b => b.status?.toLowerCase() === 'cancelled').length },
  ];

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const visibleBookings = filteredBookings.slice(start, end);

  if (loading) return <div className="mb-page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}>{t('mb_loading')}</div>;
  if (error) return <div className="mb-page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px', color: 'red' }}>{error}</div>;

  const dateOptions = [
    { label: t('mb_all_time'), value: 0 },
    { label: t('mb_last_7'), value: 7 },
    { label: t('mb_last_30'), value: 30 },
    { label: t('mb_last_90'), value: 90 },
  ];

  return (
    <>
      <Header />
      <div className="mb-page-container">
        <button onClick={() => navigate('/home')} className="mb-back-btn">
          <FaArrowLeft /> {t('mb_back_dashboard')}
        </button>

        <div className="mb-header-section">
          <h1 className="mb-page-title">{t('mb_title')}</h1>
          <div className="mb-controls-row">
            <div className="mb-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setPage(1); }}
                  className={`mb-tab-btn ${activeTab === tab.key ? "active" : ""}`}
                >
                  {tab.label}
                  <span className={`mb-tab-count ${activeTab === tab.key ? "active" : ""}`}>{tab.count}</span>
                </button>
              ))}
            </div>

            <div className="mb-controls-right">
              <div className="relative" style={{ position: 'relative' }}>
                <button className="mb-filter-btn" onClick={() => setShowDateDropdown(!showDateDropdown)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaCalendarAlt /> {dateRange === 0 ? t('mb_all_time') : dateOptions.find(o => o.value === dateRange)?.label} ⌄
                  </span>
                </button>
                {showDateDropdown && (
                  <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '8px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 1000, padding: '8px 0' }}>
                    {dateOptions.map(opt => (
                      <button key={opt.value}
                        style={{ width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: '14px', border: 'none', background: 'none', cursor: 'pointer' }}
                        onClick={() => { setDateRange(opt.value); setShowDateDropdown(false); setPage(1); }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-search-wrapper">
                <span className="mb-search-icon"><FaSearch /></span>
                <input
                  className="mb-search-input"
                  placeholder={t('mb_search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-content-layout">
          <div className="mb-main-column">
            {visibleBookings.length === 0 ? (
              <div className="mb-empty-state" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                <p>{t('mb_no_bookings')}</p>
              </div>
            ) : (
              <div className="mb-cards-list">
                {visibleBookings.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mb-pagination">
                <p className="mb-showing-text">
                  {t('mb_showing')} {start + 1}–{Math.min(end, filteredBookings.length)} {t('mb_of_bookings')} {filteredBookings.length} {t('mb_bookings')}
                </p>
                <div className="mb-pagination-controls">
                  <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="mb-page-btn">
                    <FaChevronLeft size={12} />
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)} className={`mb-page-btn ${page === i + 1 ? "active" : ""}`}>
                      {i + 1}
                    </button>
                  ))}
                  <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="mb-page-btn">
                    <FaChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mb-sidebar-column">
            <div className={`mb-sidebar-card ${isStatsCollapsed ? 'collapsed' : ''}`}>
              <div className="mb-card-header-toggle" onClick={() => setIsStatsCollapsed(!isStatsCollapsed)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="mb-card-title" style={{ marginBottom: 0 }}>{t('mb_this_month')}</h3>
                <span className="mb-collapse-icon">{isStatsCollapsed ? <FaChevronDown /> : <FaChevronUp />}</span>
              </div>
              {!isStatsCollapsed && (
                <div className="mb-card-body">
                  <div className="mb-stat-row"><span>{t('mb_total_spent')}</span><span className="mb-stat-val">${bookings.filter(b => b.status?.toLowerCase() === 'completed').reduce((sum, b) => sum + (Number(b.price) || 0), 0)}</span></div>
                  <div className="mb-stat-row"><span>{t('mb_active_bookings')}</span><span className="mb-stat-val">{bookings.filter(b => ['pending', 'confirmed', 'accepted', 'created', 'in progress'].includes(b.status?.toLowerCase())).length}</span></div>
                  <div className="mb-stat-row"><span>{t('mb_completed_label')}</span><span className="mb-stat-val">{bookings.filter(b => b.status?.toLowerCase() === 'completed').length}</span></div>
                  <div className="mb-completion-section">
                    <p className="mb-label-sm">{t('mb_completion_rate')}</p>
                    <div className="mb-progress-bar">
                      <div className="mb-progress-fill" style={{ width: bookings.length > 0 ? `${(bookings.filter(b => b.status?.toLowerCase() === 'completed').length / bookings.length) * 100}%` : "0%" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`mb-sidebar-card ${isFiltersCollapsed ? 'collapsed' : ''}`}>
              <div className="mb-card-header-toggle" onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="mb-card-title" style={{ marginBottom: 0 }}>{t('mb_quick_filters')}</h3>
                <span className="mb-collapse-icon">{isFiltersCollapsed ? <FaChevronDown /> : <FaChevronUp />}</span>
              </div>
              {!isFiltersCollapsed && (
                <div className="mb-card-body">
                  <div className="mb-filters-list">
                    {[
                      { label: t('mb_payment_paid'), key: "paid", count: bookings.filter(b => b.paymentStatus === "Paid").length },
                      { label: t('mb_payment_released'), key: "released", count: bookings.filter(b => b.paymentStatus === "Released").length },
                    ].map((f) => (
                      <div key={f.label} className="mb-filter-item">
                        <label className="mb-checkbox-label">
                          <input type="checkbox" className="mb-checkbox" checked={quickFilters[f.key]}
                            onChange={() => { setQuickFilters(prev => ({ ...prev, [f.key]: !prev[f.key] })); setPage(1); }} />
                          {f.label}
                        </label>
                        <span className="mb-count-badge">{f.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyBookings;
