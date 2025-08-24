import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import BottomToast from '../components/common/BottomToast';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [errorToast, setErrorToast] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Función para inicializar la autenticación
  const initializeAuth = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      
      if (savedUser && savedToken) {
        // Verificar si el token sigue siendo válido
        const isValid = await validateToken(savedToken);
        if (isValid) {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
          // Refrescar datos del usuario
          await refreshMe();
        } else {
          // Token inválido, limpiar localStorage
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      // En caso de error, limpiar localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  // Función para validar token
  const validateToken = async (tokenToValidate) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, { 
        headers: { Authorization: `Bearer ${tokenToValidate}` } 
      });
      return res.ok;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  async function refreshMe() {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (!res.ok) return;
      const me = await res.json();
      const updatedUser = { ...(user || {}), ...me };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      return null;
    }
  }

  async function login(email, password) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error en login');
    }

    const data = await response.json();
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);

    // Marcar que se debe hacer migración después del login
    setMigrationStatus('pending');
  }

  async function register(name, email, password, confirmPassword, acceptTerms) {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword, acceptTerms }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en registro');
      }

      const data = await response.json();
      
      // No hacer login automático después del registro
      // El usuario debe verificar su email primero
      
      return data;
    } catch (error) {
      // Usar bottomtoast para mostrar errores
      setErrorToast(error.message || 'Error en el registro');
      throw error;
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    setMigrationStatus(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  // Función para marcar migración como completada
  const markMigrationComplete = useCallback((status = 'completed') => {
    setMigrationStatus(status);
  }, []);

  return (
    <>
      <AuthContext.Provider value={{ 
        user, 
        token, 
        login, 
        logout, 
        register, 
        loading, 
        refreshMe,
        migrationStatus,
        markMigrationComplete,
        errorToast,
        setErrorToast
      }}>
        {children}
      </AuthContext.Provider>
      
      <BottomToast 
        message={errorToast} 
        onClose={() => setErrorToast('')} 
        duration={5000}
      />
    </>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}