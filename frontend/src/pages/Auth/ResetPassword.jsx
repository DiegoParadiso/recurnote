import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BottomToast from '@components/common/BottomToast.jsx';
import PasswordStrength from '@components/common/PasswordStrength.jsx';
import EmptyLogo from '@components/common/EmptyLogo.jsx';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import useIsMobile from '@hooks/useIsMobile';

export default function ResetPassword() {
  const { t } = useTranslation();
  const isSmallScreen = useIsMobile();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [pwError, setPwError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

  const token = params.get('token') || '';

  useEffect(() => {
    if (!token) {
      setError(t('reset.invalidLink'));
    }
  }, [token, t]);

  const validatePassword = (pwd) => {
    if (!pwd) return t('auth.passwordRequired');
    if (pwd.length < 8) return t('auth.passwordMin');
    if (pwd.length > 128) return t('auth.passwordMax');
    // Same pattern used in Register.jsx
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!strong.test(pwd)) return t('auth.passwordStrength');
    return '';
  };

  const validateConfirm = (pwd, confirm) => {
    if (!confirm) return t('auth.confirmPasswordRequired');
    if (pwd !== confirm) return t('auth.passwordMismatch');
    return '';
  };

  useEffect(() => {
    setPwError(validatePassword(password));
    setConfirmError(validateConfirm(password, confirmPassword));
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    const pErr = validatePassword(password);
    const cErr = validateConfirm(password, confirmPassword);
    setPwError(pErr);
    setConfirmError(cErr);
    if (pErr || cErr) return;
    setLoading(true);
    setError('');
    setToast('');
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Error');
      setToast(t('reset.success'));
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      setError(err.message || t('reset.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <EmptyLogo circleSize="500px" isSmallScreen={isSmallScreen} />

      <div
        className="auth-box"
        style={{
          position: 'relative',
          zIndex: 'var(--z-base)',
          maxWidth: '420px',
          width: '100%',
          margin: '0 auto'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'var(--color-highlight)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            transition: 'var(--transition-colors)'
          }}>
            <Lock style={{ width: '28px', height: '28px', color: 'var(--color-neutral)' }} />
          </div>
          <h2>{t('reset.title')}</h2>
          <p style={{ color: 'var(--color-muted)', marginTop: '8px', fontSize: '14px' }}>{t('reset.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="password-input-container" style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none', zIndex: 1, transition: 'var(--transition-colors)' }} />
              <input
                type="password"
                name="password"
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={''}
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
            {password && <PasswordStrength password={password} />}
          </div>

          <div className="form-group">
            <div className="password-input-container" style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none', zIndex: 1, transition: 'var(--transition-colors)' }} />
              <input
                type="password"
                name="confirmPassword"
                placeholder={t('auth.confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={''}
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={
              loading || !password || !confirmPassword || pwError !== '' || confirmError !== ''
            }
            className="submit-button"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600 }}
          >
            {loading ? (
              <>
                <span style={{ width: '16px', height: '16px', border: '2px solid transparent', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                {t('reset.saving')}
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                {t('reset.saveCta')}
              </>
            )}
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
