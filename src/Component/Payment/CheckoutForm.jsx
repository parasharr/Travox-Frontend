import React, { useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import { useLanguage } from "../../LanguageContext";
import { FaLock } from "react-icons/fa";
import { MdSecurity } from "react-icons/md";

export default function CheckoutForm({ amount, providerId }) {
    const stripe = useStripe();
    const elements = useElements();
    const { t } = useLanguage();

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js hasn't yet loaded.
            return;
        }

        setIsLoading(true);

        const providerId = new URLSearchParams(window.location.search).get('providerId') || 'unknown';
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page
                return_url: `${window.location.origin}/booking-status?providerId=${providerId}`,
            },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message);
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    const paymentElementOptions = {
        layout: "tabs",
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="payment-form">
            <PaymentElement id="payment-element" options={paymentElementOptions} />

            <div className="checkbox-row" style={{ marginTop: '20px' }}>
                <input type="checkbox" defaultChecked />
                <label>{t('pay_same_address') || "Billing address is same as shipping address"}</label>
            </div>

            <div className="ssl-secured">
                <span><FaLock /> {t('pay_ssl') || "SSL Secured"}</span>
                <span><MdSecurity /> {t('pay_encryption') || "256-bit Encryption"}</span>
                <span className="stripe-logo">stripe</span>
            </div>

            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="pay-btn"
                style={{ opacity: (isLoading || !stripe || !elements) ? 0.7 : 1 }}
            >
                <span id="button-text">
                    {isLoading ? <div className="spinner" id="spinner"></div> : `${t('pay_securely') || "Pay Securely"} - $${amount.toFixed(2)}`}
                </span>
            </button>

            {/* Show any error or success messages */}
            {message && <div id="payment-message" style={{ color: '#ef4444', marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>{message}</div>}

            <div className="footer-links">
                {t('pay_agree') || "By confirming this payment, you agree to our"} <a href="#">{t('pay_terms') || "Terms of Service"}</a> and <a href="#">{t('pay_privacy') || "Privacy Policy"}</a>
            </div>

            <style>{`
        #payment-form .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
        </form>
    );
}
