import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ItemsContext = createContext();

export const ItemsProvider = ({ children }) => {
  const { user, token, loading: authLoading } = useAuth();
  const [itemsByDate, setItemsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingOperations, setPendingOperations] = useState(new Set());
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  const loadItems = useCallback(async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
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
    } catch (err) {
      console.error('Error loading items:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, token, API_URL]);

  // Cargar items cuando cambie la autenticación
  useEffect(() => {
    if (!authLoading) {
      loadItems();
    }
  }, [user, token, authLoading, loadItems]);

  // Función para recargar items manualmente
  const refreshItems = () => {
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
    if (!token) return null;
    const { date, x, y, rotation, rotation_enabled, label, ...rest } = item;

    const itemData = { ...rest };
    if (label === 'Tarea') {
      if (!Array.isArray(itemData.content)) itemData.content = [''];
      if (!Array.isArray(itemData.checked)) itemData.checked = [false];
    }

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
  }

  async function updateItem(id, changes) {
    const { date, x, y, rotation, rotation_enabled, ...itemData } = changes;
    
    // Registrar operación pendiente
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
      await fetch(`${API_URL}/api/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      setItemsByDate(prev => {
        const newState = { ...prev };
        for (const dateKey in newState) {
          newState[dateKey] = newState[dateKey].map(i => i.id === id ? { ...i, ...changes } : i);
        }
        return newState;
      });
      
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
      throw error;
    }
  }

  async function deleteItem(id) {
    // Registrar operación pendiente
    const operationId = `delete_${id}`;
    setPendingOperations(prev => new Set([...prev, operationId]));
    
    try {
      await fetch(`${API_URL}/api/items/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setItemsByDate(prev => {
        const newState = {};
        for (const date in prev) {
          newState[date] = prev[date].filter(i => i.id !== id);
        }
        return newState;
      });
      
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
      throw error;
    }
  }

  return (
    <ItemsContext.Provider value={{ 
      itemsByDate, 
      setItemsByDate, 
      addItem, 
      updateItem, 
      deleteItem, 
      loading, 
      error, 
      refreshItems,
      syncStatus: getSyncStatus()
    }}>
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = () => useContext(ItemsContext);
