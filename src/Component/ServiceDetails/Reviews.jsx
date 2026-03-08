import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { useLanguage } from "../../LanguageContext";

const Reviews = ({ reviews = [], stats = {} }) => {
  const [visible, setVisible] = useState(3);
  const { t } = useLanguage();

  const averageRating = stats.averageRating || "0.0";
  const totalReviews = stats.totalReviews || 0;

  return (
    <div className="sd-reviews-container">
      <h2 className="sd-section-title">{t('sd_customer_reviews')}</h2>

      <div className="sd-review-summary">
        <div className="sd-review-score">
          <p className="score">{averageRating}</p>
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} color={i < Math.round(parseFloat(averageRating)) ? "#ffc107" : "#e4e5e9"} />
            ))}
          </div>
          <p className="review-count">
            {t('sd_based_on')} {totalReviews} {t('sd_reviews_label')}
          </p>
        </div>

        <div className="sd-rating-bars">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="rating-bar-row">
              <span className="star-label">{star} {t('sd_stars')}</span>
              <div className="bar-container">
                <div className="bar-fill" style={{ width: `0%` }} />
              </div>
              <span className="percentage">0%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sd-reviews-list">
        {reviews.length > 0 ? (
          reviews.slice(0, visible).map((review) => (
            <div key={review._id || review.id} className="review-item">
              <div className="review-header">
                <div className="reviewer-avatar">
                  {review.name ? review.name[0] : "U"}
                </div>
                <div className="reviewer-info">
                  <p className="reviewer-name">{review.name || "Anonymous"}</p>
                  <div className="reviewer-rating">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} color={i < review.rating ? "#ffc107" : "#e4e5e9"} />
                    ))}
                  </div>
                </div>
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString() || "Recently"}
                </span>
              </div>
              <p className="review-text">{review.comment}</p>
            </div>
          ))
        ) : (
          <p className="no-reviews-text">{t('sd_no_reviews')}</p>
        )}
      </div>

      {visible < reviews.length && (
        <button onClick={() => setVisible((v) => v + 3)} className="sd-load-more">
          {t('sd_load_more')}
        </button>
      )}
    </div>
  );
};

export default Reviews;
