import React, { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiSend } from "react-icons/fi";
import "../provider.css";
import { useLanguage } from "../../LanguageContext";

const ProviderHelp = () => {
    const [formData, setFormData] = useState({
        subject: "",
        message: ""
    });
    const { t } = useLanguage();

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(t('phelp_sent_alert'));
        setFormData({ subject: "", message: "" });
    };

    return (
        <div className="dashboard-page">
            <div className="page-header-row">
                <h1 className="page-title">{t('phelp_title')}</h1>
            </div>

            <div className="help-container">
                <div className="help-contact-info">
                    <h3>{t('phelp_contact_us')}</h3>
                    <p>{t('phelp_contact_msg')}</p>

                    <div className="contact-item">
                        <div className="contact-icon"><FiMail /></div>
                        <div>
                            <span>{t('phelp_email')}</span>
                            <a href="mailto:support@travox.com">support@travox.com</a>
                        </div>
                    </div>

                    <div className="contact-item">
                        <div className="contact-icon"><FiPhone /></div>
                        <div>
                            <span>{t('phelp_call')}</span>
                            <a href="tel:+243999999999">+243 99 999 9999</a>
                        </div>
                    </div>

                    <div className="contact-item">
                        <div className="contact-icon"><FiMapPin /></div>
                        <div>
                            <span>{t('phelp_office')}</span>
                            <p>123 Travox Plaza, Kinshasa, DRC</p>
                        </div>
                    </div>
                </div>

                <div className="help-form-card">
                    <h3>{t('phelp_send_msg')}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>{t('phelp_subject')}</label>
                            <input
                                type="text"
                                placeholder={t('phelp_subject_placeholder')}
                                required
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('phelp_description')}</label>
                            <textarea
                                rows="6"
                                placeholder={t('phelp_desc_placeholder')}
                                required
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="primary-btn">
                            <FiSend style={{ marginRight: 8 }} /> {t('phelp_send')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProviderHelp;

