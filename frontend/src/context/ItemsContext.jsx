import { useEffect, useState, createContext, useContext } from 'react';

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
        console.error("Error al parsear itemsByDate desde localStorage:", error);
        localStorage.removeItem('itemsByDate'); // por si estaba corrupto
      }
    }
  }, []);

  // Guardar en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem('itemsByDate', JSON.stringify(itemsByDate));
  }, [itemsByDate]);

  return (
    <ItemsContext.Provider value={{ itemsByDate, setItemsByDate }}>
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = () => useContext(ItemsContext);
