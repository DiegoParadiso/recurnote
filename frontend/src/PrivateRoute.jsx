import { useContext } from 'react';
import { AuthContext } from '@context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Loader from '@components/common/Loader';

export default function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const { t } = useTranslation();

  if (loading) {
    return <Loader className="min-h-screen" />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}
