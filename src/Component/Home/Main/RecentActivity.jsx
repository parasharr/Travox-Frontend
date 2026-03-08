import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../LanguageContext';

const RecentActivity = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const token = localStorage.getItem('token');
                const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
                const response = await fetch(`${baseUrl}api/bookings/my`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!response.ok) throw new Error("Failed to fetch activities");
                const data = await response.json();
                const bookingsData = Array.isArray(data) ? data : (data.data || []);
                bookingsData.sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate));
                const recentBookings = bookingsData.slice(0, 5);
                const mappedActivities = recentBookings.map(b => ({
                    id: b._id || b.id,
                    user: 'You',
                    action: b.status === 'completed' ? 'completed booking for' : 'booked',
                    target: b.serviceName || b.service?.name || "Service",
                    time: new Date(b.createdAt || b.bookingDate).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    }),
                    status: b.status || 'Pending',
                    statusColor: getStatusColor(b.status)
                }));
                setActivities(mappedActivities);
            } catch (err) {
                console.error("Error fetching recent activity:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, []);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            case 'confirmed': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="activity-section">
                <div className="activity-header">
                    <h2>{t('dash_recent_activity')}</h2>
                </div>
                <div className="p-4 text-center text-gray-500">{t('dash_loading_activity')}</div>
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="activity-section">
                <div className="activity-header">
                    <h2>{t('dash_recent_activity')}</h2>
                </div>
                <div className="p-4 text-center text-gray-500">{t('dash_no_activity')}</div>
            </div>
        );
    }

    return (
        <div className="activity-section">
            <div className="activity-header">
                <h2>{t('dash_recent_activity')}</h2>
                <Link to="/my-bookings" className="activity-link">{t('dash_view_all')}</Link>
            </div>
            <div className="activity-list">
                {activities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                        <div className="timeline-container">
                            <div className="dot"></div>
                            <div className="vertical-line timeline-line"></div>
                        </div>
                        <div className="activity-content">
                            <div className="flex justify-between items-start mb-1">
                                <div className="user-info font-medium text-sm">
                                    <span className="text-gray-900 font-semibold">{activity.user}</span>
                                    <span className="text-gray-500 ml-1">{activity.action}</span>
                                    <span className="text-blue-600 font-medium ml-1">{activity.target}</span>
                                </div>
                                <span className={`status-pill ${activity.statusColor} text-xs px-2 py-0.5 rounded-full`}>
                                    {activity.status}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentActivity;
