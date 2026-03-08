import React, { useState, useEffect } from 'react';
import {
    FiCheckCircle,
    FiClock,
    FiAlertCircle,
    FiChevronDown,
    FiChevronUp,
    FiFileText,
    FiUploadCloud,
    FiEye,
    FiInfo
} from 'react-icons/fi';
import "../provider.css";

const ProviderKYC = () => {
    // Overall Status: 'under_review', 'rejected', 'verified', 'pending'
    const [overallStatus, setOverallStatus] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [submissionDate, setSubmissionDate] = useState(null);

    // Collapsible sections state
    const [expandedSection, setExpandedSection] = useState('identity');

    // Upload notification state
    const [uploadNotification, setUploadNotification] = useState({ show: false, message: '', type: '' });

    // Generic Modal state
    const [modal, setModal] = useState({ show: false, title: '', message: '', type: 'info' });

    // Documents State
    const [documents, setDocuments] = useState([
        {
            id: 'personal_info',
            title: 'Personal Information',
            status: 'pending', // completed, pending, rejected
            description: 'Full name, date of birth, and contact details.',
            files: [],
            requirements: [
                'Provide your full legal name as per ID',
                'Date of birth must match your identity document',
                'Valid email address and phone number required',
                'Current residential address needed'
            ]
        },
        {
            id: 'identity',
            title: 'Identity Document',
            status: 'pending',
            description: 'Upload a clear photo of your National ID, Passport, or Driver\'s License.',
            files: [],
            requirements: [
                'Document must be valid and not expired',
                'All four corners must be visible',
                'Text must be clearly readable',
                'Accepted formats: JPG, PNG, PDF (max 5MB)'
            ]
        },
        {
            id: 'address',
            title: 'Address Proof',
            status: 'pending',
            description: 'Utility bill, bank statement, or rental agreement (not older than 3 months).',
            files: [],
            requirements: [
                'Must show your full name and address',
                'Document date must be within last 3 months',
                'Logo/Letterhead must be visible'
            ]
        },
        {
            id: 'business',
            title: 'Business Registration',
            status: 'pending',
            description: 'Certificate of incorporation or business license.',
            files: [],
            requirements: [
                'Official certificate needed',
                'Must match the business name provided'
            ]
        },
        {
            id: 'tax',
            title: 'Tax Identification',
            status: 'pending',
            description: 'Tax ID card or official tax document.',
            files: [],
            requirements: [
                'Clear scan of tax document',
                'Tax ID number must be visible'
            ]
        },
        {
            id: 'insurance',
            title: 'Professional Liability Insurance',
            status: 'pending',
            description: 'Proof of insurance coverage for your services.',
            files: [],
            requirements: [
                'Policy number must be visible',
                'Coverage dates must be valid'
            ]
        }
    ]);

    // Fetch KYC documents on component mount
    useEffect(() => {
        const fetchKYCDocuments = async () => {
            setLoading(true);

            // Safety timeout to prevent infinite loading
            const timeoutId = setTimeout(() => {
                setLoading(false);
            }, 10000);

            try {
                const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
                const token = localStorage.getItem("token");

                const response = await fetch(`${baseUrl}api/providers/me/kyc`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    console.error('Failed to fetch KYC documents');
                    return;
                }

                const data = await response.json();

                // Map API data to documents state
                if (data && data.kyc && Array.isArray(data.kyc.documents)) {
                    setDocuments(prev => prev.map(doc => {
                        const apiDocs = data.kyc.documents.filter(d => d.documentType === doc.title);
                        if (apiDocs.length > 0) {
                            const latestDoc = apiDocs[apiDocs.length - 1];
                            const files = apiDocs.map(apiDoc => ({
                                name: apiDoc.fileUrl.split('/').pop() || 'Document',
                                size: 'N/A',
                                date: new Date(apiDoc.uploadedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                url: apiDoc.fileUrl
                            }));

                            return {
                                ...doc,
                                status: latestDoc.status || doc.status,
                                files: files,
                                feedback: latestDoc.feedback || doc.feedback
                            };
                        }
                        return doc;
                    }));

                    if (data.kyc.status) {
                        setOverallStatus(data.kyc.status.toLowerCase());
                    }

                    if (data.kyc.submittedAt) {
                        setSubmissionDate(new Date(data.kyc.submittedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }));
                    }
                }
            } catch (error) {
                console.error('Error fetching KYC documents:', error);
            } finally {
                clearTimeout(timeoutId);
                setLoading(false);
            }
        };

        fetchKYCDocuments();
    }, []);

    const toggleSection = (id) => {
        setExpandedSection(expandedSection === id ? null : id);
    };

    const getStatusIcon = (status) => {
        const s = status ? status.toLowerCase() : '';
        switch (s) {
            case 'completed':
            case 'verified':
            case 'approved':
                return <FiCheckCircle className="icon-success" />;
            case 'under_review': return <FiClock className="icon-warning" />;
            case 'rejected': return <FiAlertCircle className="icon-danger" />;
            default: return <div className="icon-circle-empty"></div>;
        }
    };

    const getStatusLabel = (status) => {
        const s = status ? status.toLowerCase() : '';
        switch (s) {
            case 'completed': return 'Completed';
            case 'verified':
            case 'approved':
                return 'Verified';
            case 'under_review': return 'Under Review';
            case 'rejected': return 'Rejected'; // Action Required
            default: return 'Pending';
        }
    };

    // File upload handlers
    const handleFileSelect = async (docId, files) => {
        const file = files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            setModal({ show: true, title: 'Invalid File Type', message: 'Please upload a JPG, PNG, or PDF file', type: 'error' });
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            setModal({ show: true, title: 'File Too Large', message: 'File size must be less than 5MB', type: 'error' });
            return;
        }

        // Find the document to get its title
        const document = documents.find(doc => doc.id === docId);
        if (!document) return;

        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', document.title);

        // Show uploading notification
        setUploadNotification({ show: true, message: 'Uploading...', type: 'loading' });

        try {
            const baseUrl = import.meta.env.VITE_BASE_URL || "https://travox-backend.vercel.app/";
            const token = localStorage.getItem("token");

            const response = await fetch(`${baseUrl}api/kyc/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload document');
            }

            const data = await response.json();

            // Add file to the document state
            const fileData = {
                name: file.name,
                size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            };

            setDocuments(prev => prev.map(doc => {
                if (doc.id === docId) {
                    return {
                        ...doc,
                        files: [...doc.files, fileData],
                        status: 'under_review'
                    };
                }
                return doc;
            }));

            // Show success notification
            setUploadNotification({ show: true, message: 'Successfully Uploaded', type: 'success' });

            // Auto-hide after 3 seconds
            setTimeout(() => {
                setUploadNotification({ show: false, message: '', type: '' });
            }, 3000);
        } catch (error) {
            console.error('Error uploading document:', error);
            setUploadNotification({ show: false, message: '', type: '' });
            setModal({ show: true, title: 'Upload Failed', message: error.message || 'Failed to upload document. Please try again.', type: 'error' });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e, docId) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        handleFileSelect(docId, files);
    };

    const handleClick = (docId) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.jpg,.jpeg,.png,.pdf';
        input.onchange = (e) => handleFileSelect(docId, e.target.files);
        input.click();
    };


    return (
        <div className="dashboard-page">
            <div className="page-header-row">
                <h1 className="page-title">KYC Verification</h1>
            </div>

            {loading ? (
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "400px",
                    width: "100%",
                    color: "#64748b"
                }}>
                    <FiClock
                        className="icon-spin"
                        style={{
                            fontSize: "42px",
                            marginBottom: "16px",
                            color: "#3b82f6"
                        }}
                    />
                    <p style={{ fontSize: "16px", fontWeight: "500" }}>Loading verification status...</p>
                </div>
            ) : (
                <div className="kyc-container">

                    {/* Header Status */}
                    <div className="kyc-header-block">
                        <div className="kyc-title-row">
                            <h2>Account Verification</h2>
                            <span className={`status-badge-kyc ${overallStatus}`}>
                                {(overallStatus === 'under_review') && <FiClock />}
                                {(overallStatus === 'rejected') && <FiAlertCircle />}
                                {(overallStatus === 'verified' || overallStatus === 'approved' || overallStatus === 'completed') && <FiCheckCircle />}
                                {getStatusLabel(overallStatus)}
                            </span>
                        </div>

                        {/* Dynamic Banner */}
                        <div className={`kyc-banner ${overallStatus}`}>
                            <div className="banner-icon">
                                {getStatusIcon(overallStatus)}
                            </div>
                            <div className="banner-content">
                                {overallStatus === 'pending' && (
                                    <>
                                        <h3>Complete Your KYC Verification</h3>
                                        <p>Please upload all required documents to verify your account. Once submitted, our team will review your documents within 24-48 hours.</p>
                                    </>
                                )}
                                {overallStatus === 'under_review' && (
                                    <>
                                        <h3>Your documents are under review</h3>
                                        <p>Our verification team is currently reviewing your submitted documents. This process usually takes 24-48 hours. We'll notify you once your account is verified.</p>
                                        {submissionDate && <span className="banner-timestamp">Submitted on {submissionDate}</span>}
                                    </>
                                )}
                                {overallStatus === 'rejected' && (
                                    <>
                                        <h3>Action Required: Verification Failed</h3>
                                        <p>Some of your documents were rejected. Please check the specific sections below for feedback and re-upload valid documents.</p>
                                    </>
                                )}
                                {(overallStatus === 'verified' || overallStatus === 'approved' || overallStatus === 'completed') && (
                                    <>
                                        <h3>Verification Successful!</h3>
                                        <p>Your account has been fully verified. You can now access all provider features and start accepting bookings.</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Document Accordion List */}
                    <div className="kyc-documents-list">
                        {documents.map((doc) => (
                            <div key={doc.id} className={`kyc-doc-card ${doc.status === 'rejected' ? 'rejected-border' : ''}`}>
                                <div
                                    className="kyc-doc-header"
                                    onClick={() => toggleSection(doc.id)}
                                >
                                    <div className="doc-header-left">
                                        <div className="status-icon-wrapper">
                                            {getStatusIcon(doc.status)}
                                        </div>
                                        <div>
                                            <h4 className="doc-title">{doc.title}</h4>
                                            <span className={`doc-status-text ${doc.status}`}>
                                                {getStatusLabel(doc.status)}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="accordion-toggle">
                                        {expandedSection === doc.id ? <FiChevronUp /> : <FiChevronDown />}
                                    </button>
                                </div>

                                {expandedSection === doc.id && (
                                    <div className="kyc-doc-body">
                                        <p className="doc-description">{doc.description}</p>
                                        {doc.status === 'rejected' && (
                                            <div className="rejection-feedback">
                                                <FiAlertCircle />
                                                <strong>Reason for rejection:</strong> {doc.feedback}
                                            </div>
                                        )}

                                        {/* File Preview */}
                                        {doc.files.length > 0 && (
                                            <div className="uploaded-files-list">
                                                {doc.files.map((file, idx) => (
                                                    <div key={idx} className="file-item">
                                                        <div className="file-icon"><FiFileText /></div>
                                                        <div className="file-info">
                                                            <span className="file-name">{file.name}</span>
                                                            <span className="file-meta">{file.size} • Uploaded {file.date}</span>
                                                        </div>
                                                        <button className="view-file-btn"><FiEye /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Document Requirements and Upload Area - Show for all documents */}
                                        <div
                                            className="upload-area-kyc"
                                            onClick={() => handleClick(doc.id)}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, doc.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <FiUploadCloud />
                                            <span>Click to upload or drag and drop</span>
                                            <small>JPG, PNG or PDF (max 5MB)</small>
                                        </div>

                                        <div className="doc-requirements">
                                            <h5>Document Requirements:</h5>
                                            <ul>
                                                {doc.requirements.map((req, i) => (
                                                    <li key={i}><FiCheckCircle /> {req}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer Info */}
                    <div className="kyc-footer-info">
                        <div className="info-icon"><FiInfo /></div>
                        <div className="info-text">
                            <h4>Why do we need this?</h4>
                            <p>KYC (Know Your Customer) verification helps us maintain trust and security on our platform. It ensures all service providers are verified professionals, protecting both clients and providers.</p>
                            <div className="footer-links">
                                <a href="#">Verification FAQ</a>
                                <a href="#">Privacy Policy</a>
                                <a href="#">Contact Support</a>
                            </div>
                        </div>
                    </div>

                </div>

            )}

            {/* Upload Notification Dialog */}
            {uploadNotification.show && (
                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "white",
                    padding: "32px 48px",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                    zIndex: 10000,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                    minWidth: "280px"
                }}>
                    {uploadNotification.type === "loading" ? (
                        <FiUploadCloud style={{
                            fontSize: "48px",
                            color: "#3b82f6",
                            animation: "pulse 1.5s ease-in-out infinite"
                        }} />
                    ) : (
                        <div style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                            backgroundColor: "#10b981",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <FiCheckCircle style={{
                                fontSize: "36px",
                                color: "white",
                                fontWeight: "bold"
                            }} />
                        </div>
                    )}
                    <p style={{
                        margin: 0,
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "#1f2937"
                    }}>
                        {uploadNotification.message}
                    </p>
                </div>
            )}

            {/* Custom Modal */}
            {modal.show && (
                <div className="modal-overlay">
                    <div className="provider-modal-content" style={{ maxWidth: "400px", padding: "32px", textAlign: "center" }}>
                        <div style={{
                            width: "64px",
                            height: "64px",
                            backgroundColor: modal.type === 'error' ? "#fef2f2" : "#dbeafe",
                            color: modal.type === 'error' ? "#ef4444" : "#2563eb",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px"
                        }}>
                            {modal.type === 'error' ? <FiAlertCircle size={32} /> : <FiInfo size={32} />}
                        </div>
                        <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "12px", color: "#1e293b" }}>{modal.title}</h2>
                        <p style={{ color: "#64748b", marginBottom: "32px", lineHeight: "1.6" }}>
                            {modal.message}
                        </p>
                        <button
                            className="primary-btn"
                            style={{ width: "100%", padding: "12px" }}
                            onClick={() => setModal({ ...modal, show: false })}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}

            {/* Add keyframe animation for pulse */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.1); }
                }
                .icon-spin {
                    animation: spin 2s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ProviderKYC;
