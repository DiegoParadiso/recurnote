import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import i18n from '../i18n/index.js';
import { useAuth } from '@context/AuthContext';
import BottomToast from '@components/common/BottomToast';

// Función debounce simple
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

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
  // Debounce por item para sincronizaciones al backend (drag/resize)
  const updateTimersRef = useRef(new Map()); // id -> timeoutId
  const updateQueueRef = useRef(new Map());  // id -> { url, payload }
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
    
    // PRESERVAR las coordenadas x, y originales si existen
    const x = Number(merged.x);
    const y = Number(merged.y);
    const angle = Number(merged.angle ?? 0);
    const distance = Number(merged.distance ?? 120);
    const width = Number(merged.width ?? (merged.label === 'Tarea' ? 200 : 150));
    const height = Number(merged.height ?? (merged.label === 'Tarea' ? 120 : 80));
    

    
    const result = {
      ...merged,
      // Solo usar x, y calculados si no existen los originales
      x: Number.isFinite(x) ? x : distance * Math.cos((angle * Math.PI) / 180),
      y: Number.isFinite(y) ? y : distance * Math.sin((angle * Math.PI) / 180),
      angle: Number.isFinite(angle) ? angle : 0,
      distance: Number.isFinite(distance) ? distance : 120,
      width: Number.isFinite(width) ? width : (merged.label === 'Tarea' ? 200 : 150),
      height: Number.isFinite(height) ? height : (merged.label === 'Tarea' ? 120 : 80),
    };
    

    
    return result;
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
        .filter(item => item && item.date) // Solo verificar que exista y tenga fecha
        .map(item => {
          // ASEGURAR que todos los items tengan label para renderizar
          if (!item.label) {
            // Intentar extraer label del item_data si existe
            if (item.item_data && item.item_data.label) {
              item.label = item.item_data.label;
            } else {
              item.label = 'Item sin nombre';
            }
          }
          return item;
                });
  
      const grouped = expanded.reduce((acc, item) => {
        const dateKey = item.date;
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(item);
        return acc;
      }, {});
      
      // Combinar con items duplicados recientes que no estén en el servidor
      const combined = { ...grouped };
      for (const dateKey in itemsByDate) {
        if (!combined[dateKey]) {
          combined[dateKey] = [];
        }
        // Agregar items duplicados recientes Y items que deben mantenerse en el estado
        const preservedItems = itemsByDate[dateKey].filter(item => 
          item._skipLoadItems || item._keepInState
        );
        combined[dateKey] = [...combined[dateKey], ...preservedItems];
      }
      setItemsByDate(combined);
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
  }, [user, token, authLoading]);

  // Debounce para loadItems - evitar múltiples ejecuciones seguidas
  const debouncedLoadItems = useCallback(
    debounce(() => {
  
      loadItems();
    }, 1000), // 1 segundo de delay
    [loadItems]
  );

  // Función para recargar items manualmente
  const refreshItems = () => {
    setRetryCount(0);
    setIsRetrying(false);
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    loadItems();
  };

  // Función para desbloquear loadItems después de duplicación


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
        throw new Error(i18n.t('alerts.localLimitReached', { max: maxLocalItems }));
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
    
    // Log para detectar cuándo se está moviendo un item
    if (x !== undefined || y !== undefined) {
  
    }
    
    // INTERCEPTAR: Si es un item recién duplicado y se está moviendo, forzar posición original
    if ((x !== undefined || y !== undefined) && !changes._forcePosition) {
      const currentItem = Object.values(itemsByDate).flat().find(i => i.id === id);
      if (currentItem && currentItem._justDuplicated) {
        // Forzar la posición original del item duplicado
        const forcedChanges = {
          ...changes,
          x: currentItem._originalX || currentItem.x,
          y: currentItem._originalY || currentItem.y,
          _forcePosition: true, // Marcar para evitar recursión
          _justDuplicated: false // Ya no es recién duplicado
        };
        return await updateItem(id, forcedChanges);
      }
    }
    
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
    
    // Evitar sincronizar con backend si el ID es temporal o local
    if (typeof id === 'string' && (id.startsWith('tmp_') || id.startsWith('local_'))) {
      return;
    }
      
    if (user && token) {
      // Usuario autenticado - actualizar en servidor con debounce por item
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

      const url = `${API_URL}/api/items/${id}`;
      // Encolar última actualización por id
      updateQueueRef.current.set(id, { url, payload });
      // Limpiar timeout previo si existe
      const prevTimeout = updateTimersRef.current.get(id);
      if (prevTimeout) {
        clearTimeout(prevTimeout);
      }
      // Programar envío consolidado
      const timeoutId = setTimeout(async () => {
        const entry = updateQueueRef.current.get(id);
        updateQueueRef.current.delete(id);
        updateTimersRef.current.delete(id);
        if (!entry) return;
        try {
          const response = await fetch(entry.url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(entry.payload)
          });

          if (!response.ok) {
            if (response.status === 404) {
              // Item no encontrado, no es crítico
            } else {
              throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
            }
          }
        } catch (error) {
          // Solo propagar errores de red
          if (error.name === 'TypeError' || (error.message && error.message.includes('fetch'))) {
            console.error('Network error on updateItem:', error);
          }
        } finally {
          // Remover operación pendiente
          setPendingOperations(prev => {
            const newSet = new Set(prev);
            newSet.delete(operationId);
            return newSet;
          });
        }
      }, 250); // debounce 250ms

      updateTimersRef.current.set(id, timeoutId);
    }
    // Si es modo local, no hacer nada más - ya se guardó en localStorage
  }

  async function duplicateItem(id) {
    try {
      // En modo local, respetar el mismo límite que addItem
      if (!user || !token) {
        const totalLocalItems = Object.values(itemsByDate).reduce((acc, arr) => acc + (arr?.length || 0), 0);
        const maxLocalItems = 5;
        if (totalLocalItems >= maxLocalItems) {
          const msg = i18n.t('alerts.localLimitReached', { max: maxLocalItems });
          setErrorToast(msg);
          throw new Error(msg);
        }
      }

      // Encontrar el item a duplicar
      let itemToDuplicate = null;
      let itemDate = null;
      
      for (const date in itemsByDate) {
        const item = itemsByDate[date].find(i => i.id === id);
        if (item) {
          itemToDuplicate = item;
          itemDate = date;
          break;
        }
      }
      
      if (!itemToDuplicate) {
        throw new Error('Item no encontrado');
      }
    
      // Crear una copia del item con nueva posición - AL LADO del original
      const offsetX = 120; // 120px a la derecha del item original
      const newX = (itemToDuplicate.x || 0) + offsetX;
      const newY = itemToDuplicate.y || 0; // Misma altura
      
      // Calcular el nuevo ángulo y distancia desde el centro del círculo
      const dx = newX;
      const dy = newY;
      const newAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const newDistance = Math.sqrt(dx * dx + dy * dy);
      
      // Crear el item duplicado
      const duplicatedItem = {
        ...itemToDuplicate,
        id: user && token ? `tmp_${Math.random().toString(36).slice(2)}` : `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        angle: newAngle,
        distance: newDistance,
        x: newX,
        y: newY,
        _pending: user && token ? true : false,
        _local: !user || !token ? true : false,
        _justDuplicated: true,
        createdAt: new Date().toISOString(),
      };
      
      // Si es modo local, agregar al estado visual inmediatamente y guardar
      if (!user || !token) {
        // Re-chequear límite con estado más reciente por seguridad
        const totalLocalItems = Object.values(itemsByDate).reduce((acc, arr) => acc + (arr?.length || 0), 0);
        const maxLocalItems = 5;
        if (totalLocalItems >= maxLocalItems) {
          setErrorToast(`Límite alcanzado. Solo puedes tener ${maxLocalItems} items en modo local.`);
          throw new Error(`Límite alcanzado. Solo puedes tener ${maxLocalItems} items en modo local.`);
        }

        setItemsByDate(prev => {
          const newState = { ...prev };
          if (!newState[itemDate]) {
            newState[itemDate] = [];
          }
          newState[itemDate] = [...newState[itemDate], duplicatedItem];
          return newState;
        });
        
        // Guardar en localStorage con el estado actualizado
        const newState = { ...itemsByDate };
        if (!newState[itemDate]) {
          newState[itemDate] = [];
        }
        newState[itemDate] = [...newState[itemDate], duplicatedItem];
        saveLocalItems(newState);
        
        return duplicatedItem;
      }
      
      // Si es modo premium, NO agregar al estado visual hasta completar sincronización
      // Solo crear el item temporal en memoria para la operación
      
      // Si es modo premium, sincronizar con el servidor
      const payload = {
        date: itemDate,
        x: newX,
        y: newY,
        rotation: itemToDuplicate.rotation || 0,
        rotation_enabled: itemToDuplicate.rotation_enabled ?? true,
        item_data: {
          label: itemToDuplicate.label,
          width: itemToDuplicate.width,
          height: itemToDuplicate.height
        }
      };
      
      // Agregar contenido específico según el tipo de item
      if (itemToDuplicate.label === 'Tarea') {
        payload.item_data.content = itemToDuplicate.content || [''];
        payload.item_data.checked = itemToDuplicate.checked || [false];
      } else if (itemToDuplicate.label === 'Nota') {
        payload.item_data.content = itemToDuplicate.content || '';
      } else if (itemToDuplicate.label === 'Archivo' && itemToDuplicate.content?.fileData) {
        payload.item_data.content = {
          fileData: itemToDuplicate.content.fileData,
          base64: itemToDuplicate.content.base64
        };
              }
        
        const result = await addItem(payload);
      
      // Ahora agregar el item al estado visual con el ID real del servidor
      setItemsByDate(prev => {
        const newState = { ...prev };
        if (!newState[itemDate]) {
          newState[itemDate] = [];
        }
        
        // Crear el item final combinando datos del servidor con los del original
        const itemFinal = {
          ...itemToDuplicate, // Preservar todos los datos del original
          ...result, // Sobrescribir con datos del servidor (ID, fechas, etc.)
          // FORZAR las coordenadas calculadas para evitar teletransporte
          x: newX,
          y: newY,
          angle: newAngle,
          distance: newDistance,
          // ASEGURAR que tenga todas las propiedades necesarias para renderizar
          label: itemToDuplicate.label || 'Item duplicado',
          width: itemToDuplicate.width || 150,
          height: itemToDuplicate.height || 100,
          _pending: false,
          _justDuplicated: false
        };
        
        newState[itemDate] = [...newState[itemDate], itemFinal];
        return newState;
      });
      
      return result;
    } catch (error) {
      console.error('Error al duplicar item:', error);
      throw error;
    }
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
        duplicateItem,
        loading, 
        error, 
        refreshItems,
 // Función para desbloquear loadItems
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
