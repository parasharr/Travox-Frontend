import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Header from "../Home/Navbar/Navbar";
import ServiceHero from "./ServiceHero";
import ProviderCard from "./ProviderCard";
import ServiceInfo from "./ServiceInfo";
import Reviews from "./Reviews";
import { useLanguage } from "../../LanguageContext";

const ServiceDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchServiceDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
        const response = await fetch(`${baseUrl}api/services/public/${slug}`);
        if (!response.ok) throw new Error("Service not found");
        const data = await response.json();
        const serviceData = data.service;
        const stats = data.stats || {};
        if (!serviceData) throw new Error("Service data missing in response");
        const normalizedService = {
          ...serviceData,
          title: serviceData.name,
          company: serviceData.provider?.companyName || "Professional Provider",
          rating: stats.averageRating || "0.0",
          reviews: stats.totalReviews || 0,
        };
        setService(normalizedService);
      } catch (err) {
        console.error("Error fetching service details:", err);
        setError("Unable to load service details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchServiceDetails();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="service-details-container">
          <p className="loading-state">{t('sd_loading')}</p>
        </div>
      </>
    );
  }

  if (error || !service) {
    return (
      <>
        <Header />
        <div className="service-details-container">
          <p className="error-state">{error || t('sd_not_found')}</p>
          <Link to="/professional" className="back-link">{t('sd_back')}</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="service-details-container">
        <div className="sd-nav-bar">
          <button onClick={() => navigate(-1)} className="sd-back-btn">
            <FaArrowLeft /> {t('sd_back')}
          </button>
          <div className="sd-breadcrumb">
            <Link to="/">{t('sd_home')}</Link> &gt; <Link to="/professional">{t('sd_services')}</Link> &gt; <span>{service.title}</span>
          </div>
        </div>

        <div className="sd-layout">
          <div className="sd-main-content">
            <ServiceHero service={service} />
            <ServiceInfo service={service} />
            <Reviews
              service={service}
              reviews={service.realReviews || []}
              stats={{
                averageRating: service.rating,
                totalReviews: service.reviews
              }}
            />
          </div>
          <div className="sd-sidebar">
            <ProviderCard service={service} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceDetails;
