import React from 'react';
import { useTranslation } from 'react-i18next';
import '@styles/components/password-strength.css';

const PasswordStrength = ({ password }) => {
  const { t } = useTranslation();

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };

    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length;

    if (score <= 1) return { score, label: t('auth.pwStrength.weak'), color: '#dc3545' };
    if (score === 2) return { score, label: t('auth.pwStrength.fair'), color: '#fd7e14' };
    if (score === 3) return { score, label: t('auth.pwStrength.good'), color: '#495057' };
    return { score, label: t('auth.pwStrength.excellent'), color: '#28a745' };
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="password-strength">
      <div className="strength-bar">
        <div
          className="strength-fill"
          style={{
            width: `${(strength.score / 4) * 100}%`,
            backgroundColor: strength.color
          }}
        />
      </div>
      <div className="strength-label" style={{ color: strength.color }}>
        {strength.label}
      </div>
      <div className="strength-requirements">
        <div className={`requirement ${password.length >= 8 ? 'met' : ''}`}>
          {t('auth.pwReqs.length')}
        </div>
        <div className={`requirement ${/[a-z]/.test(password) ? 'met' : ''}`}>
          {t('auth.pwReqs.lowercase')}
        </div>
        <div className={`requirement ${/[A-Z]/.test(password) ? 'met' : ''}`}>
          {t('auth.pwReqs.uppercase')}
        </div>
        <div className={`requirement ${/\d/.test(password) ? 'met' : ''}`}>
          {t('auth.pwReqs.number')}
        </div>
      </div>
    </div>
  );
};

export default PasswordStrength;
