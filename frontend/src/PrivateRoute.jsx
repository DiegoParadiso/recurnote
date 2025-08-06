import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Cargando...</div>; 
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}
