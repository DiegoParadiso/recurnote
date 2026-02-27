import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import '@styles/legal.css';
import EmptyLogo from '@components/common/EmptyLogo.jsx';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/index.js';

export default function Privacy() {
  const { t } = useTranslation();
  const isSmallScreen = window.innerWidth < 768;
  const dateStr = new Date().toLocaleDateString(i18n.language || 'en');

  return (
    <div className="legal-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <EmptyLogo circleSize="500px" isSmallScreen={isSmallScreen} />

      <div className="legal-content" style={{ position: 'relative', zIndex: 'var(--z-base)' }}>
        <div className="legal-header">
          {/* Icono de escudo */}
          <div className="legal-header-icon">
            <Shield size={22} />
          </div>

          <h1>{t('legal.privacy.title')}</h1>
          <p className="legal-date">{t('legal.privacy.lastUpdated')}: {dateStr}</p>
        </div>

        <div className="legal-body">
          <section>
            <h2>1. {t('legal.privacy.infoCollected.title')}</h2>
            <p>{t('legal.privacy.infoCollected.body')}</p>
            <ul>
              <li><strong>{t('legal.privacy.infoCollected.items.0.label')}</strong> {t('legal.privacy.infoCollected.items.0.value')}</li>
              <li><strong>{t('legal.privacy.infoCollected.items.1.label')}</strong> {t('legal.privacy.infoCollected.items.1.value')}</li>
              <li><strong>{t('legal.privacy.infoCollected.items.2.label')}</strong> {t('legal.privacy.infoCollected.items.2.value')}</li>
              <li><strong>{t('legal.privacy.infoCollected.items.3.label')}</strong> {t('legal.privacy.infoCollected.items.3.value')}</li>
            </ul>
          </section>

          <section>
            <h2>2. {t('legal.privacy.howWeUse.title')}</h2>
            <p>{t('legal.privacy.howWeUse.body')}</p>
            <ul>
              <li>{t('legal.privacy.howWeUse.items.0')}</li>
              <li>{t('legal.privacy.howWeUse.items.1')}</li>
              <li>{t('legal.privacy.howWeUse.items.2')}</li>
              <li>{t('legal.privacy.howWeUse.items.3')}</li>
              <li>{t('legal.privacy.howWeUse.items.4')}</li>
            </ul>
          </section>

          <section>
            <h2>3. {t('legal.privacy.sharing.title')}</h2>
            <p>{t('legal.privacy.sharing.body')}</p>
            <ul>
              <li>{t('legal.privacy.sharing.items.0')}</li>
              <li>{t('legal.privacy.sharing.items.1')}</li>
              <li>{t('legal.privacy.sharing.items.2')}</li>
              <li>{t('legal.privacy.sharing.items.3')}</li>
            </ul>
          </section>

          <section>
            <h2>4. {t('legal.privacy.dataSecurity.title')}</h2>
            <p>{t('legal.privacy.dataSecurity.body')}</p>
            <ul>
              <li>{t('legal.privacy.dataSecurity.items.0')}</li>
              <li>{t('legal.privacy.dataSecurity.items.1')}</li>
              <li>{t('legal.privacy.dataSecurity.items.2')}</li>
              <li>{t('legal.privacy.dataSecurity.items.3')}</li>
            </ul>
          </section>

          <section>
            <h2>5. {t('legal.privacy.dataStorage.title')}</h2>
            <p>{t('legal.privacy.dataStorage.body')}</p>
          </section>

          <section>
            <h2>6. {t('legal.privacy.yourRights.title')}</h2>
            <p>{t('legal.privacy.yourRights.body')}</p>
            <ul>
              <li>{t('legal.privacy.yourRights.items.0')}</li>
              <li>{t('legal.privacy.yourRights.items.1')}</li>
              <li>{t('legal.privacy.yourRights.items.2')}</li>
              <li>{t('legal.privacy.yourRights.items.3')}</li>
              <li>{t('legal.privacy.yourRights.items.4')}</li>
            </ul>
          </section>

          <section>
            <h2>7. {t('legal.privacy.cookies.title')}</h2>
            <p>{t('legal.privacy.cookies.body')}</p>
            <ul>
              <li>{t('legal.privacy.cookies.items.0')}</li>
              <li>{t('legal.privacy.cookies.items.1')}</li>
              <li>{t('legal.privacy.cookies.items.2')}</li>
              <li>{t('legal.privacy.cookies.items.3')}</li>
            </ul>
          </section>

          <section>
            <h2>8. {t('legal.privacy.minors.title')}</h2>
            <p>{t('legal.privacy.minors.body')}</p>
          </section>

          <section>
            <h2>9. {t('legal.privacy.international.title')}</h2>
            <p>{t('legal.privacy.international.body')}</p>
          </section>

          <section>
            <h2>10. {t('legal.privacy.changes.title')}</h2>
            <p>{t('legal.privacy.changes.body')}</p>
          </section>

          <section>
            <h2>11. {t('legal.privacy.contact.title')}</h2>
            <p>{t('legal.privacy.contact.body')}</p>
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
            {t('legal.privacy.backToRegister')}
          </Link>
        </div>
      </div>
    </div>
  );
}