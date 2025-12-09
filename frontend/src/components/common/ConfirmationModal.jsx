import React from 'react';
import { useTranslation } from 'react-i18next';
import '@styles/components/common/ConfirmationModal.css';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    isDangerous = false,
}) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div
            className="confirmation-modal-overlay"
            onClick={onClose}
        >
            <div
                className="confirmation-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="confirmation-modal-title">
                    {title || t('alerts.confirmAction')}
                </h3>
                <p className="confirmation-modal-message">
                    {message}
                </p>
                <div className="confirmation-modal-actions">
                    <button
                        onClick={onClose}
                        className="confirmation-modal-btn cancel"
                    >
                        {cancelText || t('common.cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`confirmation-modal-btn confirm ${isDangerous ? 'dangerous' : ''}`}
                    >
                        {confirmText || t('common.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
}
