import { useState, useContext, useRef } from 'react';
import { AuthContext } from '@context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
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
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('');
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
  const googleLoginWindow = useRef(null);

  const handleGitHubLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const authUrl = `${backendUrl}/auth/github`;
    githubLoginWindow.current = window.open(authUrl, '_blank', 'width=500,height=700');
    window.addEventListener('message', handleGitHubToken, false);
  };

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const authUrl = `${backendUrl}/auth/google`;
    googleLoginWindow.current = window.open(authUrl, '_blank', 'width=500,height=700');
    window.addEventListener('message', handleGoogleToken, false);
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

  const handleGoogleToken = (event) => {
    if (!event.data || !event.data.token) return;
    try {
      localStorage.setItem('token', event.data.token);
      window.removeEventListener('message', handleGoogleToken);
      if (googleLoginWindow.current) googleLoginWindow.current.close();
      window.location.href = '/';
    } catch {
      setErrors(prev => ({ ...prev, general: t('auth.googleAuthError') }));
    }
  };

  return (
    <div className="auth-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <EmptyLogo circleSize="500px" isSmallScreen={isSmallScreen} />

      <div className="auth-box" style={{ position: 'relative', zIndex: 'var(--z-base)' }}>
        {/* Header con icono */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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
            <LogIn style={{ width: '32px', height: '32px', color: 'var(--color-neutral)' }} />
          </div>
          <h2>{t('auth.loginTitle')}</h2>
        </div>

        {/* Botón de Email */}
        <button 
          type="button" 
          className="gmail-login"
          onClick={handleGoogleLogin}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            border: '2px solid var(--color-border)',
            borderRadius: '10px',
            background: 'var(--color-neutral)',
            color: 'var(--color-text-primary)',
            fontSize: '15px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'var(--transition-all)',
            gap: '8px',
            padding: '10px 0'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = 'var(--color-highlight)';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = 'var(--color-border)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 48 48" 
            width="20" 
            height="20"
          >
            <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z"></path>
            <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z"></path>
            <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"></polygon>
            <path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z"></path>
            <path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0 C43.076,8,45,9.924,45,12.298z"></path>
          </svg>
          {t('auth.loginWithGmail')}
        </button>
        
        {/* Botón de Google */}
        <button 
          type="button" 
          className="google-login"
          onClick={handleGoogleLogin}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            border: '2px solid var(--color-border)',
            borderRadius: '10px',
            background: 'var(--color-neutral)',
            color: 'var(--color-text-primary)',
            fontSize: '15px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'var(--transition-all)',
            gap: '8px',
            padding: '10px 0',
            marginTop: '10px'
          }}
        >
          <svg viewBox="0 0 24 24" width={20} height={20}>
            <path fill="#ea4335" d="M12 11.9v3.9h5.4c-.2 1.2-.9 2.2-1.9 2.9l3 2.3C20.9 20 22 16.6 22 12c0-.8-.1-1.6-.2-2.4H12z"/>
            <path fill="#34a853" d="M6.2 14.4c-.6-1.1-.6-2.4 0-3.5L3.3 8.6C1.4 11 1.4 13.6 3.3 16l2.9-1.6z"/>
            <path fill="#fbbc04" d="M12 6.6c1.6 0 3 .6 4.1 1.7l3-3C17.8 2.9 15.1 2 12 2 8.2 2 4.9 4 3.3 7.3l2.9 1.7C8.8 7.1 10.3 6.6 12 6.6z"/>
            <path fill="#4285f4" d="M22 12c0-.7-.1-1.3-.2-1.9H12v3.6h5.4c-.2 1-.9 1.9-1.9 2.6l3 2.3C20.9 17.9 22 15.1 22 12z"/>
          </svg>
          {t('auth.loginWithGoogle')}
        </button>

        {/* Botón de GitHub */}
        <button 
          type="button" 
          className="github-login"
          onClick={handleGitHubLogin}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            border: '2px solid var(--color-border)',
            borderRadius: '10px',
            background: 'var(--color-neutral)',
            color: 'var(--color-text-primary)',
            fontSize: '15px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'var(--transition-all)',
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = 'var(--color-highlight)';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = 'var(--color-border)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <svg viewBox="0 0 24 24" width={20} height={20}>
            <path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.112.793-.262.793-.582 0-.288-.01-1.048-.015-2.057-3.338.726-4.042-1.606-4.042-1.606-.546-1.385-1.333-1.754-1.333-1.754-1.09-.745.083-.729.083-.729 1.204.085 1.838 1.236 1.838 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.304.76-1.605-2.665-.304-5.466-1.332-5.466-5.932 0-1.31.468-2.381 1.236-3.22-.124-.303-.535-1.527.117-3.183 0 0 1.01-.323 3.3 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.288-1.553 3.296-1.23 3.296-1.23.653 1.656.243 2.88.12 3.183.77.839 1.235 1.91 1.235 3.22 0 4.61-2.803 5.625-5.474 5.922.43.37.814 1.096.814 2.21 0 1.595-.015 2.88-.015 3.273 0 .322.192.698.8.58C20.565 21.796 24 17.298 24 12c0-6.63-5.373-12-12-12z"></path>
          </svg>
          {t('auth.loginWithGitHub')}
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '24px 0',
          gap: '12px'
        }}>
          <div style={{
            flex: 1,
            height: '1px',
            background: 'var(--color-border)',
            transition: 'var(--transition-colors)'
          }} />
          <span style={{
            color: 'var(--color-muted)',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'var(--transition-colors)'
          }}>
            O continúa con
          </span>
          <div style={{
            flex: 1,
            height: '1px',
            background: 'var(--color-border)',
            transition: 'var(--transition-colors)'
          }} />
        </div>

        {/* Mensaje de éxito */}
        {successMessage && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '20px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--color-success)',
            borderRadius: '8px',
            color: 'var(--color-success)',
            fontSize: '14px',
            fontWeight: '500',
            textAlign: 'center',
            transition: 'var(--transition-all)'
          }}>
            ✓ {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <div style={{ position: 'relative' }}>
              <Mail 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-muted)',
                  pointerEvents: 'none',
                  transition: 'var(--transition-colors)'
                }}
              />
              <input 
                type="email" 
                name="email" 
                placeholder={t('auth.emailPlaceholder')}
                value={formData.email} 
                onChange={handleChange} 
                onBlur={() => handleBlur('email')}
                className={errors.email ? 'error' : ''}
                style={{
                  width: '100%',
                  paddingLeft: '44px'
                }}
                required 
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <div className="password-input-container" style={{ position: 'relative' }}>
              <Lock 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-muted)',
                  pointerEvents: 'none',
                  zIndex: 1,
                  transition: 'var(--transition-colors)'
                }}
              />
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password"
                placeholder={t('auth.passwordPlaceholder')} 
                value={formData.password}
                onChange={handleChange} 
                onBlur={() => handleBlur('password')}
                className={errors.password ? 'error' : ''}
                style={{
                  paddingLeft: '44px'
                }}
                required 
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  right: '12px'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* Botón de submit */}
          <button 
            type="submit" 
            disabled={loading || !isFormValid()} 
            className="submit-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: '600'
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTopColor: 'currentColor',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }} />
                {t('auth.loggingIn')}
              </>
            ) : (
              <>
                <LogIn size={18} />
                {t('auth.loginCta')}
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer" style={{ marginTop: '24px' }}>
          <p style={{
            color: 'var(--color-muted)',
            fontSize: '14px',
            textAlign: 'center',
            marginBottom: '12px',
            transition: 'var(--transition-colors)'
          }}>
            {t('auth.noAccount')}{' '}
            <Link 
              to="/register"
              style={{
                color: 'var(--color-highlight)',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'var(--transition-colors)'
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              {t('auth.registerLink')}
            </Link>
          </p>
          <p style={{ textAlign: 'center' }}>
            <Link 
              to="/forgot-password"
              style={{
                color: 'var(--color-muted)',
                fontSize: '13px',
                textDecoration: 'none',
                transition: 'var(--transition-colors)'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = 'var(--color-text-primary)';
                e.target.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'var(--color-muted)';
                e.target.style.textDecoration = 'none';
              }}
            >
              {t('auth.forgotPassword')}
            </Link>
          </p>
        </div>
      </div>

      <BottomToast 
        message={errors.general || ''} 
        onClose={() => setErrors(prev => ({ ...prev, general: '' }))} 
        duration={5000} 
        type="error" 
      />

      {/* Agregar keyframes para la animación de carga */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}