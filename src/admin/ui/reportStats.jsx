import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

const spark = [
  { v: 10 },
  { v: 15 },
  { v: 12 },
  { v: 18 },
  { v: 16 },
  { v: 22 },
];

export default function ReportCards({ stats = null }) {
  const displayStats = stats || {
    revenue: 0,
    bookings: 0,
    completionRate: 0,
    newUsers: 0,
    clients: 0,
    providers: 0,
    platformFees: 0
  };

  return (
    <div className="report-cards">

      <div className="report-card">
        <p className="card-title">TOTAL REVENUE (THIS PERIOD)</p>
        <h2>${displayStats.revenue.toLocaleString()}</h2>
        <span className="card-green">Real-time processed</span>

        <div className="sparkline">
          <ResponsiveContainer width="100%" height={40}>
            <LineChart data={spark}>
              <Line
                type="monotone"
                dataKey="v"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="report-card">
        <p className="card-title">TOTAL BOOKINGS</p>
        <h2>{displayStats.bookings.toLocaleString()}</h2>
        <span className="card-green">Completion Rate: {displayStats.completionRate}%</span>

        <div className="sparkline">
          <ResponsiveContainer width="100%" height={40}>
            <LineChart data={spark}>
              <Line
                type="monotone"
                dataKey="v"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="report-card">
        <p className="card-title">TOTAL USERS</p>
        <h2>{displayStats.newUsers.toLocaleString()}</h2>
        <span>{displayStats.clients} Clients, {displayStats.providers} Providers</span>

        <div className="sparkline">
          <ResponsiveContainer width="100%" height={40}>
            <LineChart data={spark}>
              <Line
                type="monotone"
                dataKey="v"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="report-card">
        <p className="card-title">PLATFORM CATALOG</p>
        <h2>{displayStats.totalServices || 0} Services</h2>
        <span>{displayStats.totalCategories || 0} Active Categories</span>

        <div className="sparkline">
          <ResponsiveContainer width="100%" height={40}>
            <LineChart data={spark}>
              <Line
                type="monotone"
                dataKey="v"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
