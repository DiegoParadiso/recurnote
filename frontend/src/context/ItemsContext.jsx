import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import i18n from '../i18n/index.js';
import { useAuth } from '@context/AuthContext';
import BottomToast from '@components/common/BottomToast';

const ItemsContext = createContext();

// Ref global para tracking de items siendo arrastrados
const draggingItemsRef = { current: new Set() };

export const ItemsProvider = ({ children }) => {
  const { user, token, loading: authLoading } = useAuth();
  const [itemsByDate, setItemsByDate] = useState({});
  const itemsRef = useRef(itemsByDate); // Ref para acceder al estado más reciente en callbacks async

  useEffect(() => {
    itemsRef.current = itemsByDate;
  }, [itemsByDate]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingOperations, setPendingOperations] = useState(new Set());
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorToast, setErrorToast] = useState('');

  const retryTimeoutRef = useRef(null);
  const updateTimersRef = useRef(new Map()); // id -> timeoutId
  const updateQueueRef = useRef(new Map());  // id -> { url, payload, debounceMs }
  const inFlightRef = useRef(0);
  const PENDING_LIMIT = 3;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Undo/Redo State
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const capturedStateRef = useRef(new Map()); // id -> item state

  // Sync refs
  useEffect(() => {
    undoStackRef.current = undoStack;
  }, [undoStack]);

  useEffect(() => {
    redoStackRef.current = redoStack;
  }, [redoStack]);

  const addToHistory = useCallback((action) => {
    setUndoStack(prev => {
      const newStack = [...prev, action];
      if (newStack.length > 50) newStack.shift(); // Limit history
      return newStack;
    });
    setRedoStack([]); // Clear redo on new action
  }, []);

  const captureUndoState = useCallback((id) => {
    const item = Object.values(itemsRef.current).flat().find(i => i.id === id);
    if (item) {
      // Deep copy to ensure we capture the exact state at this moment
      capturedStateRef.current.set(id, JSON.parse(JSON.stringify(item)));
    }
  }, []);

  const commitUndoState = useCallback((id) => {
    const prevState = capturedStateRef.current.get(id);
    const nextState = Object.values(itemsRef.current).flat().find(i => i.id === id);

    if (prevState && nextState) {
      // Check if meaningful change occurred
      const hasChanged = JSON.stringify(prevState) !== JSON.stringify(nextState);
      if (hasChanged) {
        addToHistory({
          type: 'UPDATE',
          id,
          prev: prevState,
          next: JSON.parse(JSON.stringify(nextState))
        });
      }
    }
    capturedStateRef.current.delete(id);
  }, [addToHistory]);

  const undo = useCallback(async () => {
    const stack = undoStackRef.current;
    if (stack.length === 0) return;

    const action = stack[stack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, action]);

    if (action.type === 'UPDATE') {
      const { id, prev } = action;
      // Revert to prev state
      // We need to update both local state and backend
      // Using updateItem to handle both
      await updateItem(id, prev, { fromUndo: true });
    } else if (action.type === 'ADD') {
      // Undo ADD = Delete
      await deleteItem(action.id, { fromUndo: true });
    } else if (action.type === 'DELETE') {
      // Undo DELETE = Add back (restore)
      // We need to restore the item exactly as it was
      await addItem(action.item, { fromUndo: true });
    }
  }, []);

  const redo = useCallback(async () => {
    const stack = redoStackRef.current;
    if (stack.length === 0) return;

    const action = stack[stack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, action]);

    if (action.type === 'UPDATE') {
      const { id, next } = action;
      await updateItem(id, next, { fromUndo: true });
    } else if (action.type === 'ADD') {
      // Redo ADD = Add back
      await addItem(action.item || action.next, { fromUndo: true });
    } else if (action.type === 'DELETE') {
      // Redo DELETE = Delete again
      await deleteItem(action.id, { fromUndo: true });
    }
  }, []);

  // Keyboard listeners for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if focus is on an input, textarea, or contentEditable element
      const active = document.activeElement;
      const isInput = active && (
        active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.isContentEditable ||
        active.getAttribute('contenteditable') === 'true'
      );

      if (isInput) return;
      // Check for Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          // Redo
          e.preventDefault();
          redo();
        } else {
          // Undo
          e.preventDefault();
          undo();
        }
      }
      // Check for Ctrl+Y or Cmd+Y (Redo alternative)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

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

  async function addItem(item, opts = {}) {
    const { fromUndo } = opts;
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
        item_data: { label, ...itemData, position_ts: Date.now() },
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
        item_data: { label, ...itemData, position_ts: Date.now() },
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

        // VERIFICACIÓN DE RACE CONDITION:
        // Verificar si el placeholder ha sido movido localmente (drag) mientras se creaba
        const latestState = itemsRef.current;
        const latestPlaceholder = latestState[date]?.find(i => i.id === placeholder.id);

        let finalItem = expanded;
        let shouldSync = false;

        if (latestPlaceholder) {
          // Si las coordenadas actuales difieren de las iniciales, usar las actuales
          if (latestPlaceholder.x !== placeholder.x || latestPlaceholder.y !== placeholder.y || latestPlaceholder.rotation !== placeholder.rotation) {
            finalItem = {
              ...expanded,
              x: latestPlaceholder.x,
              y: latestPlaceholder.y,
              rotation: latestPlaceholder.rotation
            };
            shouldSync = true;
          }
        }

        setItemsByDate(prev => ({
          ...prev,
          [date]: (prev[date] || []).map(i => i.id === placeholder.id ? finalItem : i)
        }));

        // Si hubo cambios locales, sincronizar la nueva posición con el backend (usando el ID real)
        if (shouldSync) {
          // Usar queueItemUpdate directamente o updateItem para asegurar que se guarde
          // updateItem maneja el debounce y la cola
          updateItem(finalItem.id, {
            x: finalItem.x,
            y: finalItem.y,
            rotation: finalItem.rotation,
            date: finalItem.date // Importante para updateItem
          }, { fromDrag: true });
        }

        // Remover operación pendiente
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(operationId);
          return newSet;
        });

        if (!fromUndo) {
          addToHistory({
            type: 'ADD',
            id: finalItem.id,
            item: finalItem
          });
        }

        return finalItem;
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

      if (!fromUndo) {
        addToHistory({
          type: 'ADD',
          id: newItem.id,
          item: newItem
        });
      }

      return newItem;
    }
  }

  // Construir payload para API a partir de "changes"
  const buildPayload = (changes) => {
    const { date, x, y, rotation, rotation_enabled, ...rest } = changes || {};
    const hasGeometry = (
      x !== undefined || y !== undefined ||
      rest?.angle !== undefined || rest?.distance !== undefined ||
      rest?.width !== undefined || rest?.height !== undefined ||
      rotation !== undefined || rotation_enabled !== undefined
    );

    const itemDataOut = { ...rest };
    if (hasGeometry) {
      itemDataOut.position_ts = Date.now();
    }

    return {
      ...(date !== undefined ? { date } : {}),
      ...(x !== undefined ? { x } : {}),
      ...(y !== undefined ? { y } : {}),
      ...(rotation !== undefined ? { rotation } : {}),
      ...(rotation_enabled !== undefined ? { rotation_enabled } : {}),
      ...(Object.keys(itemDataOut).length ? { item_data: itemDataOut } : {}),
    };
  };

  // Encolar envío con quiet-time por item. opts: { debounceMs, flush, isDragging }
  const queueItemUpdate = useCallback((id, changes, opts = {}) => {
    if (!user || !token) return; // sin backend
    if (typeof id === 'string' && (id.startsWith('tmp_') || id.startsWith('local_'))) return;

    // Si el item está siendo arrastrado por otro proceso, no encolar
    if (opts.isDragging === false && draggingItemsRef.current.has(id)) {
      return; // Ignorar actualizaciones externas mientras se arrastra
    }

    const url = `${API_URL}/api/items/${id}`;
    const payload = buildPayload(changes);
    const debounceMs = typeof opts.debounceMs === 'number' ? opts.debounceMs : 1000;

    // Limpiar timeout previo ANTES de mergear
    const prevTimeout = updateTimersRef.current.get(id);
    if (prevTimeout) {
      clearTimeout(prevTimeout);
      updateTimersRef.current.delete(id);
    }

    // Guardar/Mergear último payload por id (coalescer)
    const prevEntry = updateQueueRef.current.get(id);
    if (prevEntry) {
      const mergedPayload = {
        ...prevEntry.payload,
        ...payload,
        item_data: {
          ...(prevEntry.payload?.item_data || {}),
          ...(payload?.item_data || {}),
        },
      };
      // Si estamos en drag, usar el debounce más largo para agrupar movimientos
      const mergedDebounce = opts.isDragging ? Math.max(prevEntry.debounceMs || 0, debounceMs, 2000) : debounceMs;
      updateQueueRef.current.set(id, { url: prevEntry.url || url, payload: mergedPayload, debounceMs: mergedDebounce });
    } else {
      updateQueueRef.current.set(id, { url, payload, debounceMs });
    }

    const scheduleSend = () => {
      const entry = updateQueueRef.current.get(id);
      if (!entry) return;

      // Control de concurrencia simple
      const send = async () => {
        updateQueueRef.current.delete(id);
        try {
          inFlightRef.current += 1;
          const response = await fetch(entry.url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(entry.payload),
          });
          if (!response.ok && response.status !== 404) {
            // 404 no es crítico; otros errores loguearlos
            console.error('Server error on updateItem:', response.status, response.statusText);
          }
        } catch (err) {
          // Errores de red: log y permitir reintento por próxima edición/flush
          console.error('Network error on updateItem:', err?.message || err);
        } finally {
          inFlightRef.current = Math.max(0, inFlightRef.current - 1);
        }
      };

      if (inFlightRef.current >= PENDING_LIMIT) {
        const retryId = setTimeout(scheduleSend, 200);
        updateTimersRef.current.set(id, retryId);
        return;
      }
      // Enviar ahora
      send();
    };

    if (opts.flush) {
      // Enviar inmediatamente (pero respetando concurrencia)
      scheduleSend();
      return;
    }

    const timeoutId = setTimeout(scheduleSend, debounceMs);
    updateTimersRef.current.set(id, timeoutId);
  }, [API_URL, token, user]);

  // Forzar envío inmediato si hay update encolado para el id
  const flushItemUpdate = useCallback((id) => {
    const entry = updateQueueRef.current.get(id);
    if (entry) {
      queueItemUpdate(id, entry.payload, { flush: true });
    }
  }, [queueItemUpdate]);

  // Estado de sincronización por item (rueda/check)
  const isItemSyncing = useCallback((id) => {
    if (!id) return false;
    if (updateQueueRef.current.has(id)) return true;
    for (const op of pendingOperations) {
      if (typeof op === 'string' && op.endsWith(`_${id}`)) return true;
    }
    return false;
  }, [pendingOperations]);

  // Marcar item como "en drag" para evitar actualizaciones externas
  const markItemAsDragging = useCallback((id) => {
    if (!id) return;
    draggingItemsRef.current.add(id);
  }, []);

  // Desmarcar item como "en drag"
  const unmarkItemAsDragging = useCallback((id) => {
    if (!id) return;
    draggingItemsRef.current.delete(id);
  }, []);

  // Verificar si un item está siendo arrastrado
  const isItemDragging = useCallback((id) => {
    return draggingItemsRef.current.has(id);
  }, []);

  // Flush en visibility hidden / beforeunload
  useEffect(() => {
    const flushAll = () => {
      for (const [id, entry] of updateQueueRef.current.entries()) {
        queueItemUpdate(id, entry.payload, { flush: true });
      }
    };
    const onVis = () => {
      if (document.visibilityState === 'hidden') flushAll();
    };
    window.addEventListener('beforeunload', flushAll);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('beforeunload', flushAll);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [queueItemUpdate]);

  async function updateItem(id, changes, opts = {}) {
    const { date, x, y, rotation, rotation_enabled, ...itemData } = changes;

    // Si el item está siendo arrastrado y la actualización no viene del drag,
    // solo ignorar si intenta modificar geometría. Permitir contenido/checked.
    const isDraggingItem = draggingItemsRef.current.has(id);
    if (isDraggingItem && !opts.fromDrag) {
      const changeKeys = Object.keys(changes || {});
      const touchesGeometry = changeKeys.some(k => (
        k === 'x' || k === 'y' || k === 'angle' || k === 'distance' ||
        k === 'width' || k === 'height' || k === 'rotation' || k === 'rotation_enabled'
      ));
      if (touchesGeometry) {
        return; // Ignorar cambios geométricos externos durante drag
      }
      // Si no toca geometría (p.ej. content/checked), permitir update
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
          _forcePosition: true, 
          _justDuplicated: false 
        };
        return await updateItem(id, forcedChanges, opts);
      }
    }

    // Determinar si el cambio es únicamente geométrico (sin width/height) durante drag
    const changedKeys = Object.keys(changes || {});
    const isGeomOnly = changedKeys.length > 0 && changedKeys.every(k => (
      k === 'x' || k === 'y' || k === 'angle' || k === 'distance'
    ));

    const shouldSkipVisualUpdate = (opts?.fromDrag && isGeomOnly && user && token);

    if (!shouldSkipVisualUpdate) {
      // Actualizar estado visual inmediatamente
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
    }

    // Evitar sincronizar con backend si el ID es temporal o local
    if (typeof id === 'string' && (id.startsWith('tmp_') || id.startsWith('local_'))) {
      return;
    }

    if (user && token) {
      const operationId = `update_${id}`;
      setPendingOperations(prev => new Set([...prev, operationId]));

      // Determinar debounce según tipo de cambio y si está en drag
      const hasText = Object.prototype.hasOwnProperty.call(itemData, 'content');
      const hasGeometry = (x !== undefined || y !== undefined || changes?.width !== undefined || changes?.height !== undefined || rotation !== undefined);
      const debounceMs = opts.fromDrag ? 2000 : (hasText ? 1000 : (hasGeometry ? 1500 : 800));

      queueItemUpdate(id, changes, { debounceMs, isDragging: opts.fromDrag });

      setTimeout(() => {
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(operationId);
          return newSet;
        });
      }, debounceMs + 2000);
    }
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

      const currentAngle = itemToDuplicate.angle || 0;
      const currentDistance = itemToDuplicate.distance || 120;

      const newAngle = (currentAngle + 20) % 360;
      const newDistance = currentDistance;

      const angleRad = (newAngle * Math.PI) / 180;
      const oldRad = (currentAngle * Math.PI) / 180;
      const estimatedCx = itemToDuplicate.x - currentDistance * Math.cos(oldRad);
      const estimatedCy = itemToDuplicate.y - currentDistance * Math.sin(oldRad);

      const newX = estimatedCx + newDistance * Math.cos(angleRad);
      const newY = estimatedCy + newDistance * Math.sin(angleRad);

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
        angle: newAngle,
        distance: newDistance,
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

      const result = await addItem(payload, { fromUndo: true });

      // Ahora agregar el item al estado visual con el ID real del servidor
      setItemsByDate(prev => {
        const newState = { ...prev };
        if (!newState[itemDate]) {
          newState[itemDate] = [];
        }

        // Crear el item final combinando datos del servidor con los del original
        const itemFinal = {
          ...itemToDuplicate,
          ...result, // Sobrescribir con datos del servidor 
          x: newX,
          y: newY,
          angle: newAngle,
          distance: newDistance,
          label: itemToDuplicate.label || 'Item duplicado',
          width: itemToDuplicate.width || 150,
          height: itemToDuplicate.height || 100,
          _pending: false,
          _justDuplicated: false
        };

        addToHistory({
          type: 'ADD',
          id: itemFinal.id,
          item: itemFinal
        });

        newState[itemDate] = [...newState[itemDate], itemFinal];
        return newState;
      });

      return result;
    } catch (error) {
      console.error('Error al duplicar item:', error);
      throw error;
    }
  }

  async function deleteItem(id, opts = {}) {
    const { fromUndo } = opts;

    const itemToDelete = Object.values(itemsByDate).flat().find(i => i.id === id);
    if (!fromUndo && itemToDelete) {
      addToHistory({
        type: 'DELETE',
        id,
        item: itemToDelete
      });
    }
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
        flushItemUpdate,
        isItemSyncing,
        markItemAsDragging,
        unmarkItemAsDragging,
        isItemDragging,
        loading,
        error,
        refreshItems,
        syncStatus: getSyncStatus(),
        isRetrying,
        retryCount,
        errorToast,
        setErrorToast,
        undo,
        redo,
        captureUndoState,
        commitUndoState,
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0
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
