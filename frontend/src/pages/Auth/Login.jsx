import { useState, useContext } from 'react';
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

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Mostrar mensaje de éxito si viene del registro
  const successMessage = location.state?.message;

  // Validaciones en tiempo real
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value.trim()) return t('auth.emailRequired');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return t('auth.emailInvalid');
        }
        return '';

      case 'password':
        if (!value) return t('auth.passwordRequired');
        return '';

      default:
        return '';
    }
  };

  // Manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar campo cuando se modifica
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  // Manejar cuando un campo pierde el foco
  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Validar todo el formulario
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    setTouched({
      email: true,
      password: true
    });

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await login(formData.email.trim(), formData.password);
      navigate('/');  // Redirige al home si login OK
    } catch (err) {
      // Manejar errores del servidor
      if (err.errors && Array.isArray(err.errors)) {
        const serverErrors = {};
        err.errors.forEach(errorMsg => {
          // Mapear errores del servidor a campos específicos
          if (errorMsg.includes('email')) serverErrors.email = errorMsg;
          else if (errorMsg.includes('contraseña')) serverErrors.password = errorMsg;
          else if (errorMsg.includes('verificada')) {
            serverErrors.general = t('auth.emailNotVerified');
            // Redirigir a página de reenvío de verificación
            navigate('/resend-verification', { 
              state: { email: formData.email.trim() } 
            });
            return;
          } else serverErrors.general = errorMsg;
        });
        setErrors(serverErrors);
      } else {
        const msg = (err.message || '').toLowerCase();
        let i18nKey = 'auth.loginError';
        if (msg.includes('invalid') || msg.includes('credencial') || msg.includes('contraseña')) {
          i18nKey = 'auth.invalidCredentials';
        }
        if (msg.includes('verify') || msg.includes('verific')) {
          i18nKey = 'auth.emailNotVerified';
        }
        setErrors({ general: t(i18nKey) });
      }
    } finally {
      setLoading(false);
    }
  };

  // Verificar si el formulario es válido
  const isFormValid = () => {
    // Verificar que todos los campos estén llenos
    const fieldsFilled = Object.values(formData).every(value => value.trim() !== '');
    
    // Verificar que no haya errores activos
    const noActiveErrors = Object.values(errors).every(error => !error || error === '');
    
    return fieldsFilled && noActiveErrors;
  };

  return (
    <div className="auth-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <EmptyLogo circleSize="500px" isSmallScreen={isSmallScreen} />

      <div className="auth-box" style={{ position: 'relative', zIndex: 'var(--z-base)' }}>
        <h2>{t('auth.loginTitle')}</h2>
        
        {/* Mensaje de éxito del registro */}
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              className={errors.email ? 'error' : ''}
              required
            />
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder={t('auth.passwordPlaceholder')}
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                className={errors.password ? 'error' : ''}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error general se muestra solo en BottomToast */}

          {/* Botón de envío */}
          <button 
            type="submit" 
            disabled={loading || !isFormValid()}
            className="submit-button"
          >
            {loading ? t('auth.loggingIn') : t('auth.loginCta')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {t('auth.noAccount')}{' '}
            <Link to="/register">{t('auth.registerLink')}</Link>
          </p>
          <p>
            <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
          </p>
        </div>
      </div>

      {/* Toast para errores */}
      <BottomToast 
        message={errors.general || ''} 
        onClose={() => setErrors(prev => ({ ...prev, general: '' }))} 
        duration={5000}
        type="error"
      />
    </div>
  );
}
