import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useLanguage } from "../../LanguageContext";

const ServiceInfo = ({ service }) => {
  const { t } = useLanguage();
  if (!service.description) return null;

  return (
    <div className="sd-info-section">
      <div className="sd-section">
        <h3>{t('sd_about')}</h3>
        <p className="sd-description">
          {service.description}
        </p>
      </div>

      {service.included && service.included.length > 0 && (
        <div className="sd-section">
          <h3>{t('sd_whats_included')}</h3>
          <ul className="sd-included-list">
            {service.included.map((item, idx) => (
              <li key={idx}><FaCheckCircle className="sd-check-icon" /> {item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ServiceInfo;
