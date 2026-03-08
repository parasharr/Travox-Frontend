import React from "react";
import { useLanguage } from "../../LanguageContext";


const ServiceHero = ({ service }) => {
  const { t } = useLanguage();
  return (
    <div className="sd-hero">
      <div className="sd-header-info">
        <h1 className="sd-title">{service.title}</h1>

        <div className="sd-meta">
          <span className="sd-rating">⭐ {service.rating} ({service.reviews} {t('sh_reviews')})</span>

        </div>
      </div>

      <div className="sd-banner-title-box">
        <h1>{service.title}</h1>
      </div>


    </div>
  );
};

export default ServiceHero;

