import React from "react";
import { useLanguage } from "../../LanguageContext";

const PaymentProgress = ({ step = 2 }) => {
  const { t } = useLanguage();
  const steps = [
    { id: 1, label: t('pay_select_service') },
    { id: 2, label: t('pay_payment') },
    { id: 3, label: t('pay_confirmation') },
  ];

  return (
    <div className="pp-container">
      <div className="pp-wrapper">
        {steps.map((item, index) => {
          const isCompleted = step > item.id;
          const isActive = step === item.id;

          return (
            <React.Fragment key={item.id}>
              <div className="pp-step">
                <div className={`pp-circle ${isCompleted || isActive ? "active" : ""}`}>
                  {isCompleted ? "✓" : item.id}
                </div>
                <p className={`pp-label ${isActive ? "active" : ""}`}>
                  {item.label}
                </p>
              </div>
              {index !== steps.length - 1 && (
                <div className={`pp-line ${step > item.id ? "active" : ""}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentProgress;
