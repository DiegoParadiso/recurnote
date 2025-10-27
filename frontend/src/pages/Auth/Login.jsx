import { useState, useContext, useRef, useEffect } from 'react';
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
      const backendUrl = getBackendUrl();
      const authUrl = `${backendUrl}/auth/github`;
      
      console.log('Abriendo ventana de autenticación GitHub:', authUrl);
      
      githubLoginWindow.current = window.open(
        authUrl, 
        'github-auth', 
        'width=500,height=700,left=100,top=100'
      );
      
      if (!githubLoginWindow.current) {
        setErrors({ general: t('auth.popupBlocked') || 'Permitir ventanas emergentes' });
        return;
      }
      
      window.addEventListener('message', handleGitHubToken, false);
    } catch (err) {
      console.error('Error abriendo GitHub OAuth:', err);
      setErrors({ general: t('auth.githubAuthError') || 'Error al iniciar sesión con GitHub' });
    }
  };

  // Login con Google
  const handleGoogleLogin = () => {
    try {
      const backendUrl = getBackendUrl();
      const authUrl = `${backendUrl}/auth/google`;
      
      console.log('Abriendo ventana de autenticación Google:', authUrl);
      
      googleLoginWindow.current = window.open(
        authUrl, 
        'google-auth', 
        'width=500,height=700,left=100,top=100'
      );
      
      if (!googleLoginWindow.current) {
        setErrors({ general: t('auth.popupBlocked') || 'Permitir ventanas emergentes' });
        return;
      }
      
      window.addEventListener('message', handleGoogleToken, false);
    } catch (err) {
      console.error('Error abriendo Google OAuth:', err);
      setErrors({ general: t('auth.googleAuthError') || 'Error al iniciar sesión con Google' });
    }
  };

  const handleGitHubToken = (event) => {
    // Verificar que el mensaje viene de nuestro backend
    const backendUrl = getBackendUrl();
    const allowedOrigins = [
      backendUrl,
      'https://recurnote.onrender.com',
      'http://localhost:5002',
      'http://localhost:5001'
    ];
    
    if (!allowedOrigins.some(origin => event.origin === origin)) {
      console.warn('Mensaje recibido de origen no confiable:', event.origin);
      return;
    }

    if (!event.data || !event.data.token) {
      console.log('Mensaje sin token recibido');
      return;
    }

    try {
      console.log('Token de GitHub recibido correctamente');
      localStorage.setItem('token', event.data.token);
      window.removeEventListener('message', handleGitHubToken);
      if (githubLoginWindow.current) {
        githubLoginWindow.current.close();
      }
      window.location.href = '/';
    } catch (err) {
      console.error('Error procesando token de GitHub:', err);
      setErrors({ general: t('auth.githubAuthError') || 'Error al procesar autenticación' });
    }
  };

  const handleGoogleToken = (event) => {
    // Verificar que el mensaje viene de nuestro backend
    const backendUrl = getBackendUrl();
    const allowedOrigins = [
      backendUrl,
      'https://recurnote.onrender.com',
      'http://localhost:5002',
      'http://localhost:5001'
    ];
    
    if (!allowedOrigins.some(origin => event.origin === origin)) {
      console.warn('Mensaje recibido de origen no confiable:', event.origin);
      return;
    }

    if (!event.data || !event.data.token) {
      console.log('Mensaje sin token recibido');
      return;
    }

    try {
      console.log('Token de Google recibido correctamente');
      localStorage.setItem('token', event.data.token);
      window.removeEventListener('message', handleGoogleToken);
      if (googleLoginWindow.current) {
        googleLoginWindow.current.close();
      }
      window.location.href = '/';
    } catch (err) {
      console.error('Error procesando token de Google:', err);
      setErrors({ general: t('auth.googleAuthError') || 'Error al procesar autenticación' });
    }
  };

  return (
    <div className="auth-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <EmptyLogo circleSize="500px" isSmallScreen={isSmallScreen} />

      <div className="auth-box" style={{ position: 'relative', zIndex: 'var(--z-base)' }}>
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

        {/* Botón de Google */}
        <button 
          type="button" 
          className="google-login"
          onClick={handleGoogleLogin}
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
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          {t('auth.loginWithGoogle')}
        </button>

        {/* Botón de GitHub */}
        <button 
          type="button" 
          className="github-login"
          onClick={handleGitHubLogin}
          style={{
            marginTop: '7px',
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
            padding: '10px 0',
            gap: '8px'
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
            {t('auth.continueWith')}
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
                color: 'var(--color-text-primary)',
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

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}