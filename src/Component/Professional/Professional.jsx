import React from "react";
import Sidebar from "./Sidebar";
import Rightsidebar from "./Rightsidebar";
import "../../user.css";
import Header from "../Home/Navbar/Navbar";
import { useLanguage } from "../../LanguageContext";

import { useSearchParams } from "react-router-dom";

const Professional = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");
  const initialSearch = searchParams.get("search");
  const { t } = useLanguage();

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState(initialCategory || null);
  const [priceRange, setPriceRange] = React.useState({ min: "", max: "" });
  const [rating, setRating] = React.useState("all");
  const [availability, setAvailability] = React.useState("");
  const [providerTypes, setProviderTypes] = React.useState({ individual: false, business: false });
  const [verifiedOnly, setVerifiedOnly] = React.useState(false);

  const handleClearAll = () => {
    setSelectedCategory(null);
    setPriceRange({ min: "", max: "" });
    setRating("all");
    setAvailability("");
    setProviderTypes({ individual: false, business: false });
    setVerifiedOnly(false);
  };

  return (
    <>
      <Header />

      <div className="professional-page">
        <div className="professional-container">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            {t('pro_breadcrumb')}
          </div>

          {/* Title */}
          <div className="page-header">
            <h1>{t('pro_title')}</h1>
            <p>{t('pro_subtitle')}</p>
          </div>

          {/* Main Layout */}
          <div className="professional-layout">
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              rating={rating}
              onRatingChange={setRating}
              availability={availability}
              onAvailabilityChange={setAvailability}
              providerTypes={providerTypes}
              onProviderTypeChange={setProviderTypes}
              verifiedOnly={verifiedOnly}
              onVerifiedChange={setVerifiedOnly}
              onClearAll={handleClearAll}
            />

            {/* Mobile Overlay */}
            {isSidebarOpen && (
              <div
                className="pro-sidebar-overlay"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            <Rightsidebar
              onToggleSidebar={() => setIsSidebarOpen(true)}
              selectedCategory={selectedCategory}
              priceRange={priceRange}
              rating={rating}
              availability={availability}
              providerTypes={providerTypes}
              verifiedOnly={verifiedOnly}
              initialSearch={initialSearch}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Professional;
