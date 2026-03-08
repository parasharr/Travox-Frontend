import React, { useState } from "react";
import {
    FiDollarSign,
    FiClock,
    FiCheckCircle,
    FiInfo,
    FiSearch,
    FiChevronRight,
    FiChevronLeft,
    FiDownload
} from "react-icons/fi";
import "../provider.css";
import { useLanguage } from "../../LanguageContext";

const ProviderPayments = () => {
    const [activeTab, setActiveTab] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const { t } = useLanguage();

    // Mock Data (Cleared as per request)
    const transactions = [];

    const getStatusClass = (status) => {
        switch (status) {
            case "Held": return "status-badge-payment held";
            case "Released": return "status-badge-payment released";
            case "Withdrawn": return "status-badge-payment withdrawn";
            default: return "";
        }
    };

    return (
        <div className="dashboard-page">
            <div className="page-header-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h1 className="page-title">{t('ppay_title')}</h1>
                </div>
                <div className="date-range-filter">
                    <span>{t('ppay_date_range')}</span>
                    <select>
                        <option>{t('ppay_last_30')}</option>
                        <option>{t('ppay_last_90')}</option>
                        <option>{t('ppay_this_year')}</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="payment-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon-wrapper blue">
                        <FiDollarSign />
                    </div>
                    <div className="stat-content">
                        <h2>$0</h2>
                        <span>{t('ppay_total_earnings')}</span>
                        <div className="stat-change positive">+ $0 {t('ppay_this_month')}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper orange">
                        <FiClock />
                    </div>
                    <div className="stat-content">
                        <h2>$0</h2>
                        <span>{t('ppay_pending_release')}</span>
                        <div className="stat-helper">{t('ppay_no_awaiting')}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper green">
                        <FiCheckCircle />
                    </div>
                    <div className="stat-content">
                        <h2>$0</h2>
                        <span>{t('ppay_available')}</span>
                    </div>
                </div>
            </div>

            {/* Information Info Box */}
            <div className="info-banner-blue">
                <div className="info-banner-icon"><FiInfo /></div>
                <div>
                    <h4>{t('ppay_how_payments')}</h4>
                    <p>{t('ppay_how_msg')}</p>
                    <a href="#">{t('ppay_learn_more')} &rarr;</a>
                </div>
            </div>

            {/* Payment History Section */}
            <div className="payment-history-section">
                <h3 className="section-title">{t('ppay_history')}</h3>

                <div className="ph-filters">
                    <div className="ph-tabs">
                        {[{ key: 'All', label: t('ppay_all') }, { key: 'Held', label: t('ppay_held') }, { key: 'Released', label: t('ppay_released') }, { key: 'Withdrawn', label: t('ppay_withdrawn') }].map(tab => (
                            <button
                                key={tab.key}
                                className={`ph-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="ph-controls">
                    <div className="search-input-wrapper" style={{ width: '100%', maxWidth: '400px' }}>
                        <FiSearch />
                        <input
                            type="text"
                            placeholder={t('ppay_search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select className="filter-select">
                        <option>{t('ppay_recent_first')}</option>
                        <option>{t('ppay_oldest_first')}</option>
                        <option>{t('ppay_amount_high')}</option>
                    </select>
                </div>

                <div className="table-card" style={{ marginTop: '24px' }}>
                    <div style={{ overflowX: "auto" }}>
                        <table className="provider-table">
                            <thead>
                                <tr>
                                    <th>{t('ppay_id')}</th>
                                    <th>{t('ppay_service')}</th>
                                    <th>{t('ppay_client')}</th>
                                    <th>{t('ppay_date')}</th>
                                    <th>{t('ppay_status')}</th>
                                    <th>{t('ppay_amount')}</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                                <FiInfo size={24} style={{ opacity: 0.5 }} />
                                                <p>{t('ppay_no_transactions')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : transactions
                                    .filter(t => activeTab === 'All' || t.status === activeTab)
                                    .map((txn, idx) => (
                                        <tr key={idx}>
                                            <td style={{ fontWeight: 600, color: '#2563eb' }}>{txn.id}</td>
                                            <td>{txn.service}</td>
                                            <td>
                                                <div className="client-cell">
                                                    <div className="client-avatar" style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                                                        {txn.client.charAt(0)}
                                                    </div>
                                                    <span>{txn.client}</span>
                                                </div>
                                            </td>
                                            <td>{txn.date}</td>
                                            <td>
                                                <span className={getStatusClass(txn.status)}>
                                                    {txn.status}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 700 }}>${txn.amount.toFixed(2)}</td>
                                            <td>
                                                <button className="icon-btn-simple"><FiChevronRight /></button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="pagination-bar">
                    <span>{t('ppay_showing')} 0-0 {t('ppay_of')} 0 {t('ppay_payments')}</span>
                    <div className="pagination-controls">
                        <button>&lt;</button>
                        <button className="active">1</button>
                        <button>2</button>
                        <button>3</button>
                        <button>&gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderPayments;
