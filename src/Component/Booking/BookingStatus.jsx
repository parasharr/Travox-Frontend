import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import StatusStepper from "./StatusStepper";
import ActivityTimeline from "./ActivityTimeline";
import { services } from "../../data/servicesData";
import Header from "../Home/Navbar/Navbar";
import { useLanguage } from "../../LanguageContext";

const BookingStatus = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [booking, setBooking] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [fetchedProvider, setFetchedProvider] = React.useState(null);

  React.useEffect(() => {
    const fetchBookingData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

        // 1. Resolve Booking ID (from path param or query string)
        const queryParams = new URLSearchParams(location.search);
        const resolvedId = id || queryParams.get('bookingId') || queryParams.get('id');
        const paymentIntent = queryParams.get('payment_intent');

        let b = null;

        if (resolvedId) {
          // A. Fetch by specific ID
          console.log(`BookingStatus: Fetching specific ID ${resolvedId}`);
          const response = await fetch(`${baseUrl}api/bookings/${resolvedId}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            b = data.booking || data;
          }
        }

        if (!b && paymentIntent) {
          // B. Fetch by payment intent fallback
          console.log(`BookingStatus: Fetching by Payment Intent ${paymentIntent}`);
          const piResponse = await fetch(`${baseUrl}api/bookings/payment-intent/${paymentIntent}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (piResponse.ok) {
            const piData = await piResponse.json();
            b = piData.booking || piData;
          }
        }

        if (!b) {
          // C. Absolute Fallback: Fetch latest from My Bookings list
          console.log("BookingStatus: Fetching latest from user's booking list");
          const listResponse = await fetch(`${baseUrl}api/bookings/my`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (listResponse.ok) {
            const listData = await listResponse.json();
            const bookingsList = Array.isArray(listData) ? listData : (listData.data || []);
            if (bookingsList.length > 0) {
              // The list is sorted by date in MyBookings, assuming same here
              b = bookingsList[0];
            }
          }
        }

        if (!b) {
          throw new Error(t('bs_fetch_error') || "We couldn't find your booking. Please check 'My Bookings' to see your status.");
        }

        setBooking(b);

        // 2. Fetch provider details using providerId from booking
        const pId = b.providerId || b.provider?._id || b.provider?.id;
        if (pId) {
          const pResponse = await fetch(`${baseUrl}api/providers/public/${pId}`);
          if (pResponse.ok) {
            const pData = await pResponse.json();
            setFetchedProvider(pData.provider || pData.data || pData);
          }
        }
      } catch (err) {
        console.error("BookingStatus Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [id]);

  if (loading) return <div className="bs-container" style={{ padding: '100px', textAlign: 'center' }}>{t('bs_loading') || "Loading booking status..."}</div>;
  if (error) return <div className="bs-container" style={{ padding: '100px', textAlign: 'center', color: 'red' }}>Error: {error}</div>;
  if (!booking) return <div className="bs-container" style={{ padding: '100px', textAlign: 'center' }}>Booking not found.</div>;

  const serviceTitle = booking.serviceName || booking.service?.name || "Service Booking";
  const providerName = fetchedProvider?.name || fetchedProvider?.user?.name || fetchedProvider?.company || booking.providerName || "Provider";
  const providerRating = fetchedProvider?.averageRating || fetchedProvider?.rating || "4.8";
  const providerReviews = fetchedProvider?.totalReviews || fetchedProvider?.reviews || (fetchedProvider?.reviewsList?.length) || "0";

  const servicePrice = Number(booking.totalAmount || booking.price || 0);
  const serviceTax = servicePrice * 0.10; // Assuming 10% tax/fee for UI
  const totalPaid = servicePrice + serviceTax;

  const bookingIdDisplay = booking._id || booking.id || id;
  const bookingTime = new Date(booking.bookingDate || booking.createdAt).toLocaleDateString();
  const bookingClock = new Date(booking.bookingDate || booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getText = (key, fallback) => {
    const val = t(key);
    return val === key ? fallback : val;
  };

  const paymentMethodText = getText('bs_payment_on_platform', "Secured via Stripe");

  // Decoupled Payment Status Logic
  const isPaid = booking.paymentStatus === 'PAID' || ['paymentreleased', 'clientapproved', 'approved'].includes(booking.status?.toLowerCase());

  let paymentStatusText = getText('bs_unpaid', "Unpaid");
  let paymentStatusColor = '#ef4444'; // Red for unpaid

  if (booking.status?.toLowerCase() === 'approved') {
    paymentStatusText = getText('bs_released', "Released");
    paymentStatusColor = '#22c55e'; // Green for released
  } else if (isPaid) {
    paymentStatusText = getText('bs_held_securely', "Held Securely");
    paymentStatusColor = '#eab308'; // Yellow for held securely
  }


  const handleDownloadInvoice = () => {
    const invoiceWindow = window.open('', '_blank');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${bookingIdDisplay}</title>
        <style>
          @page { margin: 0; }
          body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; padding: 2cm; line-height: 1.5; margin: 0; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: 800; color: #2563eb; letter-spacing: -1px; }
          .invoice-meta { text-align: right; }
          .invoice-title { font-size: 32px; font-weight: 700; margin: 0; color: #0f172a; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
          .section-title { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 8px; letter-spacing: 0.05em; }
          .details p { margin: 4px 0; font-size: 14px; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          .table th { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-transform: uppercase; }
          .table td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .totals { margin-left: auto; width: 250px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
          .total-row.grand-total { border-top: 2px solid #0f172a; margin-top: 8px; padding-top: 12px; font-weight: 700; font-size: 18px; color: #0f172a; }
          .footer { margin-top: 60px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${window.location.origin}/logo.png" alt="TRAVOX" style="height: 40px; width: auto;" />
          <div class="invoice-meta">
            <h1 class="invoice-title">INVOICE</h1>
            <p style="margin: 4px 0; font-size: 14px; color: #64748b;">#${bookingIdDisplay}</p>
          </div>
        </div>

        <div class="grid">
          <div class="details">
            <h3 class="section-title">Billed To</h3>
            <p><strong>Customer</strong></p>
            <p>Booking Date: ${bookingTime}</p>
            <p>Time: ${bookingClock}</p>
          </div>
          <div class="details" style="text-align: right;">
            <h3 class="section-title">Provider</h3>
            <p><strong>${providerName}</strong></p>
            <p>${t('bs_home_services')}</p>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style="font-weight: 600;">${serviceTitle}</div>
                <div style="font-size: 12px; color: #64748b;">Service Booking via Travox Platform</div>
              </td>
              <td style="text-align: right;">$${servicePrice.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>$${servicePrice.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Service Fee & Tax</span>
            <span>$${serviceTax.toFixed(2)}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total Paid</span>
            <span>$${totalPaid.toFixed(2)}</span>
          </div>
        </div>

        <div style="margin-top: 40px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h3 class="section-title" style="margin-bottom: 4px;">Payment Status</h3>
          <p style="margin: 0; font-weight: 600; color: ${paymentStatusColor}">
            ${paymentStatusText}
          </p>
        </div>

        <div class="footer">
          <p>Thank you for choosing Travox. Professional services at your doorstep.</p>
          <p>&copy; ${new Date().getFullYear()} Travox Inc. All rights reserved.</p>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;
    invoiceWindow.document.write(html);
    invoiceWindow.document.close();
  };

  return (
    <>
      <Header />
      <div className="bs-container">
        <div className="bs-header">
          <h1 className="bs-title">{t('bs_booking')} #{bookingIdDisplay}</h1>
          <p className="bs-subtitle">
            {t('bs_booked_on')} {bookingTime} {t('bs_at')} {bookingClock}
          </p>
        </div>

        <div className="bs-layout">
          <div className="bs-main">
            <StatusStepper />

            <div className="bs-card bs-status-card">
              <div className="bs-status-icon-wrapper">⚡</div>
              <h3 className="bs-status-title">{t('bs_service_in_progress')}</h3>
              <p className="bs-status-desc">{t('bs_provider_working')}</p>
              <span className="bs-status-badge">{t('bs_estimated')}</span>
            </div>

            <div className="bs-card">
              <h3 className="bs-section-title">{t('bs_service_info')}</h3>
              <div className="bs-service-header">
                <div className={`bs-service-icon ${booking.service?.color || 'blue'}`}>
                  🎨
                </div>
                <div>
                  <p className="bs-service-name">{serviceTitle}</p>
                  <p className="bs-service-meta">{t('bs_home_services')}</p>
                </div>
              </div>
              <div className="bs-provider-row">
                <div className="bs-provider-info">
                  <div className={`bs-provider-avatar ${booking.service?.color || 'blue'}`}>{providerName.charAt(0)}</div>
                  <div>
                    <p className="bs-service-name">{providerName}</p>
                    <p className="bs-service-meta">⭐ {providerRating} ({providerReviews} {t('sd_reviews_label') || "reviews"})</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bs-card">
              <h3 className="bs-section-title">{t('bs_payment_details')}</h3>
              <div className="bs-payment-details-content">
                <div className="bs-payment-row"><span>{t('bs_service_fee')}</span><span>${servicePrice.toFixed(2)}</span></div>
                <div className="bs-payment-row"><span>{t('bs_service_tax')}</span><span>${serviceTax.toFixed(2)}</span></div>
                <div className="bs-payment-row total"><span>{t('bs_total_paid')}</span><span>${totalPaid.toFixed(2)}</span></div>
                <div className="bs-payment-row meta"><span>{t('bs_payment_method')}</span><span>{paymentMethodText}</span></div>
                <div className="bs-payment-row meta"><span>{t('bs_payment_status')}</span><span style={{ color: paymentStatusColor, fontWeight: 600 }}>{paymentStatusText}</span></div>
              </div>
              <div className="bs-action-row">
                <button className="bs-btn-primary" onClick={() => navigate("/rate-experience", { state: { service: { id: booking.serviceId || booking.service?._id } } })} style={{ background: '#2563eb' }}>
                  {t('bs_rate_provider')}
                </button>
                <button className="bs-btn-outline" onClick={handleDownloadInvoice}>{t('bs_download_invoice')}</button>
              </div>
            </div>
          </div>

          <ActivityTimeline />
        </div>
      </div>
    </>
  );
};

export default BookingStatus;
