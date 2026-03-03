import { Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, Suspense, lazy } from 'react';
import { useItems } from '@context/ItemsContext';
import i18n from './i18n/index.js';
import { ItemsProvider } from '@context/ItemsContext';
import { ThemeProvider } from '@context/ThemeContext';
import { NotesProvider } from '@context/NotesContext';
import { AuthProvider } from '@context/AuthContext';
import PrivateRoute from './PrivateRoute';
import Loader from '@components/common/Loader';

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
const PricingPage = lazy(() => import('@pages/Premium/PricingPage'));

function AppRoutes() {
  return (
    <Suspense fallback={<Loader fullScreen={true} />}>
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

        {/* Ruta de pricing */}
        <Route
          path="/pricing"
          element={
            <PrivateRoute>
              <PricingPage />
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
            {/* Global SVG filter for Liquid Glass backdrop-filter */}
            <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
              <defs>
                <filter id="frosted" primitiveUnits="objectBoundingBox">
                  <feImage href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAABiMSURBVHgB7Z1bkBXVnca/c87p091Nd3NtGoEGBBEQJIiggCBGRCWOUYlGTarmIdGajJlkzEsmyUMqySSTSh6S2spMMpVM1ZiqSapSk9RkMpOMmozjJS9GUBQFBBqQq1waugU53X1O96kLp3f/vu6/z6W7T5/Tl3P6/6te0bv36tVnn3W+tda/1l4LAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT+D/ARZLBglzgr0AAAAASUVORK5CYII=" x="0" y="0" width="1" height="1" result="map" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation="0.02" result="blur" />
                  <feDisplacementMap in="blur" in2="map" scale="1.2" xChannelSelector="R" yChannelSelector="G" />
                </filter>
              </defs>
            </svg>
            <AppRoutes />
          </NotesProvider>
        </ItemsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
