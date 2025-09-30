import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import '../../styles/auth.css';
import EmptyLogo from '../../components/common/EmptyLogo.jsx';
import PasswordStrength from '../../components/common/PasswordStrength.jsx';
import BottomToast from '../../components/common/BottomToast.jsx';
import { useTranslation } from 'react-i18next';

export default function Register() {
  const { t } = useTranslation();
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const isSmallScreen = window.innerWidth < 768;

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  // Estados de validación
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validaciones en tiempo real
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return t('auth.nameRequired');
        if (value.trim().length < 2) return t('auth.nameMin');
        if (value.trim().length > 50) return t('auth.nameMax');
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) {
          return t('auth.nameLetters');
        }
        return '';

      case 'email':
        if (!value.trim()) return t('auth.emailRequired');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return t('auth.emailInvalid');
        }
        if (value.length > 100) return t('auth.emailMax');
        return '';

      case 'password':
        if (!value) return t('auth.passwordRequired');
        if (value.length < 8) return t('auth.passwordMin');
        if (value.length > 128) return t('auth.passwordMax');
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) {
          return t('auth.passwordStrength');
        }
        return '';

      case 'confirmPassword':
        if (!value) return t('auth.confirmPasswordRequired');
        if (value !== formData.password) return t('auth.passwordMismatch');
        return '';

      case 'acceptTerms':
        if (!value) return t('auth.termsRequired');
        return '';

      default:
        return '';
    }
  };

  // Manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Validar campo cuando se modifica
    if (touched[name]) {
      const error = validateField(name, fieldValue);
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
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      acceptTerms: true
    });

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password,
        formData.confirmPassword,
        formData.acceptTerms
      );
      
      // Mostrar mensaje de éxito y redirigir
      navigate('/login', { 
        state: { 
          message: 'Registro exitoso. Revisa tu email para verificar tu cuenta.' 
        } 
      });
    } catch (err) {
      // Manejar errores del servidor
      if (err.errors && Array.isArray(err.errors)) {
        const serverErrors = {};
        err.errors.forEach(errorMsg => {
          // Mapear errores del servidor a campos específicos
          if (errorMsg.includes('nombre')) serverErrors.name = errorMsg;
          else if (errorMsg.includes('email')) serverErrors.email = errorMsg;
          else if (errorMsg.includes('contraseña')) serverErrors.password = errorMsg;
          else if (errorMsg.includes('términos')) serverErrors.acceptTerms = errorMsg;
          else serverErrors.general = errorMsg;
        });
        setErrors(serverErrors);
      } else {
        // Intentar mapear mensajes comunes
        const msg = (err.message || '').toLowerCase();
        let i18nKey = 'auth.registerError';
        if (msg.includes('invalid') || msg.includes('exists') || msg.includes('existe')) {
          i18nKey = 'auth.emailInvalid';
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
    const fieldsFilled = Object.values(formData).every(value => 
      typeof value === 'boolean' ? value : value.trim() !== ''
    );
    
    // Verificar que no haya errores activos
    const noActiveErrors = Object.values(errors).every(error => !error || error === '');
    
    return fieldsFilled && noActiveErrors;
  };

  return (
    <div className="auth-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <EmptyLogo circleSize="500px" isSmallScreen={isSmallScreen} />

      <div className="auth-box" style={{ position: 'relative', zIndex: 'var(--z-base)' }}>
        <h2>{t('auth.registerTitle')}</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Nombre */}
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder={t('auth.namePlaceholder')}
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
              className={errors.name ? 'error' : ''}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              className={errors.name ? 'error' : ''}
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
            
            {/* Indicador de fortaleza de contraseña */}
            {formData.password && <PasswordStrength password={formData.password} />}
          </div>

          {/* Confirmar contraseña */}
          <div className="form-group">
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder={t('auth.confirmPasswordPlaceholder')}
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
                className={errors.confirmPassword ? 'error' : ''}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Términos y condiciones */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                onBlur={() => handleBlur('acceptTerms')}
                className={errors.acceptTerms ? 'error' : ''}
              />
              <span className="checkbox-text">
                {t('auth.accept')}{' '}
                <Link to="/terms" className="link-terms">
                  {t('auth.terms')}
                </Link>
                {' '}{t('auth.and')}{' '}
                <Link to="/privacy" className="link-terms">
                  {t('auth.privacy')}
                </Link>
              </span>
            </label>
            {errors.acceptTerms && <span className="error-message">{errors.acceptTerms}</span>}
          </div>

          {/* Error general se muestra solo en BottomToast */}

          {/* Botón de envío */}
          <button 
            type="submit" 
            disabled={loading || !isFormValid()}
            className="submit-button"
          >
            {loading ? t('auth.creating') : t('auth.registerCta')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {t('auth.haveAccount')}{' '}
            <Link to="/login">{t('auth.loginLink')}</Link>
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
