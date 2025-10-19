import { useState, useContext, useRef } from 'react';
import { AuthContext } from '@context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import '@styles/auth.css';
import EmptyLogo from '@components/common/EmptyLogo.jsx';
import BottomToast from '@components/common/BottomToast.jsx';
import { useTranslation } from 'react-i18next';
import useIsMobile from '@hooks/useIsMobile';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isSmallScreen = useIsMobile();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const successMessage = location.state?.message;

  // Validaciones
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value.trim()) return t('auth.emailRequired');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('auth.emailInvalid');
        return '';
      case 'password':
        if (!value) return t('auth.passwordRequired');
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, formData[name]) }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      await login(formData.email.trim(), formData.password);
      navigate('/');
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      let i18nKey = 'auth.loginError';
      if (msg.includes('invalid') || msg.includes('credencial') || msg.includes('contraseña')) i18nKey = 'auth.invalidCredentials';
      if (msg.includes('verify') || msg.includes('verific')) i18nKey = 'auth.emailNotVerified';
      setErrors({ general: t(i18nKey) });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    const fieldsFilled = Object.values(formData).every(v => v.trim() !== '');
    const noActiveErrors = Object.values(errors).every(e => !e || e === '');
    return fieldsFilled && noActiveErrors;
  };

  // Login con GitHub
  const githubLoginWindow = useRef(null);

  const handleGitHubLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const authUrl = `${backendUrl}/auth/github`;
    githubLoginWindow.current = window.open(authUrl, '_blank', 'width=500,height=700');
    window.addEventListener('message', handleGitHubToken, false);
  };

  const handleGitHubToken = (event) => {
    if (!event.data || !event.data.token) return;
    try {
      localStorage.setItem('token', event.data.token);
      window.removeEventListener('message', handleGitHubToken);
      if (githubLoginWindow.current) githubLoginWindow.current.close();
      window.location.href = '/';
    } catch {
      setErrors(prev => ({ ...prev, general: t('auth.githubAuthError') }));
    }
  };

  return (
    <div className="auth-container">
      <EmptyLogo circleSize="500px" isSmallScreen={isSmallScreen} />

      <div className="auth-box" style={{ position: 'relative', zIndex: 'var(--z-base)' }}>
        <h2>{t('auth.loginTitle')}</h2>

        <button type="button" className="github-login" onClick={handleGitHubLogin}>
          <svg viewBox="0 0 24 24" width={20} height={20} style={{ marginRight: 8 }}><path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.112.793-.262.793-.582 0-.288-.01-1.048-.015-2.057-3.338.726-4.042-1.606-4.042-1.606-.546-1.385-1.333-1.754-1.333-1.754-1.09-.745.083-.729.083-.729 1.204.085 1.838 1.236 1.838 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.304.76-1.605-2.665-.304-5.466-1.332-5.466-5.932 0-1.31.468-2.381 1.236-3.22-.124-.303-.535-1.527.117-3.183 0 0 1.01-.323 3.3 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.288-1.553 3.296-1.23 3.296-1.23.653 1.656.243 2.88.12 3.183.77.839 1.235 1.91 1.235 3.22 0 4.61-2.803 5.625-5.474 5.922.43.37.814 1.096.814 2.21 0 1.595-.015 2.88-.015 3.273 0 .322.192.698.8.58C20.565 21.796 24 17.298 24 12c0-6.63-5.373-12-12-12z"></path></svg>
          {t('auth.loginWithGitHub')}
        </button>

        {successMessage && <div className="success-message">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="email" name="email" placeholder={t('auth.emailPlaceholder')}
              value={formData.email} onChange={handleChange} onBlur={() => handleBlur('email')}
              className={errors.email ? 'error' : ''} required />
          </div>

          <div className="form-group">
            <div className="password-input-container">
              <input type={showPassword ? 'text' : 'password'} name="password"
                placeholder={t('auth.passwordPlaceholder')} value={formData.password}
                onChange={handleChange} onBlur={() => handleBlur('password')}
                className={errors.password ? 'error' : ''} required />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading || !isFormValid()} className="submit-button">
            {loading ? t('auth.loggingIn') : t('auth.loginCta')}
          </button>
        </form>

        <div className="auth-footer">
          <p>{t('auth.noAccount')} <Link to="/register">{t('auth.registerLink')}</Link></p>
          <p><Link to="/forgot-password">{t('auth.forgotPassword')}</Link></p>
        </div>
      </div>

      <BottomToast message={errors.general || ''} onClose={() => setErrors(prev => ({ ...prev, general: '' }))} duration={5000} type="error" />
    </div>
  );
}
