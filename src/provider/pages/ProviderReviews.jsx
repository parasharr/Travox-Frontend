import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FiStar, FiChevronDown, FiSearch, FiCornerUpLeft } from "react-icons/fi";
import "../provider.css";
import { useLanguage } from "../../LanguageContext";

const ProviderReviews = () => {
    const location = useLocation();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });
    const { t } = useLanguage();

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const token = localStorage.getItem("token");
                const providerId = localStorage.getItem("userId");
                const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

                const response = await fetch(`${baseUrl}api/reviews/provider/${providerId}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch reviews");
                }

                const data = await response.json();
                console.log("Reviews API Response:", data);
                const fetchedReviews = Array.isArray(data) ? data : (data.data || data.reviews || []);

                setReviews(fetchedReviews);
                calculateStats(fetchedReviews);
            } catch (err) {
                console.error("Error fetching reviews:", err);
                setError("Failed to load reviews. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [location.key]);

    const calculateStats = (reviewsData) => {
        if (!reviewsData.length) return;

        const total = reviewsData.length;
        const sum = reviewsData.reduce((acc, review) => acc + (review.rating || 0), 0);
        const avg = total > 0 ? (sum / total).toFixed(1) : 0;

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewsData.forEach(review => {
            const rating = Math.round(review.rating) || 0;
            if (distribution[rating] !== undefined) {
                distribution[rating]++;
            }
        });

        setStats({
            averageRating: avg,
            totalReviews: total,
            ratingDistribution: distribution
        });
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <FiStar
                key={i}
                className={`star-icon ${i < rating ? 'filled' : ''}`}
                style={{ fill: i < rating ? '#fbbf24' : 'none', color: i < rating ? '#fbbf24' : '#cbd5e1' }}
            />
        ));
    };

    if (loading) {
        return (
            <div className="dashboard-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <div style={{ color: '#64748b' }}>{t('prev_loading')}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
                <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
                <button
                    className="primary-btn"
                    onClick={() => window.location.reload()}
                    style={{ padding: '8px 16px', borderRadius: '6px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    {t('prev_retry')}
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="page-header-row">
                <h1 className="page-title">{t('prev_title')}</h1>
                <select className="simple-select">
                    <option>{t('prev_all_time')}</option>
                    <option>{t('prev_last_30')}</option>
                    <option>{t('prev_this_year')}</option>
                </select>
            </div>

            {/* Ratings Overview Card */}
            <div className="reviews-overview-card">
                <div className="overview-main-score">
                    <div className="big-star-icon"><FiStar style={{ fill: '#fbbf24', stroke: 'none' }} /></div>
                    <div className="score-num">{stats.averageRating}</div>
                    <div className="score-label">{t('prev_out_of_5')}</div>
                    <div className="score-sub">{t('prev_based_on')} {stats.totalReviews} {t('prev_reviews')}</div>
                </div>

                <div className="overview-bars">
                    {[5, 4, 3, 2, 1].map((star) => {
                        const count = stats.ratingDistribution[star];
                        const percentage = stats.totalReviews > 0 ? ((count / stats.totalReviews) * 100).toFixed(0) : 0;

                        return (
                            <div key={star} className="rating-bar-row">
                                <span className="bar-label">{star} {t('prev_stars')}</span>
                                <div className="progress-track">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: '#fbbf24'
                                        }}
                                    ></div>
                                </div>
                                <span className="bar-val">
                                    {percentage}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="reviews-sub-stats">
                <div className="sub-stat-box">
                    <span>{t('prev_quality')}</span>
                    <div className="ss-score">{stats.averageRating}</div>
                    <div className="ss-stars">{renderStars(Math.round(Number(stats.averageRating)))}</div>
                </div>
                <div className="sub-stat-box">
                    <span>{t('prev_communication')}</span>
                    <div className="ss-score">{Number(stats.averageRating) > 0.2 ? (Number(stats.averageRating) - 0.2).toFixed(1) : stats.averageRating}</div>
                    <div className="ss-stars">{renderStars(Math.round(Number(stats.averageRating)))}</div>
                </div>
                <div className="sub-stat-box">
                    <span>{t('prev_timeliness')}</span>
                    <div className="ss-score">{stats.averageRating}</div>
                    <div className="ss-stars">{renderStars(Math.round(Number(stats.averageRating)))}</div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="reviews-content-section">
                <div className="reviews-list-filters">
                    <div className="rl-left">
                        <select className="filter-select"><option>{t('prev_all_reviews')}</option></select>
                        <select className="filter-select"><option>{t('prev_most_recent')}</option></select>
                    </div>
                    <div className="search-input-wrapper">
                        <FiSearch />
                        <input type="text" placeholder={t('prev_search')} />
                    </div>
                </div>

                <div className="table-card" style={{ marginTop: '20px' }}>
                    <div style={{ overflowX: "auto" }}>
                        <table className="provider-table">
                            <thead>
                                <tr>
                                    <th>{t('prev_client')}</th>
                                    <th>{t('prev_service')}</th>
                                    <th>{t('prev_rating')}</th>
                                    <th>{t('prev_comment')}</th>
                                    <th>{t('prev_date')}</th>
                                    <th>{t('prev_action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                                            {t('prev_no_reviews')}
                                        </td>
                                    </tr>
                                ) : (
                                    reviews.map((review) => (
                                        <tr key={review._id || review.id}>
                                            <td>
                                                <div className="client-cell">
                                                    <div className="client-avatar">
                                                        {(review.clientName || review.client?.name || "A").charAt(0)}
                                                    </div>
                                                    <span>{review.clientName || review.client?.name || "Anonymous"}</span>
                                                </div>
                                            </td>
                                            <td>{review.serviceName || review.service?.name || "Service"}</td>
                                            <td>
                                                <div className="r-stars" style={{ display: 'flex', gap: '2px' }}>
                                                    {renderStars(review.rating)}
                                                </div>
                                            </td>
                                            <td style={{ maxWidth: '300px' }}>
                                                <div style={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    fontSize: '13px',
                                                    color: '#64748b'
                                                }}>
                                                    {review.comment || review.review}
                                                </div>
                                            </td>
                                            <td><span className="r-date">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : (review.date || "Recent")}</span></td>
                                            <td>
                                                {review.response ? (
                                                    <span className="status-badge status-completed">{t('prev_responded')}</span>
                                                ) : (
                                                    <button className="respond-btn text-blue" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', padding: 0, color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}>
                                                        <FiCornerUpLeft /> {t('prev_respond')}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="pagination-bar">
                    <span>{t('prev_showing')} {reviews.length > 0 ? `1-${reviews.length}` : '0'} {t('prev_of')} {stats.totalReviews} {t('prev_reviews')}</span>
                    <div className="pagination-controls">
                        <button>&lt;</button>
                        <button className="active">1</button>
                        <button>&gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderReviews;
