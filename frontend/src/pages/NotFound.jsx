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
      className="min-h-screen w-screen flex flex-col items-center justify-center px-4"
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
      }}
    >
      <div className="flex flex-col items-center justify-center text-center gap-4 max-w-lg">
        <img
          src={isDark ? '/assets/image4.png' : '/assets/image3.png'}
          alt=""
          className="h-[20rem] w-auto max-w-full opacity-90"
          aria-hidden
        />
        
        <div className="flex flex-col gap-2">
          <h1 
            className="text-4xl pt-10 font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            404
          </h1>
          <h2 
            className="text-xl"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t('notFound.title', 'Página no encontrada')}
          </h2>
          <p 
            className="text-sm"
            style={{ color: 'var(--color-muted)' }}
          >
            {t('notFound.message', 'Lo sentimos, la página que buscas no existe')}
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 mt-4 rounded-md transition-colors"
          style={{
            backgroundColor: 'var(--color-neutral)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-2)';
            e.currentTarget.style.borderColor = 'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-neutral)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          {t('notFound.backHome', 'Volver al inicio')}
        </button>
      </div>
    </div>
  );
}

