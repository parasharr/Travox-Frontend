import React from "react";
import { useLanguage } from "../../LanguageContext";

const ActivityTimeline = () => {
  const { t } = useLanguage();

  const events = [
    { title: t('bs_booking_created'), desc: t('bs_booking_created_desc'), time: "Jan 15, 10:30 AM" },
    { title: t('bs_payment_processed'), desc: t('bs_payment_processed_desc'), time: "Jan 15, 10:31 AM" },
    { title: t('bs_provider_accepted'), desc: t('bs_provider_accepted_desc'), time: "Jan 15, 11:05 AM" },
    { title: t('bs_service_started'), desc: t('bs_service_started_desc'), time: "Jan 15, 11:30 AM" },
    { title: t('bs_service_completion'), desc: t('bs_service_completion_desc'), time: t('bs_pending') },
    { title: t('bs_client_approval'), desc: t('bs_client_approval_desc'), time: t('bs_pending') },
  ];

  return (
    <div className="bs-card">
      <h3 className="bs-section-title">{t('bs_activity_timeline')}</h3>
      <div className="bs-timeline-list">
        {events.map((e, i) => (
          <div key={i} className="bs-timeline-item">
            <div className="bs-timeline-dot" />
            <div className="bs-timeline-content">
              <h4>{e.title}</h4>
              <p>{e.desc}</p>
              <p className="bs-timeline-time">{e.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
