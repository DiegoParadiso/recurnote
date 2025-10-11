import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '@pages/Home';
import Login from '@pages/Auth/Login';
import Register from '@pages/Auth/Register';
import VerifyEmail from '@pages/Auth/VerifyEmail';
import Terms from '@pages/Legal/Terms';
import Privacy from '@pages/Legal/Privacy';
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

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ItemsProvider>
          <NotesProvider>
            <AppRoutes />
          </NotesProvider>
        </ItemsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
