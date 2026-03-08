import "../admin.css";
import { FiAlertTriangle, FiSearch, FiDownload } from "react-icons/fi";
import { useState, useEffect } from "react";
import PaymentStats from "../ui/paymentstats";
import PaymentTabs from "../ui/paymentTabs";
import PaymentTable from "../ui/paymentTable";
import { useLanguage } from "../../LanguageContext";

export default function Payments() {
  const { t } = useLanguage();

  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(t('admin_payments_tab_all') || "All");
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState(t('admin_payments_filter_all_providers') || "All Providers");
  const [page, setPage] = useState(1);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";

      // Fetch payments and users in parallel to resolve names
      const [payRes, userRes] = await Promise.all([
        fetch(`${baseUrl}api/payments`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${baseUrl}api/admin/users`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);

      if (!payRes.ok) throw new Error("Failed to fetch payments");

      const payData = await payRes.json();
      const rawPayments = Array.isArray(payData) ? payData : (payData.data || []);

      let userMap = {};
      if (userRes.ok) {
        const userData = await userRes.json();
        const users = Array.isArray(userData) ? userData : (userData.users || []);
        users.forEach(u => {
          userMap[u._id] = u.name;
        });
      }

      // Enrich payments with names from lookup or nested objects
      const enriched = rawPayments.map(p => ({
        ...p,
        providerName:
          p.providerName ||
          p.provider?.name ||
          p.providerDetails?.name ||
          userMap[p.providerId] ||
          "N/A",
        customerName:
          p.customerName ||
          p.customer?.name ||
          p.client?.name ||
          p.customerDetails?.name ||
          userMap[p.customerId] ||
          "N/A"
      }));

      setAllPayments(enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error("Fetch Payments Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const PER_PAGE = 5;

  // Derive unique providers list from data
  const providersList = [...new Set(allPayments.map(p => p.providerName).filter(n => n && n !== "N/A"))];

  const filtered = allPayments.filter((p) => {
    // Map API status to UI tab labels
    const mappedStatus =
      p.settlementStatus === "PAID" ? "Ready" :
        p.settlementStatus === "SETTLED" ? "Released" :
          p.settlementStatus === "REFUNDED" || p.status === "REFUNDED" ? "Refunded" :
            p.settlementStatus === "FAILED" || p.status === "FAILED" ? "Failed" : "Held";

    const matchTab = tab === "All" || tab === t('admin_payments_tab_all') || mappedStatus === tab;
    const matchProvider =
      provider === "All Providers" || provider === t('admin_payments_filter_all_providers') || p.providerName === provider;

    const searchLow = search.toLowerCase();
    const matchSearch =
      (p._id || "").toLowerCase().includes(searchLow) ||
      (p.paymentIntentId || "").toLowerCase().includes(searchLow) ||
      (p.providerName || "").toLowerCase().includes(searchLow) ||
      (p.customerName || "").toLowerCase().includes(searchLow);

    return matchTab && matchProvider && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading payments...</div>;
  if (error) return <div style={{ padding: '100px', textAlign: 'center', color: 'red' }}>Error: {error}</div>;

  return (
    <div className="payments-page">

      <div className="page-header">
        <h1>{t('admin_payments_title') || "Payment Management"}</h1>

        <div className="payment-warning">
          <FiAlertTriangle />
          <span>{t('admin_payments_warning') || "All payment actions are logged and require confirmation"}</span>
        </div>
      </div>

      <PaymentStats data={allPayments} />

      <PaymentTabs
        active={tab}
        setActive={(t) => {
          setTab(t);
          setPage(1);
        }}
      />

      <div className="payment-filters">
        <div className="payment-search">
          <FiSearch />
          <input
            placeholder={t('admin_payments_search_placeholder') || "Search by booking ID, provider or client..."}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="select-wrap">
          <select
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value);
              setPage(1);
            }}
          >
            <option value="All Providers">{t('admin_payments_filter_all_providers') || "All Providers"}</option>
            {providersList.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <button className="export-btn">
          <FiDownload /> {t('admin_payments_export') || "Export CSV"}
        </button>
      </div>

      <PaymentTable
        data={paginated}
        page={page}
        total={filtered.length}
        perPage={PER_PAGE}
        totalPages={totalPages}
        setPage={setPage}
        onRefresh={fetchPayments}
      />

    </div>
  );
}
