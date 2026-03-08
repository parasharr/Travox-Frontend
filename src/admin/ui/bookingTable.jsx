import { useState } from "react";
import BookingViewModal from "./bookingViewModal";
import { useLanguage } from "../../LanguageContext";

export default function BookingsTable({
  data = [],
  page = 1,
  perPage = 5,
  total = 0,
  totalPages = 1,
  setPage,
}) {
  const { t } = useLanguage();
  const [selectedBooking, setSelectedBooking] = useState(null);

  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <>
      <BookingViewModal
        open={!!selectedBooking}
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />

      <div className="bookings-table">

        {/* HEADER */}
        <div className="booking-row header">
          <div>{t('admin_bookings_bt_id') || "Booking ID"}</div>
          <div>{t('admin_bookings_bt_date') || "Date"}</div>
          <div>{t('admin_bookings_bt_client') || "Client"}</div>
          <div>{t('admin_bookings_bt_provider') || "Provider"}</div>
          <div>{t('admin_bookings_bt_service') || "Service"}</div>
          <div>{t('admin_bookings_bt_status') || "Status"}</div>
          <div>{t('admin_bookings_bt_amount') || "Amount"}</div>
          <div className="btn-space">{t('admin_bookings_bt_actions') || "Actions"}</div>
        </div>

        {/* EMPTY */}
        {data.length === 0 && (
          <div className="payment-table-footer">
            {t('admin_bookings_bt_no_bookings') || "No bookings found"}
          </div>
        )}

        {/* ROWS */}
        {data.map((b) => (
          <div className="booking-row" key={b.id}>

            <div data-label="Booking ID">{b.id}</div>

            <div data-label="Date">
              {b.date.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            <div className="user-col" data-label="Client">
              <span className="avatar purple">{b.clientInitials}</span>
              <span>{b.client}</span>
            </div>

            <div className="user-col" data-label="Provider">
              <span className="avatar blue">{b.providerInitials}</span>
              <span>{b.provider}</span>
            </div>

            <div className="service-text" data-label="Service">{b.service}</div>

            <div data-label="Status">
              <span
                className={`status-pill ${b.status
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                {b.status}
              </span>
            </div>

            <div className="price" data-label={t('admin_bookings_bt_amount') || "Amount"}>${b.amount.toFixed(2)}</div>

            <div className="booking-actions">
              <button
                className="view-btn"
                onClick={() => setSelectedBooking(b)}
              >
                {t('admin_bookings_bt_view') || "View"}
              </button>
            </div>
          </div>
        ))}

      </div>

      {/* FOOTER */}
      {total > 0 && (
        <div className="booking-table-footer">
          <span>
            {t('admin_bookings_bt_showing') || "Showing"} {start}–{end} {t('admin_bookings_bt_of') || "of"} {total} {t('admin_bookings_bt_bookings') || "bookings"}
          </span>

          <div className="pagination-controls">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t('admin_bookings_bt_prev') || "Previous"}
            </button>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {t('admin_bookings_bt_next') || "Next"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
