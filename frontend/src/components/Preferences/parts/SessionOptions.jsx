import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function SessionOptions() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="session-container">
      {user ? (
        <>
          <div className="session-info">
            <User size={22} style={{ marginRight: 8, flexShrink: 0 }} />
            <span className="session-info-name">
              {t('session.greet')}{' '}
              {user.name || user.email || t('session.user')}
            </span>
            <button
              className="session-logout-icon"
              onClick={() => logout()}
              title={t('session.logout')}
              aria-label={t('session.logout')}
            >
              <LogOut size={20} />
            </button>
          </div>
        </>
      ) : (
        <>
          <button className="session-button" onClick={() => navigate('/login')}>
            {t('session.login')}
          </button>
          <button className="session-button register" onClick={() => navigate('/register')}>
            {t('session.register')}
          </button>
        </>
      )}
    </div>
  );
}


