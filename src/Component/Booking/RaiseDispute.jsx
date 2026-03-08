import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../Home/Navbar/Navbar";
import {
    FaArrowLeft,
    FaCheckCircle,
    FaExclamationCircle,
    FaGavel,
    FaHistory,
    FaChevronDown,
    FaPaperPlane
} from "react-icons/fa";
import { useLanguage } from "../../LanguageContext";

const RaiseDispute = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialBookingId = searchParams.get("bookingId") || "";
    const { t } = useLanguage();

    const [bookings, setBookings] = useState([]);
    const [selectedBookingId, setSelectedBookingId] = useState(initialBookingId);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetchingBookings, setFetchingBookings] = useState(true);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem("token");
                const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
                const response = await fetch(`${baseUrl}api/bookings/my`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("Failed to fetch bookings");
                const data = await response.json();
                const bookingsData = Array.isArray(data) ? data : data.data || [];
                setBookings(bookingsData);
                if (initialBookingId && bookingsData.some((b) => b._id === initialBookingId)) {
                    setSelectedBookingId(initialBookingId);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setFetchingBookings(false);
            }
        };
        fetchBookings();
    }, [initialBookingId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBookingId) {
            setMessage({ type: "error", text: t('rd_select_error') });
            return;
        }
        if (!reason.trim()) {
            setMessage({ type: "error", text: t('rd_describe_error') });
            return;
        }
        setLoading(true);
        setMessage({ type: "", text: "" });
        try {
            const token = localStorage.getItem("token");
            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
            const response = await fetch(`${baseUrl}api/disputes`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ bookingId: selectedBookingId, reason: reason.trim() }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to raise dispute");
            setMessage({ type: "success", text: t('rd_success_msg') });
            setReason("");
            setTimeout(() => navigate("/home"), 2500);
        } catch (err) {
            setMessage({ type: "error", text: err.message || "Something went wrong." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Header />
            <div className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>
                <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-[80px] pointer-events-none"></div>

                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-12">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide mb-4 animate-[fadeIn_0.5s_ease-out]">
                            <FaGavel className="text-blue-600" /> {t('rd_support_center')}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                            {t('rd_title_1')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{t('rd_title_2')}</span>
                        </h1>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                            {t('rd_subtitle')}
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[600px] transform transition-all hover:shadow-2xl">
                        <div className="w-full md:w-5/12 bg-gradient-to-br from-blue-600 to-indigo-700 !p-10 flex flex-col justify-between text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3"></div>

                            <div className="relative z-10">
                                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors text-sm font-medium group mb-12">
                                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                                    {t('rd_back')}
                                </button>

                                <h3 className="text-2xl font-bold mb-4">{t('rd_how_it_works')}</h3>
                                <div className="space-y-6">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-bold border border-white/20 shadow-sm backdrop-blur-sm">1</div>
                                        <div>
                                            <span className="font-semibold block mb-1">{t('rd_step_1_title')}</span>
                                            <p className="text-blue-100 text-sm leading-relaxed opacity-90">{t('rd_step_1_desc')}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-bold border border-white/20 shadow-sm backdrop-blur-sm">2</div>
                                        <div>
                                            <span className="font-semibold block mb-1">{t('rd_step_2_title')}</span>
                                            <p className="text-blue-100 text-sm leading-relaxed opacity-90">{t('rd_step_2_desc')}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-bold border border-white/20 shadow-sm backdrop-blur-sm">3</div>
                                        <div>
                                            <span className="font-semibold block mb-1">{t('rd_step_3_title')}</span>
                                            <p className="text-blue-100 text-sm leading-relaxed opacity-90">{t('rd_step_3_desc')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 text-xs text-blue-200 mt-12 bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                                <p>{t('rd_secure_note')}</p>
                            </div>
                        </div>

                        <div className="w-full md:w-7/12 !p-8 md:!p-12 bg-white relative flex flex-col justify-center">
                            <h2 className="text-2xl font-bold text-slate-800 mb-8 border-b border-slate-100 pb-4">
                                {t('rd_details')}
                            </h2>

                            {message.text && (
                                <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 shadow-sm text-sm animate-[fadeIn_0.5s_ease-out] border ${message.type === "success"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : "bg-rose-50 text-rose-700 border-rose-100"
                                    }`}>
                                    {message.type === "success" ? (
                                        <FaCheckCircle className="mt-0.5 text-lg" />
                                    ) : (
                                        <FaExclamationCircle className="mt-0.5 text-lg" />
                                    )}
                                    <span className="font-medium">{message.text}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('rd_affected_booking')}</label>
                                    <div className="relative group">
                                        <select
                                            value={selectedBookingId}
                                            onChange={(e) => setSelectedBookingId(e.target.value)}
                                            disabled={fetchingBookings}
                                            className="w-full !pl-12 !pr-10 !py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer hover:border-slate-300"
                                        >
                                            <option value="">{t('rd_select_booking')}</option>
                                            {bookings.map((booking) => (
                                                <option key={booking._id} value={booking._id}>
                                                    {booking.serviceName || booking.service?.name || "Service"} • {new Date(booking.bookingDate || booking.createdAt).toLocaleDateString()}
                                                </option>
                                            ))}
                                        </select>
                                        <FaHistory className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                        <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                                    </div>
                                    {fetchingBookings && <p className="text-xs text-blue-600 mt-2 font-medium animate-pulse">{t('rd_loading_history')}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('rd_issue_desc')}</label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder={t('rd_issue_placeholder')}
                                        className="w-full !p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[160px] resize-none placeholder:text-slate-400 hover:border-slate-300 block"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading || fetchingBookings}
                                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${loading || fetchingBookings
                                            ? "bg-slate-300 cursor-not-allowed shadow-none"
                                            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40"
                                            }`}
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>{t('rd_processing')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>{t('rd_submit')}</span>
                                                <FaPaperPlane className="text-sm" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RaiseDispute;
