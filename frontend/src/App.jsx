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
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function AppContent() {
  return (
    <ItemsProvider>
      <NotesProvider>
        <AppRoutes />
      </NotesProvider>
    </ItemsProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
