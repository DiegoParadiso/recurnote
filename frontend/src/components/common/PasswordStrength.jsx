import React from 'react';
import '../../styles/components/password-strength.css';

const PasswordStrength = ({ password }) => {
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };
    
    score = Object.values(checks).filter(Boolean).length;
    
    if (score <= 2) return { score, label: 'Débil', color: '#dc3545' }; // Rojo
    if (score <= 3) return { score, label: 'Regular', color: '#fd7e14' }; // Naranja
    if (score <= 4) return { score, label: 'Buena', color: '#495057' }; // Gris oscuro
    return { score, label: 'Excelente', color: '#28a745' }; // Verde oscuro con buen contraste
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="password-strength">
      <div className="strength-bar">
        <div 
          className="strength-fill" 
          style={{ 
            width: `${(strength.score / 5) * 100}%`,
            backgroundColor: strength.color
          }}
        />
      </div>
      <div className="strength-label" style={{ color: strength.color }}>
        {strength.label}
      </div>
      <div className="strength-requirements">
        <div className={`requirement ${password.length >= 8 ? 'met' : ''}`}>
          ✓ Mínimo 8 caracteres
        </div>
        <div className={`requirement ${/[a-z]/.test(password) ? 'met' : ''}`}>
          ✓ Una minúscula
        </div>
        <div className={`requirement ${/[A-Z]/.test(password) ? 'met' : ''}`}>
          ✓ Una mayúscula
        </div>
        <div className={`requirement ${/\d/.test(password) ? 'met' : ''}`}>
          ✓ Un número
        </div>
        <div className={`requirement ${/[@$!%*?&]/.test(password) ? 'met' : ''}`}>
          ✓ Un carácter especial (@$!%*?&)
        </div>
      </div>
    </div>
  );
};

export default PasswordStrength;
