export default function StatCard({
  title,
  value,
  sub,
  trend,
  icon,
  color,
}) {
  return (
    <div className={`stat-card ${color}`}>
      
      {/* HEADER */}
      <div className="stat-header">
        <p className="stat-title">{title}</p>
        <div className="stat-icon">{icon}</div>
      </div>

      {/* MAIN */}
      <div className="stat-main">
        <div className="stat-value">{value}</div>
        {sub && <p className="stat-sub">{sub}</p>}
      </div>

      {/* FOOTER */}
      {trend && (
        <div className="stat-footer">
          <span className="stat-trend">↑ {trend}</span>
        </div>
      )}
    </div>
  );
}
