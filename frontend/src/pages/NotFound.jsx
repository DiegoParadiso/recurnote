import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
    <div
      className="min-h-screen w-screen flex flex-col items-center justify-center p-6"
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
        overflow: 'hidden'
      }}
    >
      <div className="flex flex-col items-center justify-center text-center max-w-md w-full"
        style={{
          background: 'var(--color-bg)',
          padding: '2.5rem 2rem',
          borderRadius: '20px',
          border: '1px solid color-mix(in oklab, var(--color-text-primary) 10%, transparent)',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.07), 0 4px 12px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          zIndex: 'var(--z-base)'
        }}>
        <img
          src={isDark ? '/assets/error-2.png' : '/assets/error.png'}
          alt="404 Error"
          className="h-[14rem] object-contain mb-6 opacity-90"
          aria-hidden
        />

        <div className="flex flex-col gap-3 mb-6 w-full">
          <p style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--color-highlight)',
            margin: '0 0 0.2rem'
          }}>
            Error 404
          </p>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              fontFamily: "'Roboto Slab', serif",
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              margin: 0
            }}
          >
            {t('notFound.title', 'Página no encontrada')}
          </h1>
          <p
            style={{
              fontSize: '0.85rem',
              color: 'color-mix(in oklab, var(--color-text-primary) 55%, transparent)',
              lineHeight: 1.5,
              margin: '0.25rem 0 0'
            }}
          >
            {t('notFound.message', 'Lo sentimos, la página que buscas no existe o ha sido movida.')}
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="submit-button"
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          {t('notFound.backHome', 'Volver al inicio')}
        </button>
      </div>
    </div>
  );
}

