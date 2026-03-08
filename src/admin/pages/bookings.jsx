import "../admin.css";
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import { FiDownload } from "react-icons/fi";
import BookingsTable from "../ui/bookingTable";
import { useLanguage } from "../../LanguageContext";

export default function Bookings() {
  const { t } = useLanguage();

  /* -------------------- STATE -------------------- */
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");
  const [range, setRange] = useState(t('admin_bookings_filter_30days') || "Last 30 days");
  const [category, setCategory] = useState(t('admin_bookings_filter_all_cats') || "All Categories");
  const [amountRange, setAmountRange] = useState(t('admin_bookings_filter_all_amounts') || "All Amounts");
  const [page, setPage] = useState(1);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation(); // Hook for sidebar trigger
  const PER_PAGE = 5;

  const resetPage = () => setPage(1);

  /* -------------------- FETCH DATA -------------------- */
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

        const response = await fetch(`${baseUrl}api/admin/bookings`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // API returns { bookings: [...] }
          if (data.bookings && Array.isArray(data.bookings)) {
            setBookings(data.bookings);
          } else {
            console.warn("Bookings API format unexpected:", data);
            setBookings([]);
          }
        } else {
          console.error("Failed to fetch bookings:", response.status);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [location.key]); // Trigger fetch on navigation

  /* -------------------- MAPPED DATA -------------------- */
  // Map API data to table expected format
  const mappedBookings = useMemo(() => {
    return bookings.map(b => ({
      id: `#${(b._id || "").slice(-6).toUpperCase()}`,
      date: new Date(b.date),
      client: b.client?.name || "Unknown",
      clientInitials: (b.client?.name || "U").substring(0, 2).toUpperCase(),
      provider: b.provider?.name || "Unknown",
      providerInitials: (b.provider?.name || "U").substring(0, 2).toUpperCase(),
      service: b.service?.name || "Deleted Service",
      status: b.status || "Pending",
      amount: typeof b.price === 'number' ? b.price : 0,
      original: b // Keep original data if needed
    }));
  }, [bookings]);

  /* -------------------- FILTER -------------------- */
  const filtered = useMemo(() => {
    const now = new Date();

    return mappedBookings.filter(b => {

      /* SEARCH */
      const searchMatch =
        b.id.toLowerCase().includes(search.toLowerCase()) ||
        b.client.toLowerCase().includes(search.toLowerCase()) ||
        b.provider.toLowerCase().includes(search.toLowerCase());

      /* TABS */
      // Exact match for status tabs
      const tabMatch = tab === "All" || b.status === tab;

      /* DATE */
      let dateMatch = true;
      const diffDays = (now - b.date) / 86400000;
      if (range === "Last 7 days" || range === t('admin_bookings_filter_7days')) dateMatch = diffDays <= 7;
      if (range === "Last 30 days" || range === t('admin_bookings_filter_30days')) dateMatch = diffDays <= 30;

      /* CATEGORY */
      // b.service is the name string
      const categoryMatch =
        category === "All Categories" || category === t('admin_bookings_filter_all_cats') || b.service === category;

      /* AMOUNT */
      let amountMatch = true;
      if (amountRange === "Under $100" || amountRange === t('admin_bookings_filter_under_100')) amountMatch = b.amount < 100;
      if (amountRange === "$100 – $150" || amountRange === t('admin_bookings_filter_100_150'))
        amountMatch = b.amount >= 100 && b.amount <= 150;
      if (amountRange === "Above $150" || amountRange === t('admin_bookings_filter_above_150')) amountMatch = b.amount > 150;

      return (
        searchMatch &&
        tabMatch &&
        dateMatch &&
        categoryMatch &&
        amountMatch
      );
    });
  }, [mappedBookings, search, tab, range, category, amountRange]);

  /* -------------------- PAGINATION -------------------- */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  const paginated = filtered.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  /* -------------------- EXPORT TO CSV -------------------- */
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      alert(t('admin_bookings_no_export') || "No bookings to export");
      return;
    }

    // CSV Headers
    const headers = ["Booking ID", "Date", "Client", "Provider", "Service", "Status", "Amount"];

    // CSV Rows
    const rows = filtered.map(b => [
      b.id,
      b.date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      b.client,
      b.provider,
      b.service,
      b.status,
      `$${b.amount.toFixed(2)}`
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bookings-page">

      {/* HEADER */}
      <div className="page-header">
        <h1>{t('admin_bookings_title') || "Booking Management"}</h1>
        <p>{t('admin_bookings_subtitle') || "Manage all platform bookings"}</p>
      </div>

      {/* TABS */}
      <div className="booking-tabs">
        {[
          { key: "All", label: t('admin_bookings_tab_all') || "All" },
          { key: "Pending", label: t('admin_bookings_tab_pending') || "Pending" },
          { key: "ClientApproved", label: t('admin_bookings_tab_client_approved') || "ClientApproved" },
          { key: "Completed", label: t('admin_bookings_tab_completed') || "Completed" },
          { key: "Cancelled", label: t('admin_bookings_tab_cancelled') || "Cancelled" },
          { key: "Disputed", label: t('admin_bookings_tab_disputed') || "Disputed" }
        ].map(tObj => (
          <span
            key={tObj.key}
            className={tab === tObj.key ? "active" : ""}
            onClick={() => {
              setTab(tObj.key);
              resetPage();
            }}
          >
            {tObj.label}
          </span>
        ))}
      </div>

      {/* FILTERS */}
      <div className="booking-filters">

        <input
          className="filter-input"
          placeholder={t('admin_bookings_search_placeholder') || "Search by booking ID, client, or provider..."}
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            resetPage();
          }}
        />

        <select
          value={range}
          onChange={e => {
            setRange(e.target.value);
            resetPage();
          }}
        >
          <option value="Last 7 days">{t('admin_bookings_filter_7days') || "Last 7 days"}</option>
          <option value="Last 30 days">{t('admin_bookings_filter_30days') || "Last 30 days"}</option>
        </select>

        <select
          value={category}
          onChange={e => {
            setCategory(e.target.value);
            resetPage();
          }}
        >
          <option value="All Categories">{t('admin_bookings_filter_all_cats') || "All Categories"}</option>
          {/* Dynamically could list services, but keeping hardcoded for filter UI consistency or should be dynamic? 
              For now keeping existing options but "All Categories" is default. */}
          <option value={t('admin_bookings_filter_house_help') || "House Help"}>{t('admin_bookings_filter_house_help') || "House Help"}</option>
          <option value={t('admin_bookings_filter_house_cleaning') || "House Cleaning"}>{t('admin_bookings_filter_house_cleaning') || "House Cleaning"}</option>
        </select>

        <select
          value={amountRange}
          onChange={e => {
            setAmountRange(e.target.value);
            resetPage();
          }}
        >
          <option value="All Amounts">{t('admin_bookings_filter_all_amounts') || "All Amounts"}</option>
          <option value="Under $100">{t('admin_bookings_filter_under_100') || "Under $100"}</option>
          <option value="$100 – $150">{t('admin_bookings_filter_100_150') || "$100 – $150"}</option>
          <option value="Above $150">{t('admin_bookings_filter_above_150') || "Above $150"}</option>
        </select>

        <button className="export-btn" onClick={handleExportCSV}>
          <FiDownload size={16} />
          {t('admin_bookings_export') || "Export CSV"}
        </button>
      </div>

      {/* TABLE */}
      {loading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>{t('admin_bookings_loading') || "Loading bookings..."}</p>
      ) : (
        <BookingsTable
          data={paginated}
          page={page}
          perPage={PER_PAGE}
          total={filtered.length}
          totalPages={totalPages}
          setPage={setPage}
        />
      )}

    </div>
  );
}
