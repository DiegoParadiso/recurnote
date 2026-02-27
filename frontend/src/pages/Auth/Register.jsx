import { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '@context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import '@styles/auth.css';
import EmptyLogo from '@components/common/EmptyLogo.jsx';
import PasswordStrength from '@components/common/PasswordStrength.jsx';
import BottomToast from '@components/common/BottomToast.jsx';
import Loader from '@components/common/Loader.jsx';
import { useTranslation } from 'react-i18next';

export default function Register() {
  const { t } = useTranslation();
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const isSmallScreen = window.innerWidth < 768;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  // Estados de verificación
  const [step, setStep] = useState('form'); // 'form', 'verification'
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const [verificationCode, setVerificationCode] = useState('');
  const [tempUserId, setTempUserId] = useState(null);
  const inputRefs = useRef([]);

  // Estados de validación
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Enfocar el primer input cuando se muestra la verificación
  useEffect(() => {
    if (step === 'verification') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

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
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+/.test(value)) {
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

    // Validar campo en tiempo real solo después de intentar enviar
    if (submitted) {
      const error = validateField(name, fieldValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  // Ya no validamos en blur; solo al enviar o si ya se envió

  // Validar todo el formulario
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return newErrors;
  };

  // Iniciar temporizador para reenvío
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Marcar que se intentó enviar
    setSubmitted(true);

    // Validar formulario
    const newErrors = validateForm();
    const hasErrors = Object.keys(newErrors).length > 0;
    if (hasErrors) {
      const firstErrMsg =
        newErrors.name || newErrors.email || newErrors.password || newErrors.confirmPassword || newErrors.acceptTerms || Object.values(newErrors)[0];
      setErrors(prev => ({ ...prev, general: firstErrMsg }));
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          acceptTerms: formData.acceptTerms
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar ID temporal y cambiar a paso de verificación
        setTempUserId(data.userId);

        // Si el email se activó automáticamente (modo desarrollo)
        if (data.autoVerified) {
          navigate('/login', {
            state: {
              message: 'Cuenta creada y activada automáticamente. Ya puedes iniciar sesión.'
            }
          });
        } else {
          // Modo normal: ir a verificación
          setStep('verification');
          startResendTimer();
        }
      } else {
        // Manejar errores del servidor
        if (data.errors && Array.isArray(data.errors)) {
          const serverErrors = {};
          data.errors.forEach(errorMsg => {
            if (errorMsg.includes('nombre')) serverErrors.name = errorMsg;
            else if (errorMsg.includes('email')) serverErrors.email = errorMsg;
            else if (errorMsg.includes('contraseña')) serverErrors.password = errorMsg;
            else if (errorMsg.includes('términos')) serverErrors.acceptTerms = errorMsg;
            else serverErrors.general = errorMsg;
          });
          // Siempre mostrar algo en el toast aunque el error sea de un campo específico
          if (!serverErrors.general) {
            serverErrors.general = data.message || Object.values(serverErrors)[0] || t('auth.registerError');
          }
          setErrors(serverErrors);
        } else {
          setErrors({ general: data.message || t('auth.registerError') });
        }
      }
    } catch (err) {
      setErrors({ general: t('auth.registerError') });
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en los dígitos del código
  const handleCodeChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...codeDigits];
    newCode[index] = value;
    setCodeDigits(newCode);
    setVerificationCode(newCode.join(''));

    // Si hay valor, pasar al siguiente campo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Manejar teclas en los inputs del código
  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!codeDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Manejar pegado de código
  const handleCodePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCodeDigits(newCode);
      setVerificationCode(pastedData);
      inputRefs.current[5]?.focus();
    }
  };

  // Verificar código
  const handleVerifyCode = async (e) => {
    e.preventDefault();

    if (!verificationCode || verificationCode.length !== 6) {
      setErrors({ verification: 'Ingresa un código válido de 6 dígitos' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: tempUserId,
          code: verificationCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Verificación exitosa
        navigate('/login', {
          state: {
            message: 'Cuenta verificada exitosamente. Ya puedes iniciar sesión.'
          }
        });
      } else {
        setErrors({ verification: data.message || 'Código inválido' });
      }
    } catch (err) {
      setErrors({ verification: 'Error de conexión. Intenta nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código
  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/api/auth/resend-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: tempUserId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setErrors({ verification: '' });
        startResendTimer();
      } else {
        setErrors({ verification: data.message || 'Error al reenviar código' });
      }
    } catch (err) {
      setErrors({ verification: 'Error de conexión. Intenta nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  // Verificar si el formulario es válido
  const isFormValid = () => {
    const fieldsFilled = Object.values(formData).every(value =>
      typeof value === 'boolean' ? value : value.trim() !== ''
    );
    const noActiveErrors = Object.values(errors).every(error => !error || error === '');
    return fieldsFilled && noActiveErrors;
  };

  // Verificar si el código está completo
  const isCodeComplete = codeDigits.every(digit => digit !== '');

  // Vista de verificación de código
  if (step === 'verification') {
    return (
      <div className="auth-container" style={{ position: 'relative', overflow: 'hidden' }}>
        {loading && <Loader size={145} fullScreen={true} />}

        <EmptyLogo circleSize="500px" isSmallScreen={isSmallScreen} />
        <div className="auth-box" style={{ position: 'relative', zIndex: 'var(--z-base)', filter: loading ? 'blur(4px)' : 'none', pointerEvents: loading ? 'none' : 'auto', transition: 'filter 0.3s ease' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
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
              <svg
                style={{ width: '32px', height: '32px', color: 'var(--color-neutral)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2>Verifica tu email</h2>
            <p className="verification-description">
              Hemos enviado un código de 6 dígitos a <strong>{formData.email}</strong>
            </p>
          </div>

          {/* 6 campos para el código */}
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            marginBottom: '8px'
          }}>
            {codeDigits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(index, e)}
                onPaste={index === 0 ? handleCodePaste : undefined}
                style={{
                  width: '52px',
                  height: '60px',
                  textAlign: 'center',
                  fontSize: '28px',
                  fontWeight: '700',
                  border: '2px solid',
                  borderColor: digit ? 'var(--color-highlight)' : 'var(--color-border)',
                  borderRadius: '12px',
                  backgroundColor: digit ? 'var(--bg-highlight)' : 'var(--color-neutral)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                  transition: 'var(--transition-all)',
                  cursor: 'text'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-highlight)';
                  e.target.style.boxShadow = '0 0 0 3px var(--color-neutral-dark)';
                }}
                onBlur={(e) => {
                  if (!digit) {
                    e.target.style.borderColor = 'var(--color-border)';
                  }
                  e.target.style.boxShadow = 'none';
                }}
              />
            ))}
          </div>

          {errors.verification && (
            <span className="error-message" style={{ display: 'block', textAlign: 'center', marginBottom: '18px' }}>
              {errors.verification}
            </span>
          )}

          <button
            onClick={handleVerifyCode}
            disabled={loading || !isCodeComplete}
            className="submit-button mx-auto block"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            Verificar código
          </button>

          <div className="auth-footer" style={{ marginTop: '20px' }}>
            <p>
              ¿No recibiste el código?{' '}
              {resendTimer > 0 ? (
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  Reenviar en {resendTimer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-muted)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Reenviar código
                </button>
              )}
            </p>
            <p style={{ marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setCodeDigits(['', '', '', '', '', '']);
                  setVerificationCode('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-muted)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                ← Volver al registro
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
      </div>
    );
  }

  // Vista del formulario de registro
  return (
    <div className="auth-container" style={{ position: 'relative', overflow: 'hidden' }}>
      {loading && <Loader size={145} fullScreen={true} />}

      <EmptyLogo circleSize="500px" isSmallScreen={isSmallScreen} />

      <div className="auth-box" style={{ position: 'relative', zIndex: 'var(--z-base)', filter: loading ? 'blur(4px)' : 'none', pointerEvents: loading ? 'none' : 'auto', transition: 'filter 0.3s ease' }}>
        {/* Header */}
        <div className="auth-title-area">
          <p className="auth-eyebrow">RecurNote</p>
          <h2>{t('auth.registerTitle')}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Nombre */}
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder={t('auth.namePlaceholder')}
              value={formData.name}
              onChange={handleChange}
              className={submitted && errors.name ? 'error' : ''}
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
              className={submitted && errors.email ? 'error' : ''}
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
                className={submitted && errors.password ? 'error' : ''}
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
                className={submitted && errors.confirmPassword ? 'error' : ''}
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
                className={submitted && errors.acceptTerms ? 'error' : ''}
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

          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={loading}
            className="submit-button"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {t('auth.registerCta')}
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