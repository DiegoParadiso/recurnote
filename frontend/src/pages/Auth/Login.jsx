import { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '@context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Send } from 'lucide-react';
import '@styles/auth.css';
import EmptyLogo from '@components/common/EmptyLogo.jsx';
import BottomToast from '@components/common/BottomToast.jsx';
import Loader from '@components/common/Loader.jsx';
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
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'forgot'

  const successMessage = location.state?.message;

  const githubLoginWindow = useRef(null);
  const googleLoginWindow = useRef(null);

  // Obtener la URL del backend desde las variables de entorno
  const getBackendUrl = () => {
    return import.meta.env.VITE_API_URL || 'http://localhost:5002';
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      window.removeEventListener('message', handleGitHubToken);
      window.removeEventListener('message', handleGoogleToken);
      if (githubLoginWindow.current) githubLoginWindow.current.close();
      if (googleLoginWindow.current) googleLoginWindow.current.close();
    };
  }, []);

  // Validaciones
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value.trim()) return t('auth.emailRequired');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('auth.emailInvalid');
        return '';
      case 'password':
        if (mode === 'login' && !value) return t('auth.passwordRequired');
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (submitted) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const newErrors = validateForm();
    const hasErrors = Object.keys(newErrors).length > 0;
    if (hasErrors) {
      const firstErrMsg = newErrors.email || newErrors.password || Object.values(newErrors)[0];
      setErrors(prev => ({ ...prev, general: firstErrMsg }));
      return;
    }

    setLoading(true);
    setErrors({});

    if (mode === 'forgot') {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/auth/forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: formData.email.trim() }),
        });

        const data = await response.json();

        if (response.ok) {
          navigate('/', { state: { message: t('forgot.sentInfo') || 'Enlace de recuperación enviado' } });
        } else {
          setErrors({ general: data.message || t('forgot.errorGeneric') || 'Ocurrió un error' });
        }
      } catch (err) {
        setErrors({ general: t('forgot.errorGeneric') || 'Ocurrió un error' });
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      await login(formData.email.trim(), formData.password);
      navigate('/');
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      let i18nKey = 'auth.loginError';
      if (msg.includes('invalid') || msg.includes('credencial') || msg.includes('contraseña')) {
        i18nKey = 'auth.invalidCredentials';
      }
      if (msg.includes('verify') || msg.includes('verific')) {
        i18nKey = 'auth.emailNotVerified';
      }
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
  const handleGitHubLogin = () => {
    try {
      setLoading(true);
      const backendUrl = getBackendUrl();
      const authUrl = `${backendUrl}/auth/github`;

      console.log('Abriendo ventana de autenticación GitHub:', authUrl);

      githubLoginWindow.current = window.open(
        authUrl,
        'github-auth',
        'width=500,height=700,left=100,top=100'
      );

      if (!githubLoginWindow.current) {
        setLoading(false);
        setErrors({ general: t('auth.popupBlocked') || 'Permitir ventanas emergentes' });
        return;
      }

      const checkPopupClosed = setInterval(() => {
        if (githubLoginWindow.current?.closed) {
          clearInterval(checkPopupClosed);
          setLoading(false);
        }
      }, 500);

      window.addEventListener('message', handleGitHubToken, false);
    } catch (err) {
      setLoading(false);
      console.error('Error abriendo GitHub OAuth:', err);
      setErrors({ general: t('auth.githubAuthError') || 'Error al iniciar sesión con GitHub' });
    }
  };

  // Login con Google
  const handleGoogleLogin = () => {
    try {
      setLoading(true);
      const backendUrl = getBackendUrl();
      const authUrl = `${backendUrl}/auth/google`;

      console.log('Abriendo ventana de autenticación Google:', authUrl);

      googleLoginWindow.current = window.open(
        authUrl,
        'google-auth',
        'width=500,height=700,left=100,top=100'
      );

      if (!googleLoginWindow.current) {
        setLoading(false);
        setErrors({ general: t('auth.popupBlocked') || 'Permitir ventanas emergentes' });
        return;
      }

      const checkPopupClosed = setInterval(() => {
        if (googleLoginWindow.current?.closed) {
          clearInterval(checkPopupClosed);
          setLoading(false);
        }
      }, 500);

      window.addEventListener('message', handleGoogleToken, false);
    } catch (err) {
      setLoading(false);
      console.error('Error abriendo Google OAuth:', err);
      setErrors({ general: t('auth.googleAuthError') || 'Error al iniciar sesión con Google' });
    }
  };

  const syncInProgress = useRef(false);

  const handleGitHubToken = async (event) => {
    // Verificar que el mensaje viene de nuestro backend
    const backendUrl = getBackendUrl();
    const allowedOrigins = [
      backendUrl,
      'https://recurnote.onrender.com',
      'http://localhost:5002',
      'http://localhost:5001'
    ];

    const isAllowed = allowedOrigins.some(origin => {
      try {
        return event.origin === origin || new URL(event.origin).origin === new URL(origin).origin;
      } catch (e) {
        return event.origin === origin;
      }
    });

    if (!isAllowed) {
      console.warn('Mensaje recibido de origen no confiable:', event.origin);
      return;
    }

    if (!event.data || !event.data.token) return;
    if (syncInProgress.current) return;

    try {
      syncInProgress.current = true;
      console.log('Token de GitHub recibido, sincronizando cookies...');

      const res = await fetch(`${backendUrl}/api/auth/oauth-cookie-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: event.data.token })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Error en sync de sesión:', res.status, errorData);
        throw new Error(errorData.message || 'No se pudo sincronizar la sesión');
      }

      window.removeEventListener('message', handleGitHubToken);
      if (githubLoginWindow.current) {
        githubLoginWindow.current.close();
      }
      window.location.href = '/';
    } catch (err) {
      console.error('Error procesando token de GitHub:', err);
      setErrors({ general: err.message || t('auth.githubAuthError') || 'Error al procesar autenticación' });
      syncInProgress.current = false;
    }
  };

  const handleGoogleToken = async (event) => {
    // Verificar que el mensaje viene de nuestro backend
    const backendUrl = getBackendUrl();
    const allowedOrigins = [
      backendUrl,
      'https://recurnote.onrender.com',
      'http://localhost:5002',
      'http://localhost:5001'
    ];

    const isAllowed = allowedOrigins.some(origin => {
      try {
        return event.origin === origin || new URL(event.origin).origin === new URL(origin).origin;
      } catch (e) {
        return event.origin === origin;
      }
    });

    if (!isAllowed) {
      console.warn('Mensaje recibido de origen no confiable:', event.origin);
      return;
    }

    if (!event.data || !event.data.token) return;
    if (syncInProgress.current) return;

    try {
      syncInProgress.current = true;
      console.log('Token de Google recibido, sincronizando cookies...');

      const res = await fetch(`${backendUrl}/api/auth/oauth-cookie-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: event.data.token })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Error en sync de sesión (Google):', res.status, errorData);
        throw new Error(errorData.message || 'No se pudo sincronizar la sesión');
      }

      window.removeEventListener('message', handleGoogleToken);
      if (googleLoginWindow.current) {
        googleLoginWindow.current.close();
      }
      window.location.href = '/';
    } catch (err) {
      console.error('Error procesando token de Google:', err);
      setErrors({ general: err.message || t('auth.googleAuthError') || 'Error al procesar autenticación' });
      syncInProgress.current = false;
    }
  };

  return (
    <div className="auth-container" style={{ position: 'relative', overflow: 'hidden' }}>
      {loading && <Loader size={145} fullScreen={true} />}
      <EmptyLogo circleSize="500px" isSmallScreen={isSmallScreen} />
      <div className="auth-box" style={{
        position: 'relative',
        zIndex: 'var(--z-base)',
        filter: loading ? 'blur(4px)' : 'none',
        pointerEvents: loading ? 'none' : 'auto',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: mode === 'forgot' ? '10px 10px' : '32px 30px',
        minHeight: mode === 'login' ? '315px' : '0px',
        display: 'flex',
        flexDirection: 'column'
      }}>

        {/* Header Elements Group */}
        <div style={{
          display: 'grid',
          gridTemplateRows: mode === 'login' ? '1fr' : '0fr',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          margin: mode === 'login' ? '-32px -30px 0 -30px' : '0 -30px 0 -30px',
          opacity: mode === 'login' ? 1 : 0
        }}>
          <div style={{ overflow: 'hidden' }}>
            <div className="auth-tabs" style={{ margin: 0 }}>
              <button type="button" className="auth-tab active">
                {t('auth.loginLink') || 'Iniciar sesión'}
              </button>
              <button type="button" className="auth-tab" onClick={() => navigate('/register')}>
                {t('auth.registerLink') || 'Registrarse'}
              </button>
            </div>

            <div className="social-login" style={{ marginTop: '37px' }}>
              <button className="social-circle-btn" type="button" onClick={handleGoogleLogin} title={t('auth.loginWithGoogle')}>
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="36" height="36" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
              </button>

              <button className="social-circle-btn" type="button" onClick={handleGitHubLogin} title={t('auth.loginWithGitHub')}>
                <svg viewBox="0 0 24 24" width={36} height={36}>
                  <path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.112.793-.262.793-.582 0-.288-.01-1.048-.015-2.057-3.338.726-4.042-1.606-4.042-1.606-.546-1.385-1.333-1.754-1.333-1.754-1.09-.745.083-.729.083-.729 1.204.085 1.838 1.236 1.838 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.304.76-1.605-2.665-.304-5.466-1.332-5.466-5.932 0-1.31.468-2.381 1.236-3.22-.124-.303-.535-1.527.117-3.183 0 0 1.01-.323 3.3 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.288-1.553 3.296-1.23 3.296-1.23.653 1.656.243 2.88.12 3.183.77.839 1.235 1.91 1.235 3.22 0 4.61-2.803 5.625-5.474 5.922.43.37.814 1.096.814 2.21 0 1.595-.015 2.88-.015 3.273 0 .322.192.698.8.58C20.565 21.796 24 17.298 24 12c0-6.63-5.373-12-12-12z"></path>
                </svg>
              </button>
            </div>

            <div style={{ padding: '0 30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', margin: '15px 0', gap: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-border)', transition: 'var(--transition-colors)' }} />
                <span style={{ color: 'var(--color-muted)', fontSize: '13px', fontWeight: '400', transition: 'var(--transition-colors)' }}>
                  {t('auth.continueWith')}
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-border)', transition: 'var(--transition-colors)' }} />
              </div>
            </div>
          </div>
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
          <div className="floating-group">
            <input
              type="email"
              name="email"
              placeholder=" "
              value={formData.email}
              onChange={handleChange}
              className={`floating-input ${mode === 'forgot' ? 'has-inline-btn' : ''} ${formData.email ? 'has-value' : ''} ${submitted && errors.email ? 'error' : ''}`}
              required
            />
            <label className="floating-label">
              <span>{t('auth.emailPlaceholder') || 'Email'}</span>
            </label>
            <div className="floating-bar"></div>

            {mode === 'forgot' && formData.email && (
              <button
                type="submit"
                disabled={loading}
                className="inline-submit-btn"
                aria-label="Enviar recuperación"
              >
                {loading ? <Loader size={18} /> : <Send size={18} style={{ transform: 'translate(-1.5px, 1.5px)' }} />}
              </button>
            )}
          </div>



          {/* Password */}
          <div style={{
            display: 'grid',
            gridTemplateRows: mode === 'login' ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: mode === 'login' ? 1 : 0
          }}>
            <div style={{ overflow: 'hidden' }}>
              <div className="floating-group" style={{ marginBottom: '0', transition: 'margin 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                <input
                  type="text"
                  name="password"
                  placeholder=" "
                  value={formData.password}
                  onChange={handleChange}
                  className={`floating-input copyable-password ${formData.password ? 'has-value' : ''} ${submitted && errors.password ? 'error' : ''}`}
                  required={mode === 'login'}
                />
                <label className="floating-label">
                  <span>{t('auth.passwordPlaceholder') || 'Password'}</span>
                </label>
                <div className="floating-bar"></div>

                {formData.password && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-submit-btn"
                    aria-label="Submit login"
                  >
                    {loading ? <Loader size={18} /> : <ArrowRight size={18} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="auth-footer" style={{ marginTop: mode === 'login' ? '15px' : '-4px', marginBottom: mode === 'login' ? '0px' : '0', transition: 'margin 0.4s ease' }}>

          <p style={{ textAlign: 'center', margin: 0 }}>
            <button
              onClick={() => setMode(mode === 'login' ? 'forgot' : 'login')}
              type="button"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-muted)',
                fontSize: '13px',
                padding: '4px 8px',
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
              {mode === 'login' ? (t('auth.forgotPassword') || '¿Olvidaste tu contraseña?') : 'Ya sé mi contraseña'}
            </button>
          </p>
        </div>

      </div>

      <BottomToast
        message={errors.general || ''}
        onClose={() => setErrors(prev => ({ ...prev, general: '' }))}
        duration={5000}
        type="error"
      />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}