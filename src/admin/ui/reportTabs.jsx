export default function ReportTabs({ activeTab, setActiveTab }) {
  return (
    <div className="report-tabs">

      <button
        className={activeTab === "overview" ? "active" : ""}
        onClick={() => setActiveTab("overview")}
      >
        Overview
      </button>

      <button
        className={activeTab === "bookings" ? "active" : ""}
        onClick={() => setActiveTab("bookings")}
      >
        Bookings Report
      </button>

      <button
        className={activeTab === "payments" ? "active" : ""}
        onClick={() => setActiveTab("payments")}
      >
        Payments Report
      </button>

      <button
        className={activeTab === "users" ? "active" : ""}
        onClick={() => setActiveTab("users")}
      >
        User Analytics
      </button>

      <button
        className={activeTab === "logs" ? "active" : ""}
        onClick={() => setActiveTab("logs")}
      >
        Activity Logs
      </button>

    </div>
  );
}
