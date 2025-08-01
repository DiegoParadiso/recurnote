import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const ItemsContext = createContext();

export const ItemsProvider = ({ children }) => {
  const [itemsByDate, setItemsByDate] = useState({});

  // Cargar desde localStorage al iniciar
  useEffect(() => {
    const stored = localStorage.getItem('itemsByDate');
    if (stored) {
      try {
        setItemsByDate(JSON.parse(stored));
      } catch (error) {
        localStorage.removeItem('itemsByDate');
      }
    }
  }, []);

  // Ref para manejar el timeout del debounce
  const saveTimeoutRef = useRef(null);

  // Guardar en localStorage cuando cambia itemsByDate, con debounce
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem('itemsByDate', JSON.stringify(itemsByDate));
    }, 300); // Espera 300ms antes de guardar

    // Limpieza para evitar fugas de memoria si se desmonta el componente
    return () => clearTimeout(saveTimeoutRef.current);
  }, [itemsByDate]);

  return (
    <ItemsContext.Provider value={{ itemsByDate, setItemsByDate }}>
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = () => useContext(ItemsContext);
