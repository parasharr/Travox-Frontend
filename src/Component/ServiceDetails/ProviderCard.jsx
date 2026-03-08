import React, { useState, useEffect } from "react";
import { MdVerified, MdSecurity, MdTimer, MdEmail, MdPhone, MdLocationOn, MdClose, MdCheckCircle } from "react-icons/md";
import { Link } from "react-router-dom";
import { useLanguage } from "../../LanguageContext";

const ProviderCard = ({ service }) => {
  const [showModal, setShowModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingNote, setBookingNote] = useState("");
  const [currentBooking, setCurrentBooking] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingLocation, setBookingLocation] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    const checkBookingStatus = async () => {
      try {
        const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await fetch(`${baseUrl}api/bookings/my`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const userBookings = data.data || (Array.isArray(data) ? data : []);
          const serviceId = service._id || service.id;
          const activeBooking = userBookings.find(b =>
            ((b.serviceId?._id || b.serviceId) === serviceId ||
              (b.service?._id || b.service) === serviceId) &&
            !["cancelled", "rejected", "completed"].includes((b.status || "").toLowerCase())
          );
          if (activeBooking) {
            setCurrentBooking(activeBooking);
            setBookingStatus((activeBooking.status || "pending").toLowerCase());
          } else {
            setCurrentBooking(null);
            setBookingStatus(null);
          }
        }
      } catch (err) {
        console.error("Error checking booking status:", err);
      }
    };
    if (service) checkBookingStatus();
  }, [service]);

  const provider = service.provider || {};

  const handleBookingSubmit = async () => {
    setIsBooking(true);
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          serviceId: service._id || service.id,
          providerId: provider._id || provider.id,
          date: new Date().toISOString().split('T')[0],
          notes: bookingNote,
          location: bookingLocation
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Booking failed");
      try {
        await fetch(`${baseUrl}api/users/stats`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ bookingsCount: 1 })
        });
      } catch (statsErr) { console.error("Failed to update user stats:", statsErr); }
      const newBooking = data.data || data;
      setCurrentBooking(newBooking);
      setBookingStatus("pending");
      setShowBookingModal(false);
      setBookingNote("");
      setBookingLocation("");
      setShowSuccessDialog(true);
    } catch (err) {
      console.error("Error creating booking:", err);
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!currentBooking) return;
    if (!window.confirm("Are you sure you want to cancel this booking request?")) return;
    setCanceling(true);
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
      const token = localStorage.getItem("token");
      const bookingId = currentBooking._id || currentBooking.id;
      const response = await fetch(`${baseUrl}api/bookings/${bookingId}/cancel`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to cancel booking");
      setCurrentBooking(null);
      setBookingStatus(null);
    } catch (err) {
      console.error("Error cancelling booking:", err);
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div className="sd-provider-card">
      <div className="sd-provider-header">
        <div className={`sd-provider-avatar ${service.color}`}>
          {service.company.charAt(0)}
        </div>
        <div>
          <p className="sd-provider-name">{service.company}</p>
          <p className="sd-provider-meta">
            <MdVerified className="sd-verify-icon" /> {t('sd_verified_provider')}
          </p>
          <p className="sd-provider-rating">⭐ {service.rating} ({service.reviews} {t('sd_reviews_label')})</p>
          <button onClick={() => setShowModal(true)} className="sd-view-profile-btn">
            {t('sd_view_profile')}
          </button>
        </div>
      </div>

      <div className="sd-price-section">
        <p className="sd-price">${service.price}</p>
        <p className="sd-price-detail">{t('sd_per_project')}</p>
      </div>

      {(() => {
        const isPending = bookingStatus === "pending" || bookingStatus === "created";
        const isAccepted = ["accepted", "in progress", "completed", "approved"].includes(bookingStatus);

        if (isPending) {
          return (
            <button onClick={handleCancelBooking} className="sd-btn-primary" disabled={canceling}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: canceling ? 'not-allowed' : 'pointer', border: 'none', backgroundColor: '#ef4444', opacity: canceling ? 0.7 : 1 }}>
              {canceling ? t('sd_cancelling') : t('sd_cancel_request')}
            </button>
          );
        }
        if (isAccepted) {
          return (
            <button className="sd-btn-primary booked" disabled={true}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'default', border: 'none', backgroundColor: '#10b981', opacity: 1 }}>
              {t('sd_booked')}
            </button>
          );
        }
        return (
          <button onClick={() => setShowBookingModal(true)} className="sd-btn-primary"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', border: 'none' }}>
            {t('sd_book_now')}
          </button>
        );
      })()}

      {showModal && (
        <div className="provider-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="provider-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px", padding: "0", overflow: "hidden", borderRadius: "20px" }}>
            <button className="modal-close-btn" onClick={() => setShowModal(false)} style={{ zIndex: 10 }}>
              <MdClose />
            </button>

            {/* Modal Header/Banner */}
            <div style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", height: "40px", position: "relative" }}>
            </div>

            <div style={{ padding: "0 20px 20px", marginTop: "-20px", textAlign: "center", position: "relative", zIndex: 1 }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                border: "3px solid white",
                background: "#f1f5f9",
                margin: "0 auto 8px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "bold",
                color: "#2563eb",
                boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                backgroundColor: service.color === 'blue' ? '#dbeafe' : (service.color === 'purple' ? '#f3e8ff' : '#f1f5f9')
              }}>
                {service.company.charAt(0)}
              </div>

              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", marginBottom: "0px" }}>{service.company}</h2>
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px", fontWeight: "500" }}>{t('sd_professional_profile')}</div>

              <div className="modal-body" style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "0px" }}>
                  <label style={{ fontSize: "9px", fontWeight: "700", textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.05em" }}>{t('sd_contact_person')}</label>
                  <p style={{ margin: 0, fontWeight: "600", color: "#334155", fontSize: "13px" }}>{provider.name || "N/A"}</p>
                </div>

                <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ background: "#eff6ff", color: "#3b82f6", width: "28px", height: "28px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MdEmail size={14} />
                  </div>
                  <p style={{ margin: 0, fontWeight: "500", color: "#475569", fontSize: "13px" }}>{provider.email || "N/A"}</p>
                </div>

                <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ background: "#eff6ff", color: "#3b82f6", width: "28px", height: "28px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MdPhone size={14} />
                  </div>
                  <p style={{ margin: 0, fontWeight: "500", color: "#475569", fontSize: "13px" }}>{provider.mobile || "N/A"}</p>
                </div>

                <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ background: "#eff6ff", color: "#3b82f6", width: "28px", height: "28px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MdLocationOn size={14} />
                  </div>
                  <p style={{ margin: 0, fontWeight: "500", color: "#475569", fontSize: "13px" }}>{provider.address || "N/A"}</p>
                </div>

                <div style={{ padding: "4px 4px", borderTop: "1px solid #f1f5f9", marginTop: "2px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "11px", color: "#64748b" }}>{t('sd_member_since')}</label>
                  <p style={{ margin: 0, fontWeight: "600", color: "#1e293b", fontSize: "12px" }}>
                    {provider.createdAt ? new Date(provider.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "N/A"}
                  </p>
                </div>
              </div>

              <button
                className="sd-btn-primary"
                onClick={() => setShowModal(false)}
                style={{ width: "100%", padding: "10px", borderRadius: "10px", fontWeight: "700", border: "none", fontSize: "14px" }}
              >
                {t('sd_close_profile')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBookingModal && (
        <div className="provider-modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="provider-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <button className="modal-close-btn" onClick={() => setShowBookingModal(false)}><MdClose /></button>
            <div className="modal-header">
              <h3>{t('sd_create_booking')}</h3>
              <p className="modal-subtitle">{t('sd_provide_details')}</p>
            </div>
            <div className="modal-body">
              <div className="booking-input-container" style={{ width: '100%', marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#1e293b' }}>{t('sd_service_location')}</label>
                <div style={{ position: 'relative' }}>
                  <MdLocationOn style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input type="text" value={bookingLocation} onChange={(e) => setBookingLocation(e.target.value)} placeholder={t('sd_enter_address')}
                    style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', fontFamily: 'inherit' }} />
                </div>
              </div>
              <div className="booking-note-container" style={{ width: '100%' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#1e293b' }}>{t('sd_additional_notes')}</label>
                <textarea value={bookingNote} onChange={(e) => setBookingNote(e.target.value)} placeholder={t('sd_notes_placeholder')}
                  style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'vertical', fontSize: '14px', fontFamily: 'inherit' }} />
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '20px' }}>
              <button className="modal-action-btn" onClick={() => setShowBookingModal(false)} style={{ background: '#f1f5f9', color: '#64748b' }}>{t('sd_cancel')}</button>
              <button className="modal-action-btn" onClick={handleBookingSubmit} disabled={isBooking}>
                {isBooking ? t('sd_booking') : t('sd_confirm_booking')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessDialog && (
        <div className="provider-modal-overlay" onClick={() => setShowSuccessDialog(false)}>
          <div className="provider-modal success-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center', padding: '40px 30px' }}>
            <div className="success-icon-wrapper" style={{ marginBottom: '20px' }}>
              <MdCheckCircle style={{ fontSize: '70px', color: '#10b981' }} />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '10px', color: '#1e293b' }}>{t('sd_booking_successful')}</h3>
            <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>
              {t('sd_booking_success_msg')}
            </p>
            <button className="modal-action-btn" onClick={() => setShowSuccessDialog(false)} style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
              {t('sd_great_thanks')}
            </button>
          </div>
        </div>
      )}

      <ul className="sd-trust-list">
        <li><MdSecurity /> {t('sd_secure_payment')}</li>
        <li><MdVerified /> {t('sd_money_back')}</li>
        <li><MdTimer /> {t('sd_response_time')}</li>
      </ul>

      <div className="sd-cancellation">
        <span>{t('sd_cancellation_policy')}</span>
        <span>ˇ</span>
      </div>
      <div className="sd-report">
        {t('sd_report_service')}
      </div>
    </div>
  );
};

export default ProviderCard;
