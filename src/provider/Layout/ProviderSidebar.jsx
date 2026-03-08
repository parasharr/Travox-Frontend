import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    FiGrid,
    FiBriefcase,
    FiCalendar,
    FiCheckSquare,
    FiCreditCard,
    FiStar,
    FiHelpCircle,
    FiSettings
} from "react-icons/fi";
import "../provider.css";
import { useLanguage } from "../../LanguageContext";

const ProviderSidebar = ({ collapsed, closeSidebar, user }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const menuItems = [
        { labelKey: "ps_main", isHeader: true },
        { nameKey: "ps_dashboard", icon: <FiGrid />, path: "/provider/dashboard" },
        { nameKey: "ps_my_services", icon: <FiBriefcase />, path: "/provider/services" },
        { nameKey: "ps_bookings", icon: <FiCalendar />, path: "/provider/bookings" },
        { labelKey: "ps_account", isHeader: true },
        { nameKey: "ps_kyc", icon: <FiCheckSquare />, path: "/provider/kyc" },
        { nameKey: "ps_payments", icon: <FiCreditCard />, path: "/provider/payments" },
        { nameKey: "ps_reviews", icon: <FiStar />, path: "/provider/reviews" },
        { labelKey: "ps_support", isHeader: true },
        { nameKey: "ps_help", icon: <FiHelpCircle />, path: "/provider/help" },
        { nameKey: "ps_settings", icon: <FiSettings />, path: "/provider/settings" },
    ];

    return (
        <div className="provider-sidebar-inner" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Logo */}
            <div className="sidebar-logo" style={{ justifyContent: collapsed ? "center" : "flex-start", paddingLeft: collapsed ? 0 : "20px" }}>
                <div style={{ marginRight: collapsed ? 0 : "10px", display: 'flex', alignItems: 'center' }}>
                    <img src="/logo.png" alt="Travox" style={{ height: '40px', objectFit: 'contain' }} />
                </div>
                {!collapsed && (
                    <div className="logo-text">
                        <span style={{ color: '#64748b', fontSize: '11px', letterSpacing: '1px' }}>{t('ps_provider')}</span>
                    </div>
                )}
            </div>

            {/* Menu */}
            <div className="sidebar-menu">
                {menuItems.map((item, index) => {
                    if (item.isHeader) {
                        return !collapsed && (
                            <div key={index} className="sidebar-group-label">
                                {t(item.labelKey)}
                            </div>
                        );
                    }

                    const isActive = location.pathname === item.path;
                    const name = t(item.nameKey);

                    return (
                        <div
                            key={index}
                            className={`sidebar-item ${isActive ? "active" : ""}`}
                            onClick={() => {
                                navigate(item.path);
                                if (window.innerWidth < 1024) closeSidebar();
                            }}
                            title={name}
                        >
                            <div className="sidebar-left-content">
                                <div style={{ minWidth: "20px", display: "flex", justifyContent: "center" }}>
                                    {item.icon}
                                </div>
                                {!collapsed && <span>{name}</span>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* User (Bottom) */}
            <div className="sidebar-user" style={{ justifyContent: collapsed ? "center" : "flex-start", opacity: !user ? 0.8 : 1 }}>
                {!user ? (
                    <>
                        <div className="user-avatar skeleton"></div>
                        {!collapsed && (
                            <div className="user-info">
                                <div className="skeleton" style={{ width: "100px", height: "16px" }}></div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="user-avatar">{user?.initials || "JM"}</div>
                        {!collapsed && (
                            <div className="user-info">
                                <p>{user?.name || "Jean Mukendi"}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProviderSidebar;

