import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Header from "../Home/Navbar/Navbar";
import { services } from "../../data/servicesData";
import { useLanguage } from "../../LanguageContext";

const RateExperience = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const maxChars = 500;
  const { t } = useLanguage();

  const stateService = location.state?.service;
  const service = stateService
    ? (services.find(s => s.id === stateService.id) || stateService)
    : null;

  const providerName = service?.provider || service?.company || "CleanPro Services";
  const serviceTitle = service?.title || "Home Cleaning · Deep Clean Package";
  const avatarInitials = providerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const ratingLabels = [t('re_poor'), t('re_fair'), t('re_good'), t('re_very_good'), t('re_excellent')];

  const handleSubmit = async () => {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
      const token = localStorage.getItem("token");
      const bookingId = stateService?.id || service?.id;
      const reviewPayload = { bookingId, rating, comment: feedback };
      const reviewResponse = await fetch(`${baseUrl}api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(reviewPayload)
      });
      if (!reviewResponse.ok) {
        const errorData = await reviewResponse.json();
        const message = errorData.message || await reviewResponse.text();
        setErrorMessage(message);
        setShowErrorModal(true);
        return;
      }
      const statsResponse = await fetch(`${baseUrl}api/users/stats`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ reviewsCount: 1 })
      });
      if (!statsResponse.ok) console.warn("Failed to update user stats");

      setShowSuccessModal(true);
      setTimeout(() => navigate("/my-bookings"), 2000);
    } catch (error) {
      console.error("Error submitting review:", error);
      setErrorMessage("Failed to submit review. Please try again.");
      setShowErrorModal(true);
    }
  };

  return (
    <>
      <Header />
      <div className="re-container">
        <div className="re-header">
          <div className="re-service-icon-wrapper">
            {service?.icon ? <service.icon /> : "✏️"}
          </div>
          <h1 className="re-PageTitle">{t('re_title')}</h1>
          <p className="re-subtitle">{serviceTitle}</p>
          <p className="re-provider-name">{providerName}</p>
        </div>

        <div className="re-card">
          <div className="re-rating-group">
            {ratingLabels.map((label, index) => {
              const starValue = index + 1;
              return (
                <div key={starValue} className="re-star-wrapper" onClick={() => setRating(starValue)}>
                  <FaStar
                    size={32}
                    className="re-star"
                    color={(hover || rating) >= starValue ? "#FBBF24" : "#E5E7EB"}
                    onMouseEnter={() => setHover(starValue)}
                    onMouseLeave={() => setHover(0)}
                  />
                  <span className="re-star-label">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="re-card">
          <h3 className="re-card-title">{t('re_share_feedback')}</h3>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            maxLength={maxChars}
            rows={5}
            placeholder={t('re_feedback_placeholder')}
            className="re-textarea"
          />
          <p className="re-char-count">
            {feedback.length} / {maxChars} {t('re_characters')}
          </p>
        </div>

        <div className="re-card re-accordion">
          <span className="re-label">{t('re_rate_aspects')}</span>
          <span className="re-arrow">⌄</span>
        </div>

        <div className="re-card re-accordion">
          <span className="re-label">{t('re_add_photos')}</span>
          <button className="re-add-photo-btn">{t('re_add_photos_btn')}</button>
        </div>

        <button className="re-submit-btn" disabled={rating === 0} onClick={handleSubmit}>
          {t('re_submit')}
        </button>

        <p className="re-skip-link">{t('re_skip')}</p>

        <p className="re-disclaimer">{t('re_disclaimer')}</p>
      </div>

      {showSuccessModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100
        }}>
          <div style={{
            background: "white", borderRadius: "16px", width: "90%", maxWidth: "400px", padding: "32px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", display: "flex", flexDirection: "column",
            alignItems: "center", gap: "16px", textAlign: "center"
          }}>
            <div style={{
              background: "#dcfce7", color: "#16a34a", width: "64px", height: "64px",
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <FiCheckCircle size={32} />
            </div>
            <h3 style={{ margin: "0", fontSize: "1.25rem", color: "#111827", fontWeight: "600" }}>Review Submitted!</h3>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "#6b7280", lineHeight: "1.5" }}>
              Thank you for sharing your feedback.
            </p>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100
        }} onClick={() => setShowErrorModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "white", borderRadius: "16px", width: "90%", maxWidth: "400px", padding: "24px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", display: "flex", flexDirection: "column", gap: "16px", position: 'relative'
          }}>
            <div style={{ display: "flex", alignItems: "start", gap: "16px" }}>
              <div style={{ background: "#fee2e2", color: "#dc2626", width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FiAlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "1.1rem", color: "#111827" }}>{t('re_submission_failed')}</h3>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", lineHeight: "1.5" }}>{errorMessage}</p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
              <button onClick={() => setShowErrorModal(false)} style={{ padding: "10px 16px", background: "#dc2626", border: "none", color: "white", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}>
                {t('re_close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RateExperience;
