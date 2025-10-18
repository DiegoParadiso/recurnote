import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '@pages/Home';
import Login from '@pages/Auth/Login';
import Register from '@pages/Auth/Register';
import VerifyEmail from '@pages/Auth/VerifyEmail';
import Terms from '@pages/Legal/Terms';
import Privacy from '@pages/Legal/Privacy';
import React, { useEffect } from 'react';
import { useItems } from '@context/ItemsContext';
import i18n from './i18n/index.js';
import { ItemsProvider } from '@context/ItemsContext';
import { ThemeProvider } from '@context/ThemeContext';
import { NotesProvider } from '@context/NotesContext';
import { AuthProvider } from '@context/AuthContext';
import PrivateRoute from './PrivateRoute';

function AppRoutes() {
  return (
    <Routes>
      {/* Ruta pública para Home */}
      <Route path="/" element={<Home />} />

      {/* Rutas de autenticación */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Rutas legales */}
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />

      {/* Rutas privadas, por ejemplo un dashboard, perfil, etc */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
          </PrivateRoute>
        }
      />

      {/* Ruta catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function GlobalSyncExitListener() {
  const { syncStatus } = useItems();
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (syncStatus === 'syncing') {
        const warning = i18n.t('onExitSyncWarn');
        e.preventDefault();
        e.returnValue = warning;
        return warning;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [syncStatus]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ItemsProvider>
          <NotesProvider>
            <GlobalSyncExitListener />
            <AppRoutes />
          </NotesProvider>
        </ItemsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
