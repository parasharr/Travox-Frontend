import React from 'react';
import {
  FaBroom, FaWrench, FaDumbbell, FaPaintBrush,
  FaStar, FaCheckCircle, FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import './Cards.css';
import { useLanguage } from '../../../LanguageContext';

export default function Cards() {
  const { t } = useLanguage();

  const data = [
    { titleKey: "cards_deep_cleaning", provider: "CleanPro Services", price: "$75", rating: "4.9", reviews: "(156)", color: "#3b82f6", icon: <FaBroom /> },
    { titleKey: "cards_plumbing_repair", provider: "FixIt Masters", price: "$85", rating: "4.8", reviews: "(203)", color: "#f59e0b", icon: <FaWrench /> },
    { titleKey: "cards_personal_training", provider: "FitLife Coaching", price: "$60", rating: "4.7", reviews: "(124)", color: "#10b981", icon: <FaDumbbell /> },
    { titleKey: "cards_graphic_design", provider: "Creative Studio", price: "$120", rating: "5.0", reviews: "(89)", color: "#8b5cf6", icon: <FaPaintBrush /> },
  ];

  return (
    <div className="cards-section">
      <div className="section-header">
        <h2 className="section-title">{t('cards_recommended')}</h2>
        <div className="nav-arrows">
          <button className="arrow-btn"><FaChevronLeft /></button>
          <button className="arrow-btn"><FaChevronRight /></button>
        </div>
      </div>

      <div className="cards-grid">
        {data.map((item, i) => (
          <div key={i} className="service-card">
            {/* Top Colored Banner */}
            <div className="card-banner" style={{ backgroundColor: item.color }}>
              {item.icon}
            </div>

            {/* Bottom Content Area */}
            <div className="card-body">
              <div className="card-info">
                <h4 className="card-title">{t(item.titleKey)}</h4>
                <div className="provider-row">
                  {item.provider} <FaCheckCircle className="verified-badge" />
                </div>
              </div>

              <div className="card-footer-stats">
                <div className="rating-row">
                  <FaStar className="star-icon" />
                  <span className="rating-num">{item.rating}</span>
                  <span className="review-count">{item.reviews}</span>
                </div>
                <div className="price-label">{item.price}</div>
              </div>

              {/* This button will now stay perfectly at the bottom */}
              <button className="view-details-btn">{t('cards_view_details')}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}