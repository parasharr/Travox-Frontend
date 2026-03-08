import React from 'react';
import { FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
import './CustomDialog.css';
import { useLanguage } from '../../LanguageContext';

const CustomDialog = ({ isOpen, type = 'info', title, message, onClose }) => {
    const { t } = useLanguage();
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FiCheckCircle />;
            case 'error':
                return <FiXCircle />;
            case 'info':
            default:
                return <FiInfo />;
        }
    };

    const getDefaultTitle = () => {
        switch (type) {
            case 'success': return t('dialog_success');
            case 'error': return t('dialog_error');
            default: return t('dialog_info');
        }
    };

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div className="dialog-card" onClick={(e) => e.stopPropagation()}>
                <div className={`dialog-icon ${type}`}>
                    {getIcon()}
                </div>
                <h2>{title || getDefaultTitle()}</h2>
                <p>{message}</p>
                <button className={`dialog-button ${type}`} onClick={onClose}>
                    {t('dialog_ok')}
                </button>
            </div>
        </div>
    );
};

export default CustomDialog;

