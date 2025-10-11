import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const { t } = useTranslation();

  if (loading) {
    return <div>{t('common.loading')}</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}
