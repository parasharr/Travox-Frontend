import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ProviderSidebar from "./ProviderSidebar";
import ProviderTopbar from "./ProviderTopbar";
import "../provider.css";

export default function ProviderLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [providerInfo, setProviderInfo] = React.useState(null);

    React.useEffect(() => {
        const fetchMe = async () => {
            try {
                const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
                const token = localStorage.getItem("token");
                const response = await fetch(`${baseUrl}api/providers/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.name) {
                        const initials = data.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                        setProviderInfo({ name: data.name, initials });
                    }
                }
            } catch (err) {
                console.error("Layout fetch error:", err);
            }
        };
        fetchMe();
    }, []);

    return (
        <div className="provider-root">
            {/* Mobile Overlay */}
            <div
                className={`provider-sidebar-overlay ${mobileOpen ? "visible" : ""}`}
                onClick={() => setMobileOpen(false)}
            />

            <div className="provider-body">
                <aside
                    className={`provider-sidebar ${mobileOpen ? "mobile-open" : ""} ${collapsed ? "collapsed" : ""}`}
                >
                    <ProviderSidebar
                        collapsed={collapsed}
                        closeSidebar={() => setMobileOpen(false)}
                        user={providerInfo}
                    />
                </aside>

                <div className="provider-content">
                    <ProviderTopbar
                        onMenuClick={() => setMobileOpen(!mobileOpen)}
                        onDesktopToggle={() => setCollapsed(!collapsed)}
                        user={providerInfo}
                    />

                    <main className="provider-main">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
