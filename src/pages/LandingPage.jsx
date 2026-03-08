import React, { useState, useRef, useEffect } from 'react';
import {
    FiMenu, FiX, FiCheck, FiStar, FiChevronDown, FiChevronUp,
    FiTruck, FiHome, FiTool, FiCoffee, FiGlobe, FiShield,
    FiFacebook, FiTwitter, FiInstagram, FiLinkedin
} from 'react-icons/fi';
import { useLanguage } from '../LanguageContext';
import '../landing.css';
import '../user.css';

const LandingPage = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const langDropdownRef = useRef(null);
    const { language, setLanguage, t } = useLanguage();

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
                setLangDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const services = [
        { icon: <FiTruck />, titleKey: "service_1_title", descKey: "service_1_desc" },
        { icon: <FiHome />, titleKey: "service_2_title", descKey: "service_2_desc" },
        { icon: <FiTool />, titleKey: "service_3_title", descKey: "service_3_desc" },
        { icon: <FiCoffee />, titleKey: "service_4_title", descKey: "service_4_desc" },
        { icon: <FiGlobe />, titleKey: "service_5_title", descKey: "service_5_desc" },
        { icon: <FiShield />, titleKey: "service_6_title", descKey: "service_6_desc" },
        { icon: <FiStar />, titleKey: "service_7_title", descKey: "service_7_desc" },
        { icon: <FiTool />, titleKey: "service_8_title", descKey: "service_8_desc" }
    ];

    const faqs = [
        { qKey: "faq_1_q", aKey: "faq_1_a" },
        { qKey: "faq_2_q", aKey: "faq_2_a" },
        { qKey: "faq_3_q", aKey: "faq_3_a" },
        { qKey: "faq_4_q", aKey: "faq_4_a" }
    ];

    const handleLanguageSelect = (lang) => {
        setLanguage(lang);
        setLangDropdownOpen(false);
    };

    return (
        <div className="landing-container">
            {/* Navbar */}
            <nav className={`landing-navbar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="nav-logo">
                    <img src="/logo.png" alt="Travox" />
                    <span style={{ fontWeight: 800, fontSize: 24, letterSpacing: -1 }}>TRAVOX</span>
                </div>

                {/* Desktop Nav */}
                <div className="nav-links">
                    <a href="#home">{t('nav_home')}</a>
                    <a href="#services">{t('nav_services')}</a>
                    <a href="#why-us">{t('nav_why_us')}</a>
                    <a href="#testimonials">{t('nav_reviews')}</a>
                    <a href="#contact">{t('nav_contact')}</a>
                </div>

                <div className="nav-actions">
                    {/* Language Dropdown */}
                    <div className="lang-dropdown" ref={langDropdownRef}>
                        <button
                            className="lang-dropdown-btn"
                            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                            aria-label="Select Language"
                            id="language-selector"
                        >
                            <FiGlobe className="lang-icon" />
                            <span className="lang-label">{language === 'en' ? 'EN' : 'FR'}</span>
                            <FiChevronDown className={`lang-chevron ${langDropdownOpen ? 'rotated' : ''}`} />
                        </button>
                        <div className={`lang-dropdown-menu ${langDropdownOpen ? 'open' : ''}`}>
                            <button
                                className={`lang-option ${language === 'en' ? 'active' : ''}`}
                                onClick={() => handleLanguageSelect('en')}
                            >
                                <span className="lang-flag">🇬🇧</span>
                                <span>{t('lang_english')}</span>
                                {language === 'en' && <FiCheck className="lang-check" />}
                            </button>
                            <button
                                className={`lang-option ${language === 'fr' ? 'active' : ''}`}
                                onClick={() => handleLanguageSelect('fr')}
                            >
                                <span className="lang-flag">🇫🇷</span>
                                <span>{t('lang_french')}</span>
                                {language === 'fr' && <FiCheck className="lang-check" />}
                            </button>
                        </div>
                    </div>

                    <a href="/login?role=user" className="btn btn-login desktop-only">{t('nav_login')}</a>
                    <a href="/login?role=provider" className="btn btn-primary desktop-only">{t('nav_join_pro')}</a>
                    <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>

                {/* Mobile Nav Dropdown */}
                <div className={`mobile-nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
                    <a href="#home" onClick={() => setMobileMenuOpen(false)}>{t('nav_home')}</a>
                    <a href="#services" onClick={() => setMobileMenuOpen(false)}>{t('nav_services')}</a>
                    <a href="#why-us" onClick={() => setMobileMenuOpen(false)}>{t('nav_why_us')}</a>
                    <a href="#testimonials" onClick={() => setMobileMenuOpen(false)}>{t('nav_reviews')}</a>
                    <a href="#contact" onClick={() => setMobileMenuOpen(false)}>{t('nav_contact')}</a>
                    <div className="mobile-nav-actions">
                        <a href="/login?role=user" className="btn btn-login">{t('nav_login')}</a>
                        <a href="/login?role=provider" className="btn btn-primary">{t('nav_join_pro')}</a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="hero-section">
                <div className="hero-content">
                    <h1>{t('hero_title_1')}<span>{t('hero_title_highlight')}</span></h1>
                    <p>{t('hero_desc')}</p>
                    <div className="hero-actions">
                        <a href="/service" className="btn btn-primary btn-hero">{t('hero_find_service')}</a>
                        <a href="/login?role=provider" className="btn btn-login btn-hero" style={{ color: 'white', borderColor: 'white' }}>{t('hero_become_provider')}</a>
                    </div>
                </div>

                {/* Ticker */}
                <div className="service-ticker">
                    <div className="ticker-content">
                        <span className="ticker-item">{t('ticker_moving')}</span>
                        <span className="ticker-item">{t('ticker_cleaning')}</span>
                        <span className="ticker-item">{t('ticker_plumbing')}</span>
                        <span className="ticker-item">{t('ticker_electrician')}</span>
                        <span className="ticker-item">{t('ticker_event')}</span>
                        <span className="ticker-item">{t('ticker_design')}</span>
                        <span className="ticker-item">{t('ticker_training')}</span>
                        <span className="ticker-item">{t('ticker_beauty')}</span>
                        {/* Duplicate for seamless scroll */}
                        <span className="ticker-item">{t('ticker_moving')}</span>
                        <span className="ticker-item">{t('ticker_cleaning')}</span>
                        <span className="ticker-item">{t('ticker_plumbing')}</span>
                        <span className="ticker-item">{t('ticker_electrician')}</span>
                        <span className="ticker-item">{t('ticker_event')}</span>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="section" style={{ paddingBottom: 0 }}>
                <div className="landing-section-header">
                    <h2>{t('services_title')}</h2>
                    <p>{t('services_desc')}</p>
                </div>
                <div className="landing-services-grid">
                    {services.map((service, index) => (
                        <div key={index} className="landing-service-card">
                            <div className="landing-service-icon">{service.icon}</div>
                            <h3>{t(service.titleKey)}</h3>
                            <p>{t(service.descKey)}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Why Choose Us */}
            <section id="why-us" className="section">
                <div className="landing-section-header">
                    <h2>{t('why_title')}</h2>
                    <p>{t('why_desc')}</p>
                </div>
                <div className="features-grid">
                    <div className="feature-box">
                        <div className="feature-icon-circle"><FiCheck /></div>
                        <h3>{t('why_1_title')}</h3>
                        <p>{t('why_1_desc')}</p>
                    </div>
                    <div className="feature-box">
                        <div className="feature-icon-circle"><FiShield /></div>
                        <h3>{t('why_2_title')}</h3>
                        <p>{t('why_2_desc')}</p>
                    </div>
                    <div className="feature-box">
                        <div className="feature-icon-circle"><FiStar /></div>
                        <h3>{t('why_3_title')}</h3>
                        <p>{t('why_3_desc')}</p>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="section section-bg">
                <div className="landing-section-header">
                    <h2>{t('testimonials_title')}</h2>
                    <p>{t('testimonials_desc')}</p>
                </div>
                <div className="testimonials-slider">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="testimonial-card">
                            <div className="t-rating">
                                <FiStar style={{ fill: '#fbbf24', stroke: 'none' }} />
                                <FiStar style={{ fill: '#fbbf24', stroke: 'none' }} />
                                <FiStar style={{ fill: '#fbbf24', stroke: 'none' }} />
                                <FiStar style={{ fill: '#fbbf24', stroke: 'none' }} />
                                <FiStar style={{ fill: '#fbbf24', stroke: 'none' }} />
                            </div>
                            <p className="t-text">{t('testimonial_text')}</p>
                            <div className="t-author">
                                <div className="t-avatar">{language === 'fr' ? 'JD' : 'JD'}</div>
                                <div>
                                    <strong>{t('testimonial_name')}</strong>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>{t('testimonial_role')}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="section">
                <div className="landing-section-header">
                    <h2>{t('faq_title')}</h2>
                </div>
                <div className="faq-container">
                    {faqs.map((f, i) => (
                        <div key={i} className="faq-item">
                            <div className="faq-question" onClick={() => toggleFaq(i)}>
                                {t(f.qKey)}
                                {openFaq === i ? <FiChevronUp /> : <FiChevronDown />}
                            </div>
                            {openFaq === i && <div className="faq-answer">{t(f.aKey)}</div>}
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact */}
            <section id="contact" className="section contact-section">
                <div className="contact-container">
                    <div className="contact-text">
                        <h2>{t('contact_title')}</h2>
                        <p>{t('contact_desc')}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'white', color: 'var(--contact-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiMenu /></div>
                                <h3>{t('contact_support')}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="contact-form">
                        <h3 style={{ marginBottom: 20 }}>{t('contact_form_title')}</h3>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="form-group">
                                <label>{t('contact_name')}</label>
                                <input type="text" placeholder={t('contact_name_placeholder')} />
                            </div>
                            <div className="form-group">
                                <label>{t('contact_email')}</label>
                                <input type="email" placeholder={t('contact_email_placeholder')} />
                            </div>
                            <div className="form-group">
                                <label>{t('contact_message')}</label>
                                <textarea rows="4" placeholder={t('contact_message_placeholder')}></textarea>
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%' }}>{t('contact_send')}</button>
                        </form>
                    </div>
                </div>
            </section>

            {/* NEW CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>{t('cta_title')}</h2>
                    <p>{t('cta_desc')}</p>
                    <div className="cta-buttons">
                        <a href="/login?role=provider" className="btn btn-light">{t('cta_provider')}</a>
                        <a href="/service" className="btn btn-outline-light">{t('cta_find')}</a>
                    </div>
                </div>
            </section>

            {/* Enhanced Footer */}
            <footer className="landing-footer">
                <div className="footer-top">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <img src="/logo.png" alt="Travox" />
                            <span>TRAVOX</span>
                        </div>
                        <p>{t('footer_desc')}</p>
                    </div>

                    <div className="footer-links-group">
                        <div className="footer-column">
                            <h4>{t('footer_company')}</h4>
                            <a href="#">{t('footer_about')}</a>
                            <a href="#">{t('footer_careers')}</a>
                            <a href="#">{t('footer_blog')}</a>
                            <a href="#">{t('footer_press')}</a>
                        </div>
                        <div className="footer-column">
                            <h4>{t('footer_services')}</h4>
                            <a href="#">{t('footer_moving')}</a>
                            <a href="#">{t('footer_cleaning')}</a>
                            <a href="#">{t('footer_plumbing')}</a>
                            <a href="#">{t('footer_events')}</a>
                        </div>
                        <div className="footer-column">
                            <h4>{t('footer_support')}</h4>
                            <a href="#">{t('footer_help')}</a>
                            <a href="#">{t('footer_safety')}</a>
                            <a href="#">{t('footer_terms_service')}</a>
                            <a href="#">{t('footer_privacy_policy')}</a>
                        </div>
                        <div className="footer-column">
                            <h4>{t('footer_get_in_touch')}</h4>
                            <a href="#">support@travox.com</a>
                            <a href="#">+1 (800) 123-4567</a>
                            <div className="footer-socials">
                                <div className="social-icon"><FiFacebook /></div>
                                <div className="social-icon"><FiTwitter /></div>
                                <div className="social-icon"><FiInstagram /></div>
                                <div className="social-icon"><FiLinkedin /></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Travox. {t('footer_rights')}</p>
                    <div className="footer-bottom-links">
                        <a href="#">{t('footer_privacy')}</a>
                        <a href="#">{t('footer_terms')}</a>
                        <a href="#">{t('footer_sitemap')}</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

