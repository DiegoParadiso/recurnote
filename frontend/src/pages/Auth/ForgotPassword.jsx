import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BottomToast from '@components/common/BottomToast.jsx';
import EmptyLogo from '@components/common/EmptyLogo.jsx';
import Loader from '@components/common/Loader.jsx';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import useIsMobile from '@hooks/useIsMobile';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const isSmallScreen = useIsMobile();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

  const validateEmail = (val) => {
    if (!val.trim()) return t('auth.emailRequired');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return t('auth.emailInvalid');
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const err = validateEmail(email);
    setFieldError(err);
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    setError('');
    setToast('');
    try {
      const res = await fetch(`${API_URL}/api/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Error');
      }
      setToast(t('forgot.sentInfo'));
      setEmail('');
    } catch (err) {
      setError(t('forgot.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (submitted) {
      setFieldError(validateEmail(e.target.value));
    }
  };

  return (
    <div className="auth-container" style={{ position: 'relative', overflow: 'hidden' }}>
      {loading && <Loader size={120} fullScreen={true} />}

      <EmptyLogo circleSize="500px" isSmallScreen={isSmallScreen} />

      <div
        className="auth-box"
        style={{
          position: 'relative',
          zIndex: 'var(--z-base)',
          maxWidth: '450px',
          width: '100%',
          margin: '0 auto',
          filter: loading ? 'blur(4px)' : 'none',
          pointerEvents: loading ? 'none' : 'auto',
          transition: 'filter 0.3s ease'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <p style={{ color: 'var(--color-muted)', marginTop: '8px', fontSize: '14px' }}>{t('forgot.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none', transition: 'var(--transition-colors)' }} />
              <input
                type="email"
                name="email"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={handleChange}
                required
                style={{ width: '100%', paddingLeft: '44px' }}
                className={submitted && fieldError ? 'error' : ''}
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600 }}
          >
            <Send size={18} />
            {t('forgot.sendCta')}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '16px', textAlign: 'center' }}>
          <Link
            to="/login"
            style={{
              color: 'var(--color-muted)',
              fontSize: '13px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
            {t('forgot.backToLogin')}
          </Link>
        </div>
      </div>

      <BottomToast
        message={toast || error}
        onClose={() => { setToast(''); setError(''); }}
        duration={5000}
        type={error ? 'error' : 'success'}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
