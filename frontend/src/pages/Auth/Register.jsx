import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import '../../styles/auth.css';
import EmptyLogo from '../../components/common/EmptyLogo.jsx';
import PasswordStrength from '../../components/common/PasswordStrength.jsx';
import BottomToast from '../../components/common/BottomToast.jsx';

export default function Register() {
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
        if (!value.trim()) return 'El nombre es requerido';
        if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
        if (value.trim().length > 50) return 'El nombre no puede tener más de 50 caracteres';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) {
          return 'El nombre solo puede contener letras y espacios';
        }
        return '';

      case 'email':
        if (!value.trim()) return 'El email es requerido';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'El email debe tener un formato válido';
        }
        if (value.length > 100) return 'El email no puede tener más de 100 caracteres';
        return '';

      case 'password':
        if (!value) return 'La contraseña es requerida';
        if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
        if (value.length > 128) return 'La contraseña no puede tener más de 128 caracteres';
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) {
          return 'La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial';
        }
        return '';

      case 'confirmPassword':
        if (!value) return 'Confirma tu contraseña';
        if (value !== formData.password) return 'Las contraseñas no coinciden';
        return '';

      case 'acceptTerms':
        if (!value) return 'Debes aceptar los términos y condiciones';
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
        setErrors({ general: err.message || 'Error en el registro' });
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
        <h2>Crear cuenta</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Nombre */}
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Nombre completo"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
              className={errors.name ? 'error' : ''}
              required
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              className={errors.name ? 'error' : ''}
              required
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Contraseña"
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
            {errors.password && <span className="error-message">{errors.password}</span>}
            
            {/* Indicador de fortaleza de contraseña */}
            {formData.password && <PasswordStrength password={formData.password} />}
          </div>

          {/* Confirmar contraseña */}
          <div className="form-group">
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirmar contraseña"
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
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
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
                Acepto los{' '}
                <Link to="/terms" className="link-terms">
                  términos y condiciones
                </Link>
                {' '}y la{' '}
                <Link to="/privacy" className="link-terms">
                  política de privacidad
                </Link>
              </span>
            </label>
            {errors.acceptTerms && <span className="error-message">{errors.acceptTerms}</span>}
          </div>

          {/* Error general */}
          {errors.general && (
            <div className="error-message general-error">{errors.general}</div>
          )}

          {/* Botón de envío */}
          <button 
            type="submit" 
            disabled={loading || !isFormValid()}
            className="submit-button"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="auth-footer">
          <p>¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link></p>
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
