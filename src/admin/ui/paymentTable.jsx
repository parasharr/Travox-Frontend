import { FiMoreHorizontal } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../LanguageContext";
import PaymentViewModal from "./PaymentViewModal";

export default function PaymentTable({
  data,
  page,
  total,
  perPage,
  totalPages,
  setPage,
  onRefresh
}) {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(null);
  const dropdownRef = useRef(null);
  const [releasing, setReleasing] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const handleRelease = async (paymentId) => {
    if (!window.confirm("Are you sure you want to release funds to the provider?")) return;

    try {
      setReleasing(paymentId);
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

      const response = await fetch(`${baseUrl}api/admin/settlements`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ paymentId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to release payment");
      }

      alert("Funds released successfully!");
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setReleasing(null);
      setOpenIndex(null);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpenIndex(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="payment-table">
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('admin_payments_pt_pay_id') || "Payment ID"}</th>
              <th>{t('admin_payments_pt_book_id') || "Int. ID"}</th>
              <th>{t('admin_payments_pt_provider') || "Provider"}</th>
              <th>{t('admin_payments_pt_client') || "Client"}</th>
              <th>{t('admin_payments_pt_amount') || "Amount"}</th>
              <th>{t('admin_payments_pt_fee') || "Fee (10%)"}</th>
              <th>{t('admin_payments_pt_earnings') || "Net"}</th>
              <th>{t('admin_payments_pt_status') || "Status"}</th>
              <th>{t('admin_payments_pt_date') || "Date"}</th>
              <th style={{ textAlign: 'center' }}>{t('admin_payments_pt_actions') || "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const amountVal = (row.amount || 0) / 100;
              const feeVal = amountVal * 0.1;
              const netVal = amountVal - feeVal;
              const dateObj = new Date(row.createdAt);
              const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              const isReady = row.status === "PAID" && row.settlementStatus === "UNSETTLED";
              const isReleased = row.status === "PAID" && row.settlementStatus === "SETTLED";
              const isHeld = row.status === "PENDING" || row.settlementStatus === "HOLD" || row.settlementStatus === "PENDING";
              const isFailed = row.status === "FAILED" || row.settlementStatus === "FAILED";
              const isPaid = row.settlementStatus === "PAID";

              let uiStatus = row.status;
              if (isReady) uiStatus = "Ready";
              if (isReleased) uiStatus = "Released";
              if (isHeld) uiStatus = "Held";
              if (isFailed) uiStatus = "Failed";
              if (isPaid) uiStatus = "Paid";

              return (
                <tr key={i}>
                  <td title={row._id}>{row._id?.substring(0, 8)}...</td>
                  <td className="link" title={row.paymentIntentId}>{row.paymentIntentId?.substring(0, 10)}...</td>
                  <td>{row.providerName || "N/A"}</td>
                  <td>{row.customerName || "N/A"}</td>
                  <td>₹{amountVal.toFixed(2)}</td>
                  <td>₹{feeVal.toFixed(2)}</td>
                  <td>₹{netVal.toFixed(2)}</td>
                  <td>
                    <span className={`status-pill ${uiStatus.toLowerCase()}`}>
                      {uiStatus}
                    </span>
                  </td>
                  <td>{dateStr}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div
                      className="payment-actions"
                      style={{ display: 'inline-block', position: 'relative' }}
                      ref={openIndex === i ? dropdownRef : null}
                    >
                      <button
                        type="button"
                        className="action-trigger"
                        onClick={() =>
                          setOpenIndex(openIndex === i ? null : i)
                        }
                        disabled={releasing === row._id}
                      >
                        <FiMoreHorizontal />
                      </button>

                      {openIndex === i && (
                        <div className="payment-dropdown" style={{ right: 0, top: '100%', minWidth: '120px' }}>
                          {isReady && (
                            <button onClick={() => handleRelease(row._id)}>
                              {t('admin_payments_pt_release') || "Release Funds"}
                            </button>
                          )}

                          <button onClick={() => {
                            setSelectedPayment(row);
                            setShowViewModal(true);
                            setOpenIndex(null);
                          }}>
                            {t('admin_payments_pt_view') || "View Details"}
                          </button>

                          {!isReleased && row.status !== "REFUNDED" && (
                            <button
                              className="danger"
                              onClick={() => setOpenIndex(null)}
                            >
                              {t('admin_payments_pt_refund') || "Refund"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="payment-table-footer">
        <span>
          {t('admin_payments_pt_showing') || "Showing"} {(page - 1) * perPage + 1}–
          {Math.min(page * perPage, total)} {t('admin_payments_pt_of') || "of"} {total}
        </span>

        <div className="pagination-controls">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            {t('admin_payments_pt_prev') || "Previous"}
          </button>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            {t('admin_payments_pt_next') || "Next"}
          </button>
        </div>
      </div>

      <PaymentViewModal
        open={showViewModal}
        payment={selectedPayment}
        onClose={() => setShowViewModal(false)}
        onRefresh={onRefresh}
      />
    </div>
  );
}
