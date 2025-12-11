import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '@styles/components/common/LinkInputModal.css';

export default function LinkInputModal({
    isOpen,
    onClose,
    onConfirm,
    initialValue = 'https://',
    title
}) {
    const { t } = useTranslation();
    const [url, setUrl] = useState(initialValue);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setUrl(initialValue);
            // Focus al abrir
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.select();
                }
            }, 50);
        }
    }, [isOpen, initialValue]);

    const handleConfirm = () => {
        onConfirm(url);
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleConfirm();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="link-input-modal-overlay"
            onClick={onClose}
        >
            <div
                className="link-input-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="link-input-modal-title">
                    {title || t('common.insertLink')}
                </h3>

                <input
                    ref={inputRef}
                    type="text"
                    className="link-input-modal-input"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="https://example.com"
                    autoComplete="off"
                />

                <div className="link-input-modal-actions">
                    <button
                        onClick={onClose}
                        className="link-input-modal-btn cancel"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="link-input-modal-btn confirm"
                    >
                        {t('common.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
}
