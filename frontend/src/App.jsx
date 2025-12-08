import { Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, Suspense, lazy } from 'react';
import { useItems } from '@context/ItemsContext';
import i18n from './i18n/index.js';
import { ItemsProvider } from '@context/ItemsContext';
import { ThemeProvider } from '@context/ThemeContext';
import { NotesProvider } from '@context/NotesContext';
import { AuthProvider } from '@context/AuthContext';
import PrivateRoute from './PrivateRoute';

// Lazy load pages
const Home = lazy(() => import('@pages/Home'));
const Login = lazy(() => import('@pages/Auth/Login'));
const ForgotPassword = lazy(() => import('@pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@pages/Auth/ResetPassword'));
const Register = lazy(() => import('@pages/Auth/Register'));
const VerifyEmail = lazy(() => import('@pages/Auth/VerifyEmail'));
const Terms = lazy(() => import('@pages/Legal/Terms'));
const Privacy = lazy(() => import('@pages/Legal/Privacy'));
const NotFound = lazy(() => import('@pages/NotFound'));
const RequestTimeout = lazy(() => import('@pages/RequestTimeout'));
const PaymentPage = lazy(() => import('@pages/Premium/PaymentPage'));

function AppRoutes() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"></div>}>
      <Routes>
        {/* Ruta pública para Home */}
        <Route path="/" element={<Home />} />

        {/* Rutas de autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

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

        {/* Ruta de pago */}
        <Route
          path="/payment"
          element={
            <PrivateRoute>
              <PaymentPage />
            </PrivateRoute>
          }
        />

        {/* 408 Request Timeout */}
        <Route path="/408" element={<RequestTimeout />} />

        {/* Ruta catch-all - 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function GlobalSyncExitListener() {
  const { syncStatus } = useItems() || {};
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
