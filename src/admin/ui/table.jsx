import "../admin.css";
import { FiUser } from "react-icons/fi";
import { useLanguage } from "../../LanguageContext";

export default function RecentActivity({ data }) {
  const { t } = useLanguage();
  return (
    <div className="activity-card">

      {/* header */}
      <div className="activity-header">
        <h3>{t('admin_ui_table_recent_act') || "Recent Activity"}</h3>
        <span>{t('admin_ui_table_view_all') || "View All →"}</span>
      </div>

      {/* table */}
      <table className="activity-table">
        <thead>
          <tr>
            <th>{t('admin_ui_table_user') || "User"}</th>
            <th>{t('admin_ui_table_action') || "Action"}</th>
            <th>{t('admin_ui_table_time') || "Time"}</th>
            <th>{t('admin_ui_table_status') || "Status"}</th>
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((row, i) => (
              <tr key={i}>
                <td data-label="User">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FiUser style={{ color: "#6366f1" }} />
                    <span>{row.user}</span>
                  </div>
                </td>
                <td data-label="Action">{row.action}</td>
                <td data-label="Time" className="time">{row.time}</td>
                <td data-label="Status">
                  <span className={`status-pill ${row.status}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                {t('admin_ui_table_no_act') || "No recent activity"}
              </td>
            </tr>
          )}
        </tbody>
      </table>



    </div>
  );
}
