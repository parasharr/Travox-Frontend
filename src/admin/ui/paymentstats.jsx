import {
  FiClock,
  FiTrendingUp,
  FiCheckCircle,
  FiRefreshCw
} from "react-icons/fi";
import { useLanguage } from "../../LanguageContext";

export default function PaymentStats({ data = [] }) {
  const { t } = useLanguage();

  const today = new Date().toDateString();
  const month = new Date().getMonth();
  const year = new Date().getFullYear();

  const stats = data.reduce((acc, curr) => {
    const amount = (curr.amount || 0) / 100;
    const isHeld = curr.settlementStatus === "HOLD" || curr.settlementStatus === "UNSETTLED" || curr.settlementStatus === "PENDING" || !curr.settlementStatus;
    const isReady = curr.settlementStatus === "PAID";
    const isReleased = curr.settlementStatus === "SETTLED";
    const isRefunded = curr.settlementStatus === "REFUNDED" || curr.status === "REFUNDED";

    if (isHeld) {
      acc.held += amount;
      acc.heldCount++;
    }
    if (isReady) {
      acc.ready += amount;
      acc.readyCount++;
    }
    if (isReleased) {
      acc.released += amount;
      acc.releasedCount++;
    }
    if (isRefunded) {
      acc.refunded += amount;
      acc.refundedCount++;
    }

    return acc;
  }, { held: 0, heldCount: 0, ready: 0, readyCount: 0, released: 0, releasedCount: 0, refunded: 0, refundedCount: 0 });

  return (
    <div className="payment-stats">

      <div className="payment-card orange">
        <div className="icon">
          <FiClock />
        </div>

        <div className="content">
          <h2>${stats.held.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <p>{t('admin_payments_stats_held') || "Total Held"}</p>
          <span>{t('admin_payments_stats_held_sub', { count: stats.heldCount }) || `From ${stats.heldCount} bookings`}</span>
        </div>
      </div>

      <div className="payment-card yellow">
        <div className="icon">
          <FiTrendingUp />
        </div>

        <div className="content">
          <h2>${stats.ready.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <p>{t('admin_payments_stats_pending') || "Ready for Release"}</p>
          <span>{t('admin_payments_stats_pending_sub', { count: stats.readyCount }) || `Awaiting admin action`}</span>
        </div>
      </div>

      <div className="payment-card green">
        <div className="icon">
          <FiCheckCircle />
        </div>

        <div className="content">
          <h2>${stats.released.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <p>{t('admin_payments_stats_released') || "Total Released"}</p>
          <span>{t('admin_payments_stats_released_sub', { count: stats.releasedCount }) || `Pushed to providers`}</span>
        </div>
      </div>

      <div className="payment-card gray">
        <div className="icon">
          <FiRefreshCw />
        </div>

        <div className="content">
          <h2>${stats.refunded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <p>{t('admin_payments_stats_refunded') || "Total Refunded"}</p>
          <span>{t('admin_payments_stats_refunded_sub', { count: stats.refundedCount }) || `Returned to clients`}</span>
        </div>
      </div>

    </div>
  );
}
