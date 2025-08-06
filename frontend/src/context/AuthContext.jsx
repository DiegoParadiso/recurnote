// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    // Aquí iría la llamada real al backend para autenticar
    // Ejemplo simulado:
    if (email === 'test@example.com' && password === '123456') {
      const fakeUser = { id: 1, email: 'test@example.com', name: 'Usuario Demo' };
      const fakeToken = '1234567890abcdef';

      setUser(fakeUser);
      setToken(fakeToken);
      localStorage.setItem('user', JSON.stringify(fakeUser));
      localStorage.setItem('token', fakeToken);
    } else {
      throw new Error('Credenciales inválidas');
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
