import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const LocalContext = createContext();

export const LocalProvider = ({ children }) => {
  const [localItemsByDate, setLocalItemsByDate] = useLocalStorage('localItems', {});
  const [hasShownLocalWarning, setHasShownLocalWarning] = useState(false);
  const [localToastMessage, setLocalToastMessage] = useState('');
  const [localToastDuration, setLocalToastDuration] = useState(0);

  const addLocalItem = useCallback((item) => {
    const { date, x, y, rotation = 0, rotation_enabled = true, label, ...rest } = item;

    const totalItems = Object.values(localItemsByDate).reduce((acc, arr) => acc + (arr?.length || 0), 0);
    
    if (totalItems >= 5) {
      setLocalToastMessage('Crea una cuenta para aumentar límites de items');
      setLocalToastDuration(5000);
      return null;
    }

    const newItem = {
      id: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      date,
      x,
      y,
      rotation,
      rotation_enabled,
      label,
      ...rest,
      _local: true,
      createdAt: new Date().toISOString(),
    };

    setLocalItemsByDate(prev => {
      const existingItems = prev[date] || [];
      return {
        ...prev,
        [date]: [...existingItems, newItem],
      };
    });

    if (!hasShownLocalWarning && totalItems === 0) {
      setLocalToastMessage('ATENCIÓN: Se está guardando localmente. Los datos podrían borrarse al limpiar el navegador o cambiar de dispositivo.');
      setLocalToastDuration(8000);
      setHasShownLocalWarning(true);
    }

    return newItem;
  }, [localItemsByDate, hasShownLocalWarning, setLocalItemsByDate]);

  const updateLocalItem = useCallback((id, changes) => {
    setLocalItemsByDate(prev => {
      let hasChanges = false;
      const newState = {};
      
      for (const dateKey in prev) {
        const updatedItems = prev[dateKey].map(item => {
          if (item.id === id) {
            hasChanges = true;
            return { ...item, ...changes };
          }
          return item;
        });
        
        if (hasChanges) {
          newState[dateKey] = updatedItems;
          hasChanges = false;
        } else {
          newState[dateKey] = prev[dateKey];
        }

      }
      
      return hasChanges ? newState : prev;
    });
  }, []);

  const deleteLocalItem = useCallback((id) => {
    setLocalItemsByDate(prev => {
      let hasChanges = false;
      const newState = {};
      
      for (const date in prev) {
        const filteredItems = prev[date].filter(item => item.id !== id);
        if (filteredItems.length !== prev[date].length) {
          hasChanges = true;
          newState[date] = filteredItems;
        } else {
          newState[date] = prev[date];
        }

      }
      
      return hasChanges ? newState : prev;
    });
  }, []);

  const clearLocalToast = useCallback(() => {
    setLocalToastMessage('');
    setLocalToastDuration(0);
  }, []);

  const getTotalLocalItems = useCallback(() => {
    return Object.values(localItemsByDate).reduce((acc, arr) => acc + (arr?.length || 0), 0);
  }, [localItemsByDate]);

  const migrateLocalItems = useCallback(() => {
    const allItems = [];
    for (const date in localItemsByDate) {
      allItems.push(...localItemsByDate[date]);
    }
    setLocalItemsByDate({});
    localStorage.removeItem('localItems');
    return allItems;
  }, [localItemsByDate]);

  return (
    <LocalContext.Provider value={{
      localItemsByDate,
      setLocalItemsByDate,
      addLocalItem,
      updateLocalItem,
      deleteLocalItem,
      localToastMessage,
      localToastDuration,
      clearLocalToast,
      getTotalLocalItems,
      migrateLocalItems,
      hasShownLocalWarning,
    }}>
      {children}
    </LocalContext.Provider>
  );
};

export const useLocal = () => {
  const context = useContext(LocalContext);
  if (!context) {
    throw new Error('useLocal must be used within a LocalProvider');
  }
  return context;
};

