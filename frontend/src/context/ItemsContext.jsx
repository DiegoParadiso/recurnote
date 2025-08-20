import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import BottomToast from '../components/common/BottomToast';

const ItemsContext = createContext();

export const ItemsProvider = ({ children }) => {
  const { user, token, loading: authLoading } = useAuth();
  const [itemsByDate, setItemsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingOperations, setPendingOperations] = useState(new Set());
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorToast, setErrorToast] = useState('');
  const retryTimeoutRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Función para cargar items del localStorage cuando no hay usuario
  const loadLocalItems = useCallback(() => {
    try {
      const localItems = localStorage.getItem('localItems');
      if (localItems) {
        const parsed = JSON.parse(localItems);
        // Verificar que los items tengan la estructura correcta
        if (parsed && typeof parsed === 'object') {
          setItemsByDate(parsed);
        } else {
          setItemsByDate({});
        }
      } else {
        setItemsByDate({});
      }
          } catch (error) {
        setItemsByDate({});
      }
  }, []);

  // Función para guardar items en localStorage
  const saveLocalItems = useCallback((items) => {
    try {
      localStorage.setItem('localItems', JSON.stringify(items));
    } catch (error) {
      // Error silencioso al guardar items locales
    }
  }, []);

  function expandItem(raw) {
    // item_data puede venir como string JSON desde el backend
    let itemData = raw.item_data;
    if (typeof itemData === 'string') {
      try { itemData = JSON.parse(itemData); } catch { itemData = {}; }
    }
    const merged = { ...raw, ...(itemData || {}) };
    const angle = Number(merged.angle ?? 0);
    const distance = Number(merged.distance ?? 120);
    const width = Number(merged.width ?? (merged.label === 'Tarea' ? 200 : 150));
    const height = Number(merged.height ?? (merged.label === 'Tarea' ? 120 : 80));
    return {
      ...merged,
      angle: Number.isFinite(angle) ? angle : 0,
      distance: Number.isFinite(distance) ? distance : 120,
      width: Number.isFinite(width) ? width : (merged.label === 'Tarea' ? 200 : 150),
      height: Number.isFinite(height) ? height : (merged.label === 'Tarea' ? 120 : 80),
    };
  }

  // Función para cargar items
  const loadItems = useCallback(async (isRetry = false) => {
    if (!user || !token) {
      // Usuario no autenticado - cargar items locales
      loadLocalItems();
      setLoading(false);
      return;
    }

    try {
      if (!isRetry) {
        setLoading(true);
      }
      setError(null);
      
      const response = await fetch(`${API_URL}/api/items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar items');
      }
      
      const data = await response.json();
      const expanded = data
        .map(expandItem)
        .filter(item => !!item.label && item.date);

      const grouped = expanded.reduce((acc, item) => {
        const dateKey = item.date;
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(item);
        return acc;
      }, {});
      
      setItemsByDate(grouped);
      setRetryCount(0); // Reset retry count on success
      setIsRetrying(false);
    } catch (err) {
      setError(err.message);
      
      // Solo intentar reintento automático si no es un reintento manual
      if (!isRetry && user && token) {
        scheduleRetry();
      }
    } finally {
      setLoading(false);
    }
  }, [user, token, API_URL, loadLocalItems]);

  // Función para programar reintento automático
  const scheduleRetry = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    const maxRetries = 5;
            if (retryCount >= maxRetries) {
          setIsRetrying(false);
          return;
        }

    setIsRetrying(true);
    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Delay exponencial, máximo 30 segundos
    
    retryTimeoutRef.current = setTimeout(() => {
      setRetryCount(prev => prev + 1);
      loadItems(true); // Marcar como reintento
    }, delay);
  }, [retryCount, loadItems]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Cargar items cuando cambie la autenticación
  useEffect(() => {
    if (!authLoading) {
      loadItems();
    }
  }, [user, token, authLoading, loadItems]);

  // Función para recargar items manualmente
  const refreshItems = () => {
    setRetryCount(0);
    setIsRetrying(false);
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    loadItems();
  };

  // Función para calcular el estado de sincronización
  const getSyncStatus = useCallback(() => {
    // Si hay operaciones pendientes, está sincronizando
    if (pendingOperations.size > 0) {
      return 'syncing';
    }
    
    // Si hay items con _pending: true, está sincronizando
    const hasPendingItems = Object.values(itemsByDate).some(items => 
      items.some(item => item._pending === true)
    );
    
    if (hasPendingItems) {
      return 'syncing';
    }
    
    // Si está cargando, está sincronizando
    if (loading) {
      return 'syncing';
    }
    
    // Todo está sincronizado
    return 'synced';
  }, [pendingOperations, itemsByDate, loading]);

  async function addItem(item) {
    const { date, x, y, rotation, rotation_enabled, label, ...rest } = item;

    const itemData = { ...rest };
    if (label === 'Tarea') {
      if (!Array.isArray(itemData.content)) itemData.content = [''];
      if (!Array.isArray(itemData.checked)) itemData.checked = [false];
    }

    if (user && token) {
      // Usuario autenticado - guardar en servidor
      const placeholder = {
        id: `tmp_${Math.random().toString(36).slice(2)}`,
        date,
        x,
        y,
        rotation: rotation ?? 0,
        rotation_enabled: rotation_enabled ?? true,
        item_data: { label, ...itemData },
        label,
        ...itemData,
        _pending: true,
      };

      // Registrar operación pendiente
      const operationId = `add_${placeholder.id}`;
      setPendingOperations(prev => new Set([...prev, operationId]));

      setItemsByDate(prev => ({
        ...prev,
        [date]: [...(prev[date] || []), placeholder],
      }));

      const payload = {
        date,
        x,
        y,
        rotation: rotation ?? 0,
        rotation_enabled: rotation_enabled ?? true,
        item_data: { label, ...itemData },
      };

      try {
        const res = await fetch(`${API_URL}/api/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Error creando item');
        }
        const saved = await res.json();
        const expanded = expandItem(saved);

        setItemsByDate(prev => ({
          ...prev,
          [date]: (prev[date] || []).map(i => i.id === placeholder.id ? expanded : i)
        }));
        
        // Remover operación pendiente
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(operationId);
          return newSet;
        });
        
        return expanded;
      } catch (e) {
        setItemsByDate(prev => ({
          ...prev,
          [date]: (prev[date] || []).filter(i => i.id !== placeholder.id)
        }));
        
        // Remover operación pendiente en caso de error
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(operationId);
          return newSet;
        });
        
        throw e;
      }
    } else {
      // Usuario no autenticado - verificar límite local
      const totalLocalItems = Object.values(itemsByDate).reduce((acc, arr) => acc + (arr?.length || 0), 0);
      const maxLocalItems = 5;
      
      if (totalLocalItems >= maxLocalItems) {
        throw new Error(`Límite alcanzado. Solo puedes tener ${maxLocalItems} items en modo local.`);
      }

      // Usuario no autenticado - guardar localmente
      const newItem = {
        id: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        date,
        x,
        y,
        rotation: rotation ?? 0,
        rotation_enabled: rotation_enabled ?? true,
        label,
        ...itemData,
        _local: true,
        createdAt: new Date().toISOString(),
      };

      setItemsByDate(prev => {
        const newState = {
          ...prev,
          [date]: [...(prev[date] || []), newItem],
        };
        // Guardar en localStorage
        saveLocalItems(newState);
        return newState;
      });

      return newItem;
    }
  }

  async function updateItem(id, changes) {
    const { date, x, y, rotation, rotation_enabled, ...itemData } = changes;
    
    // Actualizar estado visual inmediatamente para ambos casos
    setItemsByDate(prev => {
      const newState = { ...prev };
      for (const dateKey in newState) {
        newState[dateKey] = newState[dateKey].map(i => i.id === id ? { ...i, ...changes } : i);
      }
      
      // Si es modo local, guardar en localStorage
      if (!user || !token) {
        saveLocalItems(newState);
      }
      
      return newState;
    });
    
    if (user && token) {
      // Usuario autenticado - actualizar en servidor
      const operationId = `update_${id}`;
      setPendingOperations(prev => new Set([...prev, operationId]));
      
      // Asegurar que enviamos item_data como objeto
      const payload = {
        ...(date !== undefined ? { date } : {}),
        ...(x !== undefined ? { x } : {}),
        ...(y !== undefined ? { y } : {}),
        ...(rotation !== undefined ? { rotation } : {}),
        ...(rotation_enabled !== undefined ? { rotation_enabled } : {}),
        ...(Object.keys(itemData).length ? { item_data: { ...itemData } } : {})
      };
      
      try {
        const response = await fetch(`${API_URL}/api/items/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        
        // Solo lanzar error si hay un problema real de red o servidor
        if (!response.ok) {
                  // Si el item no existe (404), no es un error crítico
        if (response.status === 404) {
          // Item no encontrado, no es un error crítico
        } else {
          throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
        }
        
        // Remover operación pendiente
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(operationId);
          return newSet;
        });
      } catch (error) {
        // Remover operación pendiente en caso de error
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(operationId);
          return newSet;
        });
        
        // Solo lanzar error si es un problema real de red
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
          throw error;
        }
        
        // Para otros errores, no hacer nada
      }
    }
    // Si es modo local, no hacer nada más - ya se guardó en localStorage
  }

  async function deleteItem(id) {
    // Actualizar estado visual inmediatamente para ambos casos
    setItemsByDate(prev => {
      const newState = {};
      for (const date in prev) {
        newState[date] = prev[date].filter(i => i.id !== id);
      }
      
      // Si es modo local, guardar en localStorage
      if (!user || !token) {
        saveLocalItems(newState);
      }
      
      return newState;
    });
    
    if (user && token) {
      // Usuario autenticado - eliminar del servidor
      const operationId = `delete_${id}`;
      setPendingOperations(prev => new Set([...prev, operationId]));
      
      try {
        const response = await fetch(`${API_URL}/api/items/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Solo lanzar error si hay un problema real de red o servidor
        if (!response.ok) {
                  // Si el item no existe (404) o ya fue eliminado, no es un error crítico
        if (response.status === 404) {
          // Item no encontrado o ya eliminado, no es un error crítico
        } else {
          throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
        }
        
        // Remover operación pendiente
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(operationId);
          return newSet;
        });
      } catch (error) {
        // Remover operación pendiente en caso de error
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(operationId);
          return newSet;
        });
        
        // Solo lanzar error si es un problema real de red
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
          throw error;
        }
        
        // Para otros errores, no hacer nada
      }
    }
    // Si es modo local, no hacer nada más - ya se guardó en localStorage
  }

  return (
    <>
      <ItemsContext.Provider value={{ 
        itemsByDate, 
        setItemsByDate, 
        addItem, 
        updateItem, 
        deleteItem, 
        loading, 
        error, 
        refreshItems,
        syncStatus: getSyncStatus(),
        isRetrying,
        retryCount,
        errorToast,
        setErrorToast
      }}>
        {children}
      </ItemsContext.Provider>
      
      <BottomToast 
        message={errorToast} 
        onClose={() => setErrorToast('')} 
        duration={5000}
      />
    </>
  );
};

export const useItems = () => useContext(ItemsContext);
