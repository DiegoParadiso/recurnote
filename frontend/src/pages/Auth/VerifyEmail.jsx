import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../../styles/auth.css';
import EmptyLogo from '../../components/common/EmptyLogo.jsx';
import BottomToast from '../../components/common/BottomToast.jsx';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSmallScreen = window.innerWidth < 768;

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Token de verificación no encontrado');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/verify-email/${token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.message || 'Error al verificar email');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Error de conexión. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleResendVerification = async () => {
    // Implementar reenvío de verificación
    navigate('/resend-verification');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="auth-container" style={{ position: 'relative', overflow: 'hidden' }}>
        <EmptyLogo circleSize="500px" isSmallScreen={isSmallScreen} />
        
        <div className="auth-box" style={{ position: 'relative', zIndex: 'var(--z-base)' }}>
          <h2>Verificando email...</h2>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Verificando tu cuenta...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <EmptyLogo circleSize="500px" isSmallScreen={isSmallScreen} />
      
      <div className="auth-box" style={{ position: 'relative', zIndex: 'var(--z-base)' }}>
        <div className={`verification-status ${status}`}>
          {status === 'success' ? (
            <>
              <div className="status-icon success">✓</div>
              <h2>¡Email verificado!</h2>
              <p className="status-message">{message}</p>
              <p className="status-description">
                Tu cuenta ha sido activada exitosamente. Ya puedes iniciar sesión y comenzar a usar RecurNote.
              </p>
              <button 
                onClick={handleGoToLogin}
                className="submit-button"
              >
                Ir al login
              </button>
            </>
          ) : (
            <>
              <div className="status-icon error">✗</div>
              <h2>Error en la verificación</h2>
              <p className="status-message">{message}</p>
              <p className="status-description">
                El enlace de verificación no es válido o ha expirado. 
                Puedes solicitar un nuevo enlace de verificación.
              </p>
              <div className="verification-actions">
                <button 
                  onClick={handleResendVerification}
                  className="submit-button secondary"
                >
                  Reenviar verificación
                </button>
                <button 
                  onClick={handleGoToLogin}
                  className="submit-button"
                >
                  Ir al login
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast para mensajes */}
      <BottomToast 
        message={message} 
        onClose={() => setMessage('')} 
        duration={5000}
        type={status === 'success' ? 'success' : 'error'}
      />
    </div>
  );
}
