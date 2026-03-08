import React, { useState, useEffect } from "react";
import "../../user.css";
import { FiX } from "react-icons/fi";
import { useLanguage } from "../../LanguageContext";

const ProfessionalSidebar = ({
  isOpen, onClose, selectedCategory, onCategoryChange,
  priceRange, onPriceChange, rating, onRatingChange,
  availability, onAvailabilityChange, providerTypes,
  onProviderTypeChange, verifiedOnly, onVerifiedChange, onClearAll
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
        const token = localStorage.getItem("token");
        const response = await fetch(`${baseUrl}api/admin/categories`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        const categoryList = data.data || data.categories || data;
        if (Array.isArray(categoryList)) {
          setCategories(categoryList);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryToggle = (catName) => {
    if (selectedCategory === catName) {
      onCategoryChange(null);
    } else {
      onCategoryChange(catName);
    }
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    onPriceChange(prev => ({ ...prev, [name]: value }));
  };

  const handleProviderTypeToggle = (type) => {
    onProviderTypeChange(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <aside className={`pro-sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-mobile-header">
        <h3>{t('pro_filters')}</h3>
        <button className="close-sidebar-btn" onClick={onClose}><FiX /></button>
      </div>

      <div className="sidebar-header">
        <h3>{t('pro_filters')}</h3>
        <button className="clear-btn" onClick={onClearAll}>{t('pro_clear_all')}</button>
      </div>

      <div className="filter-section">
        <h4>{t('pro_category')}</h4>
        {loading ? (
          <p className="loading-text">{t('pro_loading')}</p>
        ) : categories.length > 0 ? (
          categories.map((cat) => (
            <label key={cat._id || cat.id} className="checkbox-row">
              <input
                type="checkbox"
                checked={selectedCategory === cat.name}
                onChange={() => handleCategoryToggle(cat.name)}
              />
              {cat.name} {cat.count && <span>{cat.count}</span>}
            </label>
          ))
        ) : (
          <p className="no-data-text">{t('pro_no_categories')}</p>
        )}
      </div>

      <div className="filter-section">
        <h4>{t('pro_price_range')}</h4>
        <div className="currency-tabs">
          <button className="active">USD</button>
          <button>CDF</button>
        </div>
        <div className="price-inputs">
          <input type="number" placeholder="Min" name="min" value={priceRange.min} onChange={handlePriceChange} />
          <input type="number" placeholder="Max" name="max" value={priceRange.max} onChange={handlePriceChange} />
        </div>
        <input type="range" min="0" max="500" value={priceRange.max || 0} onChange={(e) => onPriceChange(prev => ({ ...prev, max: e.target.value }))} />
      </div>

      <div className="filter-section">
        <h4>{t('pro_rating')}</h4>
        <label className="radio-row">
          <input type="radio" name="rating" checked={rating === "all"} onChange={() => onRatingChange("all")} />
          {t('pro_all_ratings')}
        </label>
        <label className="radio-row">
          <input type="radio" name="rating" checked={rating === 4} onChange={() => onRatingChange(4)} />
          ⭐⭐⭐⭐ & up
        </label>
        <label className="radio-row">
          <input type="radio" name="rating" checked={rating === 3} onChange={() => onRatingChange(3)} />
          ⭐⭐⭐ & up
        </label>
      </div>

      <div className="filter-section">
        <h4>{t('pro_availability')}</h4>
        <input type="date" className="date-input" value={availability} onChange={(e) => onAvailabilityChange(e.target.value)} />
      </div>

      <div className="filter-section">
        <h4>{t('pro_provider_type')}</h4>
        <label className="checkbox-row">
          <input type="checkbox" checked={providerTypes.individual} onChange={() => handleProviderTypeToggle("individual")} />
          {t('pro_individual')} <span>68</span>
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={providerTypes.business} onChange={() => handleProviderTypeToggle("business")} />
          {t('pro_business')} <span>56</span>
        </label>
      </div>

      <div className="filter-section toggle-row">
        <span>{t('pro_verified_only')}</span>
        <label className="switch">
          <input type="checkbox" checked={verifiedOnly} onChange={(e) => onVerifiedChange(e.target.checked)} />
          <span className="slider"></span>
        </label>
      </div>

      <button className="apply-btn">{t('pro_apply_filters')}</button>
    </aside>
  );
};

export default ProfessionalSidebar;
