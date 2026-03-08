import React from "react";
import { FiMenu, FiBell, FiChevronDown, FiLogOut, FiAlertCircle } from "react-icons/fi";
import "../provider.css";
import { useLanguage } from "../../LanguageContext";

const ProviderTopbar = ({ onMenuClick, onDesktopToggle, user }) => {
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const [isLangMenuOpen, setIsLangMenuOpen] = React.useState(false);
    const langDropdownRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
                setIsLangMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [showLogoutModal, setShowLogoutModal] = React.useState(false);
    const navigate = React.useCallback(() => {
        window.location.href = "/login";
    }, []);
    const { t, language, setLanguage } = useLanguage();

    const logout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    const handleLogoutClick = () => {
        setShowUserMenu(false);
        setShowLogoutModal(true);
    };

    return (
        <div className="provider-topbar">
            <div className="topbar-left">
                <button
                    className="mobile-menu-btn icon-btn"
                    onClick={onMenuClick}
                    style={{ display: "none" }}
                >
                    <FiMenu />
                </button>
                <button
                    className="desktop-menu-btn icon-btn"
                    onClick={onDesktopToggle}
                    style={{ marginRight: "16px", background: "none", border: "none", cursor: "pointer", fontSize: "20px" }}
                >
                    <FiMenu />
                </button>
                <h2>{t('pt_dashboard')}</h2>
            </div>

            <div className="topbar-right">
                <div style={{ position: 'relative' }} ref={langDropdownRef}>
                    <button
                        onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            backgroundColor: '#f8fafc',
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
                                        <clipPath id="s">
                                            <path d="M0,0 v30 h60 v-30 z" />
                                        </clipPath>
                                        <clipPath id="t">
                                            <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
                                        </clipPath>
                                        <g clipPath="url(#s)">
                                            <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
                                            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
                                            <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
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

                <button className="icon-btn">
                    <FiBell size={20} color="#64748b" />
                </button>

                <div className="user-menu-container" style={{ position: 'relative' }}>
                    <button
                        className="user-menu-btn"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        disabled={!user}
                        style={{ opacity: !user ? 0.8 : 1 }}
                    >
                        {!user ? (
                            <>
                                <div className="user-avatar small skeleton" style={{ width: 24, height: 24 }}></div>
                                <div className="skeleton" style={{ width: 80, height: 16 }}></div>
                            </>
                        ) : (
                            <>
                                <div className="user-avatar small" style={{ width: 24, height: 24, fontSize: 10 }}>{user?.initials || "JM"}</div>
                                <span style={{ fontSize: 13, fontWeight: 500 }}>{user?.name || "Jean Mukendi"}</span>
                            </>
                        )}
                        <FiChevronDown size={14} />
                    </button>

                    {showUserMenu && (
                        <div className="user-dropdown-menu">
                            <div className="dropdown-item" onClick={() => window.location.href = '/provider/settings'}>{t('pt_settings')}</div>
                            <div className="dropdown-item danger" onClick={handleLogoutClick}>{t('pt_logout')}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="provider-modal-content" style={{ maxWidth: "450px", padding: "32px", textAlign: "center" }}>
                        <div style={{ width: "64px", height: "64px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                            <FiLogOut size={32} />
                        </div>
                        <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px", color: "#1e293b" }}>{t('pt_logout_title')}</h2>
                        <p style={{ color: "#64748b", marginBottom: "32px", lineHeight: "1.6" }}>
                            {t('pt_logout_msg')}
                        </p>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                className="btn-secondary"
                                style={{ flex: 1, padding: "12px" }}
                                onClick={() => setShowLogoutModal(false)}
                            >
                                {t('pt_cancel')}
                            </button>
                            <button
                                className="primary-btn"
                                style={{ flex: 1, padding: "12px", backgroundColor: "#ef4444", border: "none" }}
                                onClick={logout}
                            >
                                {t('pt_yes_logout')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderTopbar;

