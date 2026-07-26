import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@styles/auth.css';

export default function NotFound() {
  const { t } = useTranslation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const el = document?.documentElement;
    const check = () => setIsDark(el?.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    if (el) observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="auth-container" style={{ padding: '2rem', textAlign: 'center' }}>
      <img
        src={isDark ? '/assets/error-2.png' : '/assets/error.png'}
        alt="404 Error"
        style={{ height: '8rem', objectFit: 'contain', marginBottom: '1.5rem', opacity: 0.8 }}
        aria-hidden
      />

      <div className="auth-title-area" style={{ margin: 0 }}>
        <p className="auth-eyebrow" style={{ fontSize: '0.6rem', marginBottom: '0.4rem' }}>Error 404</p>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--color-text-primary)', margin: 0, fontFamily: "'Roboto Slab', serif", fontWeight: 700 }}>
          {t('notFound.title', 'Página no encontrada')}
        </h2>
      </div>
    </div>
  );
}
