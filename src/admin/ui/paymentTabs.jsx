import { useLanguage } from "../../LanguageContext";

export default function PaymentTabs({ active, setActive }) {
  const { t } = useLanguage();

  const tabs = [
    { key: "All", label: t('admin_payments_tab_all') || "All" },
    { key: "Held", label: t('admin_payments_tab_held') || "Held" },
    { key: "Ready", label: t('admin_payments_tab_ready') || "Ready" },
    { key: "Released", label: t('admin_payments_tab_released') || "Released" },
    { key: "Refunded", label: t('admin_payments_tab_refunded') || "Refunded" }
  ];

  return (
    <div className="payment-tabs">
      {tabs.map(tabObj => (
        <span
          key={tabObj.key}
          className={active === tabObj.key ? "active" : ""}
          onClick={() => setActive(tabObj.key)}
        >
          {tabObj.label}
        </span>
      ))}
    </div>
  );
}
