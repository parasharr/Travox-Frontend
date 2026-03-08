import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PaymentProgress from "./PaymentProgress";
import { FaLock } from "react-icons/fa";
import { services } from "../../data/servicesData";
import Header from "../Home/Navbar/Navbar";
import { useLanguage } from "../../LanguageContext";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_placeholder");

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stateService = location.state?.service;
  const { t } = useLanguage();

  const service = stateService ? (services.find(s => s.id === stateService.id) || stateService) : null;
  const servicePrice = service ? parseFloat(String(service.price).replace(/[^0-9.]/g, '')) : 85.00;
  const serviceFee = servicePrice * 0.10;
  const total = servicePrice + serviceFee;

  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const customerId = localStorage.getItem("userId") || "guest"; // Provide a fallback if needed
        const providerId = service?.providerId || "fallbackProvider";

        const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

        const response = await fetch(`${baseUrl}api/payments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            customerId,
            providerId,
            bookingId: service?.id || service?._id,
            amount: Math.round(total * 100), // Stripe expects amounts in smallest currency unit (cents)
            currency: "usd"
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.message || data.error || "Failed to initialize payment");
        }
      } catch (err) {
        console.error("Payment Intent Error:", err);
        setError("Network error or failed to initialize payment");
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [total, service]);

  const appearance = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <>
      <Header />
      <div className="payment-page-container">
        <PaymentProgress step={2} />
        <div className="payment-grid">
          <div className="payment-card">
            <h2 className="payment-card-title">{t('pay_booking_summary')}</h2>
            {service ? (
              <div className="booking-item">
                <div className={`booking-icon ${service.color}`}>
                  {(() => {
                    const Icon = service.icon;
                    if (typeof Icon === 'function') return <Icon />;
                    return Icon || null;
                  })()}
                </div>
                <div>
                  <p className="booking-service-title">{service.title}</p>
                  <p className="booking-provider">{service.company || service.provider}</p>
                  <p className="booking-delivery">{t('pay_delivery')}</p>
                </div>
              </div>
            ) : (
              <div className="booking-item">
                <div className="booking-icon purple">🎨</div>
                <div>
                  <p className="booking-service-title">Graphic Design</p>
                  <p className="booking-provider">Creative Studio DRC</p>
                  <p className="booking-delivery">{t('pay_delivery')}</p>
                </div>
              </div>
            )}

            <div className="price-breakdown">
              <div className="breakdown-row">
                <span>{t('pay_service_price')}</span>
                <span>${servicePrice.toFixed(2)}</span>
              </div>
              <div className="breakdown-row">
                <span>{t('pay_service_fee')}</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
              <div className="breakdown-row subtotal">
                <span>{t('pay_subtotal')}</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="total-row">
              <span>{t('pay_total')}</span>
              <span className="total-amount">${total.toFixed(2)}</span>
            </div>

            <div className="payment-note">
              <FaLock /> {t('pay_secure_note')}
            </div>

            <div className="special-instructions">
              {t('pay_special_instructions')} <span>ˇ</span>
            </div>
          </div>

          <div className="payment-card">
            <h2 className="payment-card-title">
              <FaLock className="secure-icon" /> {t('pay_secure_payment')}
            </h2>
            <div className="payment-form-container" style={{ padding: "20px" }}>
              {error && <div className="error-message" style={{ color: "#ef4444", marginBottom: "15px" }}>{error}</div>}
              {loading && !clientSecret && (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div className="spinner" style={{
                    width: "30px", height: "30px", border: "3px solid #f3f3f3",
                    borderTop: "3px solid #3b82f6", borderRadius: "50%",
                    animation: "spin 1s linear infinite", margin: "0 auto 15px"
                  }}></div>
                  <p>{t('pay_loading') || "Initializing secure checkout..."}</p>
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
              )}
              {clientSecret && (
                <Elements options={options} stripe={stripePromise}>
                  <CheckoutForm amount={total} providerId={service?.providerId || service?.provider?._id || service?.provider?.id || "fallbackProvider"} />
                </Elements>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Payment;
