import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import '@styles/legal.css';
import EmptyLogo from '@components/common/EmptyLogo.jsx';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/index.js';

export default function Terms() {
  const { t } = useTranslation();
  const isSmallScreen = window.innerWidth < 768;
  const dateStr = new Date().toLocaleDateString(i18n.language || 'en');

  return (
    <div className="legal-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <EmptyLogo circleSize="500px" isSmallScreen={isSmallScreen} />
      
      <div className="legal-content" style={{ position: 'relative', zIndex: 'var(--z-base)' }}>
        <div className="legal-header">
          <div style={{
            width: '64px',
            height: '64px',
            background: 'var(--color-highlight)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            transition: 'var(--transition-colors)'
          }}>
            <FileText style={{ width: '32px', height: '32px', color: 'var(--color-neutral)' }} />
          </div>
          
          <h1>{t('legal.terms.title')}</h1>
          <p className="legal-date">{t('legal.terms.lastUpdated')}: {dateStr}</p>
        </div>

        <div className="legal-body">
          <section>
            <h2>1. {t('legal.terms.acceptance.title')}</h2>
            <p>{t('legal.terms.acceptance.body')}</p>
          </section>

          <section>
            <h2>2. {t('legal.terms.service.title')}</h2>
            <p>{t('legal.terms.service.body')}</p>
          </section>

          <section>
            <h2>3. {t('legal.terms.account.title')}</h2>
            <p>{t('legal.terms.account.body')}</p>
          </section>

          <section>
            <h2>4. {t('legal.terms.acceptableUse.title')}</h2>
            <p>{t('legal.terms.acceptableUse.body')}</p>
            <ul>
              <li>{t('legal.terms.acceptableUse.items.0')}</li>
              <li>{t('legal.terms.acceptableUse.items.1')}</li>
              <li>{t('legal.terms.acceptableUse.items.2')}</li>
              <li>{t('legal.terms.acceptableUse.items.3')}</li>
            </ul>
          </section>

          <section>
            <h2>5. {t('legal.terms.privacy.title')}</h2>
            <p>{t('legal.terms.privacy.body')}</p>
          </section>

          <section>
            <h2>6. {t('legal.terms.ip.title')}</h2>
            <p>{t('legal.terms.ip.body')}</p>
          </section>

          <section>
            <h2>7. {t('legal.terms.liability.title')}</h2>
            <p>{t('legal.terms.liability.body')}</p>
          </section>

          <section>
            <h2>8. {t('legal.terms.changes.title')}</h2>
            <p>{t('legal.terms.changes.body')}</p>
          </section>

          <section>
            <h2>9. {t('legal.terms.termination.title')}</h2>
            <p>{t('legal.terms.termination.body')}</p>
          </section>

          <section>
            <h2>10. {t('legal.terms.governingLaw.title')}</h2>
            <p>{t('legal.terms.governingLaw.body')}</p>
          </section>

          <section>
            <h2>11. {t('legal.terms.contact.title')}</h2>
            <p>{t('legal.terms.contact.body')}</p>
          </section>
        </div>

        <div className="legal-footer">
          <Link 
            to="/register" 
            className="back-button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ArrowLeft size={18} />
            {t('legal.terms.backToRegister')}
          </Link>
        </div>
      </div>
    </div>
  );
}