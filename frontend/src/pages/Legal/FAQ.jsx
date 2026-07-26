import React from 'react';
import LegalLayout from '@components/layout/LegalLayout/LegalLayout.jsx';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/index.js';

export default function FAQ() {
  const { t } = useTranslation();
  const dateStr = new Date().toLocaleDateString(i18n.language || 'en');
  
  // Note: the items array in JSON cannot be directly mapped without returning objects if using returnObjects,
  // but react-i18next handles returnObjects: true.
  const faqItems = t('legal.faq.items', { returnObjects: true }) || [];

  return (
    <LegalLayout>
      <div className="legal-content">
        <div className="legal-header">
          <h1>{t('legal.faq.title') || 'Preguntas Frecuentes'}</h1>
          <p className="legal-date">{t('legal.faq.lastUpdated')}: {dateStr}</p>
        </div>

        <div className="legal-body" style={{ columnCount: 1 }}>
          {Array.isArray(faqItems) && faqItems.map((item, index) => (
            <div key={index} className="faq-item">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </LegalLayout>
  );
}
