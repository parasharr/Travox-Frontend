import "../admin.css";

export default function Card({ children, className = "" }) {
  return (
    <div className={`admin-card ${className}`}>
      {children}
    </div>
  );
}
