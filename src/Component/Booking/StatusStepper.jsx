import React from "react";
import { useLanguage } from "../../LanguageContext";

const StatusStepper = () => {
  const { t } = useLanguage();

  const steps = [
    { id: 1, label: t('bs_paid_held'), time: "Jan 15, 10:30", status: "done" },
    { id: 2, label: t('bs_in_progress'), time: "Jan 15, 11:00", status: "active" },
    { id: 3, label: t('bs_completed'), time: "", status: "pending" },
    { id: 4, label: t('bs_approved'), time: "", status: "pending" },
  ];

  return (
    <div className="bs-card">
      <div className="bs-stepper-row">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="bs-step">
              <div className={`bs-step-icon ${s.status}`}>
                {s.status === "done" ? "✓" : s.id}
              </div>
              <p className="bs-step-label">{s.label}</p>
              {s.time && <p className="bs-step-time">{s.time}</p>}
            </div>
            {i !== steps.length - 1 && <div className="bs-step-line" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StatusStepper;
