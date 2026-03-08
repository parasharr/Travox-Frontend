import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import "../admin.css";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState({ name: "Admin", initials: "A" });

  useEffect(() => {
    const storedName = localStorage.getItem("loginName") || "Admin";
    const initials = storedName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    setUser({ name: storedName, initials });
  }, []);

  return (
    <div className={`admin-root ${collapsed ? "collapsed" : ""}`}>

      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="admin-body">
        <aside
          className={`admin-sidebar
            ${mobileOpen ? "open" : ""}
            ${!mobileOpen && collapsed ? "collapsed" : ""}
          `}
        >
          <Sidebar
            collapsed={collapsed}
            closeSidebar={() => setMobileOpen(false)}
          />
        </aside>

        <div className="admin-content">
          <div className="admin-topbar">
            <Topbar
              onMenuClick={() => setMobileOpen(true)}
              onDesktopToggle={() => setCollapsed(!collapsed)}
              user={user}
            />
          </div>

          <main className="admin-main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
