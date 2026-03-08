import React, { useState, useEffect, useCallback } from "react";
import { IoMdGrid } from "react-icons/io";
import { GoListUnordered } from "react-icons/go";
import { FaStar } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { Link } from "react-router-dom";
import "../../user.css";
import { FiFilter, FiSearch } from "react-icons/fi";
import { useLanguage } from "../../LanguageContext";

const Rightsidebar = ({
  onToggleSidebar, selectedCategory, priceRange, rating,
  availability, providerTypes, verifiedOnly, initialSearch
}) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(initialSearch || "");
  const { t } = useLanguage();

  useEffect(() => {
    if (initialSearch) {
      setSearchTerm(initialSearch);
      fetchServices(initialSearch);
    }
  }, [initialSearch]);
  const [viewMode, setViewMode] = useState("grid");

  const itemsPerPage = 9;

  const fetchServices = useCallback(async (searchQuery = "") => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
      const response = await fetch(`${baseUrl}api/services/public?search=${searchQuery}`);
      if (!response.ok) throw new Error("Failed to fetch services");
      const data = await response.json();
      const serviceList = data.data || (Array.isArray(data) ? data : []);
      setServices(serviceList);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Unable to load services. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchServices]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredServices = services.filter((s) => {
    const matchesCategory = !selectedCategory || s.category?.name === selectedCategory;
    const matchesPrice = (!priceRange.min || s.price >= Number(priceRange.min)) &&
      (!priceRange.max || s.price <= Number(priceRange.max));
    const matchesRating = rating === "all" || (s.rating >= rating);
    const matchesVerified = !verifiedOnly || s.verified === true;
    const anyProviderTypeSelected = providerTypes.individual || providerTypes.business;
    const matchesProviderType = !anyProviderTypeSelected ||
      (providerTypes.individual && s.provider?.type === "individual") ||
      (providerTypes.business && s.provider?.type === "business");
    return matchesCategory && matchesPrice && matchesRating && matchesVerified && matchesProviderType;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredServices.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  return (
    <div className="services-wrapper">
      <div className="category-header-box">
        <h1>{selectedCategory || t('pro_title')}</h1>
        <div className="category-stats">
          <FaStar className="star-icon" />
          <span>0.0 (0 {t('pro_reviews')})</span>
          <span className="dot">•</span>
          <span>3</span>
        </div>
      </div>

      <div className="services-topbar">
        <button className="filter-toggle-btn" onClick={onToggleSidebar}>
          <FiFilter /> {t('pro_filters')}
        </button>

        <div className="pro-search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('pro_search_placeholder')}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="view-toggle">
          <button className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")}>
            <IoMdGrid />
          </button>
          <button className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>
            <GoListUnordered />
          </button>
        </div>

        <select className="sort-select">
          <option>{t('pro_sort_relevance')}</option>
        </select>
      </div>

      {loading ? (
        <div className="pro-loading-state">
          <p>{t('pro_loading_services')}</p>
        </div>
      ) : error ? (
        <div className="pro-error-state">
          <p>{error}</p>
          <button onClick={() => fetchServices(searchTerm)} className="retry-btn">Retry</button>
        </div>
      ) : (
        <>
          <div className={viewMode === "grid" ? "pro-services-grid" : "pro-services-list"}>
            {currentItems.length > 0 ? (
              currentItems.map((s) => (
                <div key={s._id || s.id} className={`service-card ${viewMode === 'list' ? 'list' : ''}`}>
                  <div className={`card-banner ${s.color || 'blue'}`}>
                    {s.icon ? (typeof s.icon === 'string' ? s.icon : <s.icon className="icon" />) : "🛠️"}
                    {s.verified && (
                      <span className="verified-badge">
                        <MdVerified className="verify" /> {t('pro_verified')}
                      </span>
                    )}
                  </div>
                  <div className="cardBody">
                    <h3>{s.name}</h3>
                    <p className="company">{s.provider?.companyName || "Professional Provider"}</p>
                    <div className="rating">
                      <FaStar /> {s.rating || s.averageRating || 0} <span>({s.reviews || s.totalReviews || s.reviewCount || 0})</span>
                      <span className="price">${s.price}</span>
                    </div>
                    <div className="cardFooter">
                      <Link to={`/services/${s._id || s.id}`}>
                        <button>{t('pro_view_details')}</button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>{t('pro_no_results')}</p>
              </div>
            )}
          </div>

          {totalPages > 0 && (
            <div className="pagination">
              <span>
                {t('pro_showing')} {filteredServices.length === 0 ? 0 : startIndex + 1}–
                {Math.min(startIndex + itemsPerPage, filteredServices.length)} {t('pro_of')} {filteredServices.length}
              </span>
              <div className="page-buttons">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setCurrentPage(n)} className={n === currentPage ? "active" : ""}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Rightsidebar;
