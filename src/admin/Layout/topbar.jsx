import React, { useState, useEffect, useRef } from "react";
import { FiBell, FiChevronDown, FiMenu, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../LanguageContext";

export default function Topbar({ onMenuClick, onDesktopToggle, user }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const { language, setLanguage } = useLanguage();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayUser = user || { name: "Admin", initials: "A" };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/login");
  };

  return (
    <div className="admin-topbar-inner">

      <div className="admin-topbar-left">
        <FiMenu className="mobile-menu-icon" onClick={onMenuClick} />
        <FiMenu className="desktop-menu-icon" onClick={onDesktopToggle} />
      </div>


      <div className="admin-topbar-right">

        {/* Custom Language Dropdown */}
        <div style={{ position: 'relative' }} ref={langDropdownRef}>
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1e293b',
              marginRight: '8px',
              transition: 'all 0.2s',
              boxShadow: isLangMenuOpen ? '0px 0px 0px 2px #e0e7ff' : 'none'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span>{language === 'fr' ? 'FR' : 'EN'}</span>
            <span style={{ color: '#64748b', display: 'flex' }}>
              {isLangMenuOpen ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              )}
            </span>
          </button>

          {isLangMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              marginTop: '8px',
              right: '8px',
              backgroundColor: 'white',
              border: '1px solid #f1f5f9',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              width: '180px',
              zIndex: 50,
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <button
                onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: language === 'en' ? '#f1f5f9' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.2s'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="24" height="16" style={{ borderRadius: '2px' }}>
                    <clipPath id="s_en_admin">
                      <path d="M0,0 v30 h60 v-30 z" />
                    </clipPath>
                    <clipPath id="t_en_admin">
                      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
                    </clipPath>
                    <g clipPath="url(#s_en_admin)">
                      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
                      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
                      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t_en_admin)" stroke="#C8102E" strokeWidth="4" />
                      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
                      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
                    </g>
                  </svg>
                  <span style={{ fontSize: '15px', fontWeight: language === 'en' ? '600' : '500', color: language === 'en' ? '#2563eb' : '#475569' }}>English</span>
                </div>
                {language === 'en' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </button>

              <button
                onClick={() => { setLanguage('fr'); setIsLangMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: language === 'fr' ? '#f1f5f9' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.2s'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" width="24" height="16" style={{ borderRadius: '2px' }}>
                    <rect width="10" height="20" fill="#002395" />
                    <rect x="10" width="10" height="20" fill="#fff" />
                    <rect x="20" width="10" height="20" fill="#ED2939" />
                  </svg>
                  <span style={{ fontSize: '15px', fontWeight: language === 'fr' ? '600' : '500', color: language === 'fr' ? '#2563eb' : '#475569' }}>Français</span>
                </div>
                {language === 'fr' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="topbar-icon-btn">
          <FiBell />
        </div>

        <div
          className="admin-user"
          onClick={() => setShowDropdown(!showDropdown)}
          style={{ position: 'relative' }}
        >
          <div className="admin-avatar">{displayUser.initials}</div>
          <span className="admin-username">{displayUser.name}</span>
          <FiChevronDown />

          {showDropdown && (
            <div style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "10px",
              background: "white",
              padding: "8px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              zIndex: 1000,
              minWidth: "140px",
              border: "1px solid #e2e8f0"
            }}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  fontSize: "13px",
                  color: "#ef4444",
                  cursor: "pointer",
                  borderRadius: "6px",
                  fontWeight: 500
                }}
                onMouseEnter={(e) => e.target.style.background = "#fef2f2"}
                onMouseLeave={(e) => e.target.style.background = "transparent"}
              >
                <FiLogOut />
                Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
