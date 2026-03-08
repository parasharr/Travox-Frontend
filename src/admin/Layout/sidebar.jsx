import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FiGrid,
  FiUsers,
  FiFileText,
  FiLayers,
  FiCalendar,
  FiDollarSign,
  FiAlertCircle,
  FiFile,
  FiSettings,
  FiX,
} from "react-icons/fi";
import logo from "../../assets/logo.jpeg";
import "../admin.css";
import { useLanguage } from "../../LanguageContext";

const menu = [
  { label: "admin_sidebar_dashboard", icon: FiGrid, path: "/admin/dashboard" },
  { label: "admin_sidebar_users", icon: FiUsers, path: "/admin/users" },
  { label: "admin_sidebar_kyc", icon: FiFileText, badge: "0", badgeColor: "yellow", path: "/admin/kyc" },
  { label: "admin_sidebar_services", icon: FiLayers, path: "/admin/services" },
  { label: "admin_sidebar_bookings", icon: FiCalendar, path: "/admin/bookings" },
  { label: "admin_sidebar_payments", icon: FiDollarSign, badge: "89", badgeColor: "blue", path: "/admin/payments" },
  { label: "admin_sidebar_disputes", icon: FiAlertCircle, badge: "3", badgeColor: "red", path: "/admin/disputes" },
  // { label: "admin_sidebar_reports", icon: FiFile, path: "/admin/reports" },
  { label: "admin_sidebar_settings", icon: FiSettings, path: "/admin/settings" },
];

export default function Sidebar({ collapsed, closeSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [kycCount, setKycCount] = useState(0);
  const [disputeCount, setDisputeCount] = useState(0);
  const [paymentCount, setPaymentCount] = useState(0);

  useEffect(() => {
    const fetchKycCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
        const response = await fetch(`${baseUrl}api/admin/kyc`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const pending = data.filter(item => (item.status || "pending") === "pending").length;
            setKycCount(pending);
          }
        }
      } catch (error) {
        console.error("Error fetching KYC count:", error);
      }
    };

    const fetchDisputeCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
        const response = await fetch(`${baseUrl}api/admin/disputes`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const pending = data.filter(item => (item.status || "pending") === "pending").length;
            setDisputeCount(pending);
          }
        }
      } catch (error) {
        console.error("Error fetching dispute count:", error);
      }
    };

    const fetchPaymentCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
        const response = await fetch(`${baseUrl}api/payments`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const payments = Array.isArray(data) ? data : (data.data || []);
          setPaymentCount(payments.length);
        }
      } catch (error) {
        console.error("Error fetching payment count:", error);
      }
    };

    fetchKycCount();
    fetchDisputeCount();
    fetchPaymentCount();

    // Optional: Poll every minute to keep it updated
    const interval = setInterval(() => {
      fetchKycCount();
      fetchDisputeCount();
      fetchPaymentCount();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* DESKTOP LOGO */}
      <div className="sidebar-logo">
        <img src={logo} alt="logo" className="admin-logo-only" />
      </div>

      {/* MENU */}
      {menu.map((item, i) => {
        const Icon = item.icon;
        let badgeValue = item.badge;

        // Override for KYC
        if (item.path === "/admin/kyc") {
          badgeValue = kycCount > 0 ? kycCount.toString() : null;
        }

        // Override for Disputes
        if (item.path === "/admin/disputes") {
          badgeValue = disputeCount > 0 ? disputeCount.toString() : null;
        }

        // Override for Payments
        if (item.path === "/admin/payments") {
          badgeValue = paymentCount > 0 ? paymentCount.toString() : null;
        }

        return (
          <div
            key={i}
            className={`sidebar-item ${location.pathname === item.path ? "active" : ""
              }`}
            onClick={() => {
              navigate(item.path);
              closeSidebar();
            }}
          >
            <div className="sidebar-left">
              <Icon className="sidebar-icon" />
              <span className="sidebar-label">{t(item.label) || item.label}</span>
            </div>

            {badgeValue && (
              <span className={`badge ${item.badgeColor}`}>
                {badgeValue}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
