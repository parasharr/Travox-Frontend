import React from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";

const BookingCard = ({ booking }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Remove non-serializable properties (like functions/components) from state
    const { icon, ...serializableBooking } = booking;
    // ensure providerId is available for the Payment page
    serializableBooking.providerId = booking.providerId || null;

    if (booking.paymentStatus === 'Paid' || booking.paymentStatus === 'Released') {
      navigate(`/rate-experience`, { state: { service: serializableBooking } });
    } else {
      navigate(`/payment`, { state: { service: serializableBooking } });
    }
  };

  return (
    <div className="mb-booking-card" onClick={handleClick} style={{ cursor: 'pointer' }}>
      {/* LEFT ICON */}
      <div className="mb-card-icon-area">
        <span className="mb-card-icon">
          {typeof booking.icon === 'function' ? <booking.icon /> : booking.icon}
        </span>
      </div>

      {/* RIGHT CONTENT */}
      <div className="mb-card-content">
        <div className="mb-card-header">
          <span className="mb-card-id">#{booking.id}</span>
          <span className={`mb-status-badge ${booking.paymentStatus.toLowerCase()}`}>
            {booking.paymentStatusLabel || booking.paymentStatus}
          </span>
        </div>

        <h3 className="mb-card-title">{booking.title}</h3>

        <div className="mb-card-provider">
          <span className="mb-provider-avatar">CP</span>
          <span className="mb-provider-name">{booking.provider}</span>
          <span className="mb-verified-badge"></span>
        </div>

        <div className="mb-card-time">
          📅 {booking.time}
        </div>

        <div className="mb-card-footer">
          <span className="mb-card-price text-blue">${booking.price.toFixed(2)}</span>
          <span className="mb-arrow-icon">
            <FaChevronRight size={14} />
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
