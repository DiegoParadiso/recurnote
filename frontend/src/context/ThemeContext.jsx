import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isLightTheme, setIsLightTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme === 'light';
      }
      // Si no hay tema guardado, usar automático según la hora
      const hour = new Date().getHours();
      return hour >= 6 && hour < 18; // Día: 6 AM - 6 PM
    }
    return true; // por defecto claro
  });

  const [isAutoTheme, setIsAutoTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('autoTheme') !== 'false';
    }
    return true; // por defecto automático
  });

  // Función para obtener el tema según la hora
  const getTimeBasedTheme = () => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18; // Día: 6 AM - 6 PM
  };

  // Función para obtener el tema actual
  const getCurrentTheme = () => {
    if (isAutoTheme) {
      return getTimeBasedTheme();
    }
    return isLightTheme;
  };

  // Efecto para aplicar el tema
  useEffect(() => {
    const currentTheme = getCurrentTheme();
    
    if (currentTheme) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightTheme, isAutoTheme]);

  // Efecto para cambiar tema automáticamente según la hora
  useEffect(() => {
    if (!isAutoTheme) return;

    const updateThemeByTime = () => {
      const shouldBeLight = getTimeBasedTheme();
      if (shouldBeLight !== isLightTheme) {
        setIsLightTheme(shouldBeLight);
      }
    };

    // Actualizar inmediatamente
    updateThemeByTime();

    // Configurar un intervalo para verificar cada minuto
    const interval = setInterval(updateThemeByTime, 60000);

    return () => clearInterval(interval);
  }, [isAutoTheme, isLightTheme]);

  // Función para cambiar tema manualmente (desactiva automático)
  const setThemeManually = (isLight) => {
    setIsAutoTheme(false);
    localStorage.setItem('autoTheme', 'false');
    setIsLightTheme(isLight);
  };

  // Función para activar modo automático
  const enableAutoTheme = () => {
    setIsAutoTheme(true);
    localStorage.setItem('autoTheme', 'true');
    // Aplicar tema según la hora actual
    const timeBasedTheme = getTimeBasedTheme();
    setIsLightTheme(timeBasedTheme);
  };

  // Función para desactivar modo automático
  const disableAutoTheme = () => {
    setIsAutoTheme(false);
    localStorage.setItem('autoTheme', 'false');
    // Mantener el tema actual
  };

  return (
    <ThemeContext.Provider value={{ 
      isLightTheme, 
      setIsLightTheme: setThemeManually, 
      isAutoTheme, 
      enableAutoTheme,
      disableAutoTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personalizado para usar el contexto fácil
export function useTheme() {
  return useContext(ThemeContext);
}
