import { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '@context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import '@styles/auth.css';
import EmptyLogo from '@components/common/EmptyLogo.jsx';
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
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // Estados de validación
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Password strength logic (Length over complexity)
  const getPasswordStrength = (password) => {
    if (!password) return { percent: 0, color: 'transparent' };

    const length = password.length;

    // Checks for full complexity (Green)
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const isComplex = hasLower && hasUpper && hasNumber;

    if (length < 12) {
      // Red: under 12 characters. Progress up to 66%
      const percent = (length / 12) * 66;
      return { percent, color: '#dc3545' };
    }

    if (length >= 12 && !isComplex) {
      // Yellow: 12 chars met, but not complex. 66% progress.
      return { percent: 66, color: '#eab308' };
    }

    // Green: 12 chars + full complexity. 100% progress.
    return { percent: 100, color: '#28a745' };
  };

  const pwStrength = getPasswordStrength(formData.password);

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

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (formData.password.length >= 12) {
      setShowConfirmPassword(true);
      // Removed focus to keep label centered
    }
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) nextRef.current.focus();
    }
  };

  const handlePasswordKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (formData.password.length >= 12) {
        setShowConfirmPassword(true);
        // Removed focus to keep label centered
      }
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if confirm password isn't visible
    if (!showConfirmPassword) {
      if (formData.password.length >= 12) {
        setShowConfirmPassword(true);
      }
      return;
    }

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

      <div className="auth-box" style={{
        position: 'relative',
        zIndex: 'var(--z-base)',
        filter: loading ? 'blur(4px)' : 'none',
        pointerEvents: loading ? 'none' : 'auto',
        transition: 'filter 0.3s ease',
        padding: '32px 30px',
        minHeight: '315px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}

        <div className="auth-tabs" style={{ margin: '-32px -30px 38px -30px' }}>
          <button type="button" className="auth-tab" onClick={() => navigate('/login')}>
            {t('auth.loginLink') || 'Iniciar sesión'}
          </button>
          <button type="button" className="auth-tab active">
            {t('auth.registerLink') || 'Registrarse'}
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '6px' }}>
          {/* Nombre */}
          <div className="floating-group">
            <input
              type="text"
              name="name"
              placeholder=" "
              value={formData.name}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, emailRef)}
              className={`floating-input ${formData.name ? 'has-value' : ''} ${submitted && errors.name ? 'error' : ''}`}
              required
            />
            <label className="floating-label">
              <span>Nombre</span>
            </label>
            <div className="floating-bar"></div>
          </div>

          {/* Email */}
          <div className="floating-group">
            <input
              type="email"
              name="email"
              ref={emailRef}
              placeholder=" "
              value={formData.email}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, passwordRef)}
              className={`floating-input ${formData.email ? 'has-value' : ''} ${submitted && errors.email ? 'error' : ''}`}
              required
            />
            <label className="floating-label">
              <span>{t('auth.emailPlaceholder') || 'Email'}</span>
            </label>
            <div className="floating-bar"></div>
          </div>

          {/* Contraseña / Confirmar Contraseña (Mismo Contenedor) */}
          {!showConfirmPassword ? (
            <div className="floating-group">
              <input
                type="text"
                name="password"
                ref={passwordRef}
                placeholder=" "
                value={formData.password}
                onChange={handleChange}
                onKeyDown={handlePasswordKeyDown}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className={`floating-input copyable-password ${formData.password ? 'has-value' : ''} ${submitted && errors.password ? 'error' : ''}`}
                style={{
                  fontFamily: 'monospace',
                  letterSpacing: '-0.16px',
                  color: (formData.password || isPasswordFocused) ? 'transparent' : 'var(--color-text-primary)',
                  caretColor: (formData.password || isPasswordFocused) ? 'transparent' : 'auto',
                  ...(formData.password ? {
                    border: '2px solid transparent',
                    backgroundImage: `linear-gradient(var(--color-bg), var(--color-bg)), linear-gradient(to right, ${pwStrength.color} ${pwStrength.percent}%, var(--color-border) ${pwStrength.percent + 15}%)`,
                    backgroundOrigin: 'padding-box, border-box',
                    backgroundClip: 'padding-box, border-box'
                  } : {})
                }}
                required
              />
              {!(isPasswordFocused || formData.password.length > 0) && (
                <label className="floating-label">
                  <span>{t('auth.passwordPlaceholder') || 'Contraseña'}</span>
                </label>
              )}
              <div className="floating-bar"></div>

              {formData.password.length >= 12 && !showConfirmPassword && (
                <button
                  type="submit"
                  className="inline-submit-btn"
                  aria-label="Continuar"
                  onClick={handlePasswordSubmit}
                >
                  <ArrowRight size={20} />
                </button>
              )}

              {/* Dots Visual Indicator (Inside the input, left aligned) */}
              {(isPasswordFocused || formData.password.length > 0) && (
                <div style={{
                  position: 'absolute',
                  left: '19.5px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  marginTop: '2px',
                  display: 'flex',
                  gap: '3px',
                  pointerEvents: 'none',
                  maxWidth: 'calc(100% - 50px)',
                  overflow: 'hidden'
                }}>
                  {[...Array(Math.max(12, formData.password.length))].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        minWidth: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: formData.password.length > i ? 'var(--color-text-primary)' : 'var(--color-border)'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="floating-group">
              <input
                type="text"
                name="confirmPassword"
                ref={confirmPasswordRef}
                placeholder=" "
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={() => setIsConfirmPasswordFocused(true)}
                onBlur={() => setIsConfirmPasswordFocused(false)}
                className={`floating-input copyable-password ${formData.confirmPassword ? 'has-value' : ''} ${submitted && errors.confirmPassword ? 'error' : ''}`}
                style={{
                  fontFamily: 'monospace',
                  letterSpacing: '-0.16px',
                  color: (formData.confirmPassword || isConfirmPasswordFocused) ? 'transparent' : 'var(--color-text-primary)',
                  caretColor: (formData.confirmPassword || isConfirmPasswordFocused) ? 'transparent' : 'auto',
                  ...(formData.confirmPassword ? {
                    border: '2px solid transparent',
                    backgroundImage: `linear-gradient(var(--color-bg), var(--color-bg)), linear-gradient(to right, ${formData.confirmPassword === formData.password ? 'var(--color-success)' : 'var(--color-error)'} 100%, var(--color-border) 100%)`,
                    backgroundOrigin: 'padding-box, border-box',
                    backgroundClip: 'padding-box, border-box'
                  } : {})
                }}
                required
              />
              {!(isConfirmPasswordFocused || formData.confirmPassword.length > 0) && (
                <label className="floating-label">
                  <span>{t('auth.confirmPasswordPlaceholder') || 'Confirmar contraseña'}</span>
                </label>
              )}
              <div className="floating-bar"></div>

              {/* Dots Visual Indicator (Inside the input, left aligned) */}
              {(isConfirmPasswordFocused || formData.confirmPassword.length > 0) && (
                <div style={{
                  position: 'absolute',
                  left: '19.5px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  marginTop: '2px',
                  display: 'flex',
                  gap: '3px',
                  pointerEvents: 'none',
                  maxWidth: 'calc(100% - 50px)',
                  overflow: 'hidden'
                }}>
                  {[...Array(Math.max(12, formData.confirmPassword.length))].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        minWidth: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: formData.confirmPassword.length > i ? 'var(--color-text-primary)' : 'var(--color-border)'
                      }}
                    />
                  ))}
                </div>
              )}

              {formData.confirmPassword && (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-submit-btn"
                  aria-label="Registrarse"
                >
                  {loading ? <Loader size={18} /> : <ArrowRight size={18} />}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowConfirmPassword(false);
                  setFormData(prev => ({ ...prev, confirmPassword: '' }));
                }}
                style={{
                  position: 'absolute',
                  right: formData.confirmPassword ? '44px' : '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: 'var(--color-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s ease'
                }}
                aria-label="Volver a contraseña"
                title="Volver a contraseña"
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-muted)'}
              >
                <ArrowLeft size={18} />
              </button>
            </div>
          )}

          {/* Términos y condiciones */}
          <div className="form-group checkbox-group" style={{ marginTop: '32px' }}>
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
              </span>
            </label>

          </div>

        </form>
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