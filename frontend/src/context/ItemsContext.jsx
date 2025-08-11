import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const ItemsContext = createContext();

export const ItemsProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [itemsByDate, setItemsByDate] = useState({});
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!user || !token) return;
    fetch(`${API_URL}/api/items`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const expanded = data
          .map(item => ({
            ...item,
            ...(item.item_data || {}),
          }))
          .map(item => {
            const angle = Number(item.angle ?? 0);
            const distance = Number(item.distance ?? 120);
            const width = Number(item.width ?? (item.label === 'Tarea' ? 200 : 150));
            const height = Number(item.height ?? (item.label === 'Tarea' ? 120 : 80));
            return {
              ...item,
              angle: Number.isFinite(angle) ? angle : 0,
              distance: Number.isFinite(distance) ? distance : 120,
              width: Number.isFinite(width) ? width : (item.label === 'Tarea' ? 200 : 150),
              height: Number.isFinite(height) ? height : (item.label === 'Tarea' ? 120 : 80),
            };
          })
          .filter(item => !!item.label && item.date);

        const grouped = expanded.reduce((acc, item) => {
          const dateKey = item.date; // 'YYYY-MM-DD'
          if (!acc[dateKey]) acc[dateKey] = [];
          acc[dateKey].push(item);
          return acc;
        }, {});
        setItemsByDate(grouped);
      })
      .catch(() => {});
  }, [user, token]);

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
      if (!res.ok) throw new Error('Error creating item');
      const saved = await res.json();
      const expanded = { ...saved, ...(saved.item_data || {}) };

      setItemsByDate(prev => ({
        ...prev,
        [date]: (prev[date] || []).map(i => i.id === placeholder.id ? expanded : i)
      }));
      return expanded;
    } catch (e) {
      setItemsByDate(prev => ({
        ...prev,
        [date]: (prev[date] || []).filter(i => i.id !== placeholder.id)
      }));
      return null;
    }
  }

  async function updateItem(id, changes) {
    const { date, x, y, rotation, rotation_enabled, ...itemData } = changes;
    const payload = {
      ...(date !== undefined ? { date } : {}),
      ...(x !== undefined ? { x } : {}),
      ...(y !== undefined ? { y } : {}),
      ...(rotation !== undefined ? { rotation } : {}),
      ...(rotation_enabled !== undefined ? { rotation_enabled } : {}),
      ...(Object.keys(itemData).length ? { item_data: itemData } : {})
    };
    await fetch(`${API_URL}/api/items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }).catch(() => {});
    setItemsByDate(prev => {
      const newState = { ...prev };
      for (const dateKey in newState) {
        newState[dateKey] = newState[dateKey].map(i => i.id === id ? { ...i, ...changes } : i);
      }
      return newState;
    });
  }

  async function deleteItem(id) {
    await fetch(`${API_URL}/api/items/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
    setItemsByDate(prev => {
      const newState = {};
      for (const date in prev) {
        newState[date] = prev[date].filter(i => i.id !== id);
      }
      return newState;
    });
  }

  return (
    <ItemsContext.Provider value={{ itemsByDate, setItemsByDate, addItem, updateItem, deleteItem }}>
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = () => useContext(ItemsContext);
