import React, { useState, useEffect, useRef } from "react";
import { MdSearch } from "react-icons/md";
import { FiLogOut, FiGlobe, FiChevronDown, FiCheck } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.png";
import "../../../user.css";
import "./NavbarSkeleton.css";
import { useLanguage } from "../../../LanguageContext";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userInitials, setUserInitials] = useState("U");
  const [isUserLoading, setIsUserLoading] = useState(true);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const langDropdownRef = useRef(null);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId) {
        console.log("No userId found in localStorage");
        return;
      }

      try {
        const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
        console.log(`Fetching user data for ID: ${userId}`);

        const response = await fetch(`${baseUrl}api/users/${userId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.warn("Failed to fetch user, falling back to local data:", response.status);
          setIsUserLoading(false);
          return;
        }

        const data = await response.json();
        const user = data.data || data; // Handle different response structures

        if (user && user.name) {
          setUserName(user.name);
          localStorage.setItem('loginName', user.name); // Sync back to localStorage

          // Generate initials
          const nameParts = user.name.trim().split(' ');
          let initials = '';
          if (nameParts.length >= 2) {
            initials = nameParts[0][0] + nameParts[nameParts.length - 1][0];
          } else if (nameParts.length === 1 && nameParts[0].length > 0) {
            initials = nameParts[0].substring(0, 2);
          }
          setUserInitials(initials.toUpperCase());
        }
      } catch (err) {
        console.error("Error fetching user data in Navbar:", err);
      } finally {
        setIsUserLoading(false);
      }
    };

    // Initially sync from storage
    const storedName = localStorage.getItem('loginName');
    if (storedName) {
      setUserName(storedName);
      const nameParts = storedName.trim().split(' ');
      let initials = '';
      if (nameParts.length >= 2) {
        initials = nameParts[0][0] + nameParts[nameParts.length - 1][0];
      } else if (nameParts.length === 1 && nameParts[0].length > 0) {
        initials = nameParts[0].substring(0, 2);
      }
      setUserInitials(initials.toUpperCase());
    }

    fetchUserData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (dropdownOpen) console.log("Closing dropdown due to outside click");
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleLangClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleLangClickOutside);
    return () => document.removeEventListener('mousedown', handleLangClickOutside);
  }, []);

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setLangDropdownOpen(false);
  };

  const handleLogout = () => {
    // Clear all auth data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("loginEmail");
    localStorage.removeItem("loginName");

    // Navigate to login page
    navigate("/login?role=user");
  };

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="logo">
          <img
            src={logo}
            alt="ServiceHub Congo"
            className="logo-img"
          />
        </Link>

        {/* Search */}


        {/* Right Side */}
        <div className="user-nav">

          {/* Language Dropdown */}
          <div className="navbar-lang-dropdown" ref={langDropdownRef}>
            <button
              className="navbar-lang-btn"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              aria-label="Select Language"
              id="navbar-language-selector"
            >
              <FiGlobe className="navbar-lang-icon" />
              <span className="navbar-lang-label">{language === 'en' ? 'EN' : 'FR'}</span>
              <FiChevronDown className={`navbar-lang-chevron ${langDropdownOpen ? 'rotated' : ''}`} />
            </button>
            <div className={`navbar-lang-menu ${langDropdownOpen ? 'open' : ''}`}>
              <button
                className={`navbar-lang-option ${language === 'en' ? 'active' : ''}`}
                onClick={() => handleLanguageSelect('en')}
              >
                <span className="navbar-lang-flag">🇬🇧</span>
                <span>{t('lang_english')}</span>
                {language === 'en' && <FiCheck className="navbar-lang-check" />}
              </button>
              <button
                className={`navbar-lang-option ${language === 'fr' ? 'active' : ''}`}
                onClick={() => handleLanguageSelect('fr')}
              >
                <span className="navbar-lang-flag">🇫🇷</span>
                <span>{t('lang_french')}</span>
                {language === 'fr' && <FiCheck className="navbar-lang-check" />}
              </button>
            </div>
          </div>
          <div
            className="user-profile"
            ref={dropdownRef}
          >
            <div
              className="user-profile-trigger"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Toggle clicked. Old state:", dropdownOpen);
                setDropdownOpen(!dropdownOpen);
              }}
            >
              {isUserLoading ? (
                <div className="nav-avatar-skeleton"></div>
              ) : (
                <div className="profile-logo">{userInitials}</div>
              )}
              <div className="user-info">
                {isUserLoading ? (
                  <span className="nav-username-skeleton"></span>
                ) : (
                  <span className="user-name">{userName}</span>
                )}
                <span className="dropdown-arrow">▾</span>
              </div>
            </div>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                className="dropdown-menu"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Logout clicked");
                    handleLogout();
                  }}
                  className="dropdown-item logout-btn"
                >
                  <FiLogOut /> {t('navbar_logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
