import '@styles/legal.css';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/index.js';
import LegalLayout from '@components/layout/LegalLayout/LegalLayout.jsx';

export default function Terms() {
  const { t } = useTranslation();
  const isSmallScreen = window.innerWidth < 768;
  const dateStr = new Date().toLocaleDateString(i18n.language || 'en');

  return (
    <LegalLayout>
      <div className="legal-content">
        <div className="legal-header">
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
      </div>
    </LegalLayout>
  );
}