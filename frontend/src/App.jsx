import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import { ItemsProvider } from './context/ItemsContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotesProvider } from './context/NotesContext';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './PrivateRoute';
function AppRoutes() {
  return (
    <Routes>
      {/* Ruta pública para Home */}
      <Route path="/" element={<Home />} />

      {/* Rutas de autenticación */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

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

function AppContent() {
  return (
    <NotesProvider>
      <AppRoutes />
    </NotesProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ItemsProvider>
          <AppContent />
        </ItemsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
