import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MdOutlineDateRange, MdTune, MdSearch, MdOutlineMessage,
  MdCleaningServices, MdHandyman, MdFitnessCenter, MdPalette,
  MdCreditCard, MdPerson, MdChevronRight, MdChevronLeft
} from "react-icons/md";

import { FaHeadphones } from "react-icons/fa";
import '../../../user.css';
import Header from '../Navbar/Navbar';
import RecentActivity from './RecentActivity';
import './MainSkeleton.css';
import { useLanguage } from '../../../LanguageContext';

const Dashboard = () => {
  const [userName, setUserName] = useState('User');
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/professional?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/professional');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId) {
        setIsUserLoading(false);
        return;
      }

      try {
        const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
        const response = await fetch(`${baseUrl}api/users/${userId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Failed to fetch user");

        const data = await response.json();
        const user = data.data || data;

        if (user && user.name) {
          setUserName(user.name);
          localStorage.setItem('loginName', user.name);
        }
      } catch (err) {
        console.error("Error fetching user data in Main:", err);
      } finally {
        setIsUserLoading(false);
      }
    };

    const storedName = localStorage.getItem('loginName');
    if (storedName) {
      setUserName(storedName);
    }

    fetchUserData();

    const updateDateTime = () => {
      const now = new Date();
      const locale = language === 'fr' ? 'fr-FR' : 'en-US';
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      const dateStr = now.toLocaleDateString(locale, options);
      const timeStr = now.toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      setCurrentDateTime(`${dateStr} • ${timeStr}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, [language]);

  return (
    <div className="dashboard-page">
      <Header />

      <div className="dashboard-content-wrapper">
        <main className="main-layout">
          {/* --- LEFT COLUMN --- */}
          <div className="content-column">
            <section className="welcome-banner">
              <h1>
                {t('dash_welcome')}{' '}
                {isUserLoading ? (
                  <span className="username-skeleton"></span>
                ) : (
                  userName
                )}
                !
              </h1>
              <p className="date-time">
                <MdOutlineDateRange /> {currentDateTime}
              </p>
            </section>

            {/* Search and Filters */}
            <section className="search-filter-section">
              <div className="search-bar-wrapper">
                <input
                  type="text"
                  placeholder={t('dash_search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="dash-filter-btn" onClick={handleSearch}>
                  <MdTune />
                </button>
              </div>
              <div className="pill-tags">
                <span onClick={() => navigate('/professional?category=Home cleaning')}>{t('dash_home_cleaning')}</span>
                <span onClick={() => navigate('/professional?category=Plumbing')}>{t('dash_plumbing')}</span>
                <span onClick={() => navigate('/professional?category=Personal training')}>{t('dash_personal_training')}</span>
              </div>
            </section>

            <div className="overview-grid">
              <Link to="/my-bookings" className="dash-info-card-link">
                <div className="dash-info-card">
                  <div className="dash-icon-row">
                    <div className="icon-box blue-bg"><MdOutlineDateRange /></div>
                    <span className="dash-badge">3</span>
                  </div>
                  <h3>{t('dash_my_bookings')}</h3>
                  <p>{t('dash_active_bookings')}</p>
                  <span className="card-link">{t('dash_view_all_bookings')}</span>
                </div>
              </Link>

              <Link to="/payment" className="dash-info-card-link">
                <div className="dash-info-card">
                  <div className="dash-icon-row">
                    <div className="icon-box blue-bg"><MdCreditCard /></div>
                  </div>
                  <h3>{t('dash_payment_methods')}</h3>
                  <p>{t('dash_manage_cards')}</p>
                  <div className="card-preview">**** 4532</div>
                  <span className="card-link">{t('dash_manage_cards_link')}</span>
                </div>
              </Link>

              <div className="dash-info-card">
                <div className="dash-icon-row">
                  <div className="icon-box blue-bg"><MdPerson /></div>
                </div>
                <h3>{t('dash_my_profile')}</h3>
                <p>{t('dash_complete_profile')}</p>
                <div className="progress-container">
                  <div className="progress-bar" style={{ width: '75%' }}></div>
                </div>
                <Link to="/profile" className="card-link">{t('dash_view_profile')}</Link>
              </div>
            </div>

            <RecommendedServices />
            <RecentActivity />
          </div>

          {/* --- RIGHT COLUMN (SIDEBAR) --- */}
          <aside className="sidebar-column">
            <div className="help-card">
              <div className="help-icon"><FaHeadphones /></div>
              <h3>{t('dash_need_help')}</h3>
              <p>{t('dash_support_available')}</p>
              <button className="chat-button" onClick={() => navigate('/raise-dispute')}>{t('dash_raise_dispute')}</button>
            </div>

            <div className="help-card">
              <div className="help-icon"><MdOutlineMessage /></div>
              <h3>{t('dash_reach_admin')}</h3>
              <p>{t('dash_question_msg')}</p>
              <button className="chat-button" onClick={() => navigate('/message')}>{t('dash_message')}</button>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

const RecommendedServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
        const token = localStorage.getItem("token");
        const response = await fetch(`${baseUrl}api/services/user/all`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Failed to fetch services");

        const data = await response.json();
        const serviceList = data.data || data.services || data;

        if (Array.isArray(serviceList)) {
          setServices(serviceList.slice(0, 4));
        }
      } catch (err) {
        console.error("Error fetching recommended services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) return <div className="recommended-section"><p>{t('dash_loading_recommendations')}</p></div>;

  return (
    <section className="cards-section">
      <div className="section-header">
        <h2>{t('dash_recommended')}</h2>
        <div className="nav-arrows">
          <Link to="/professional" className="view-all-link">{t('dash_view_all')}</Link>
        </div>
      </div>
      <div className="service-grid">
        {services.length > 0 ? (
          services.map((s) => (
            <ServiceCard
              key={s._id || s.id}
              icon={s.icon}
              title={s.name}
              provider={s.provider?.companyName || "Professional Provider"}
              price={`$${s.price}`}
              color={s.color || "#3b82f6"}
              slug={s._id || s.id || s.slug}
              rating={s.rating || s.averageRating || 0}
              reviews={s.reviews || s.totalReviews || s.reviewCount || 0}
            />
          ))
        ) : (
          <p>{t('dash_no_recommendations')}</p>
        )}
      </div>
    </section>
  );
};

const ServiceCard = ({ icon, title, provider, price, color, slug, rating, reviews }) => {
  const { t } = useLanguage();
  const renderIcon = () => {
    if (!icon) return "🛠️";
    if (typeof icon === 'string') return icon;
    return icon;
  };

  return (
    <div className="service-card">
      <div className="card-banner" style={{ backgroundColor: color }}>
        {renderIcon()}
      </div>
      <div className="card-details">
        <h3>{title}</h3>
        <p className="provider-name">{provider}</p>
        <div className="card-meta">
          <span className="rating">⭐ {rating} ({reviews})</span>
          <span className="price-tag">{price}</span>
        </div>
        <Link to={`/services/${slug}`}>
          <button className="details-btn">{t('dash_view_details')}</button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;