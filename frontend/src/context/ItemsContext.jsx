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
        const expanded = data.map(item => ({
          ...item,
          ...(item.item_data || {})
        }));
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
    const { date, x, y, rotation, rotation_enabled, ...itemData } = item;
    const payload = {
      date,
      x,
      y,
      rotation,
      rotation_enabled,
      item_data: itemData
    };
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
    setItemsByDate(prev => {
      const dateKey = expanded.date;
      return { ...prev, [dateKey]: [...(prev[dateKey] || []), expanded] };
    });
    return expanded;
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
      for (const date in newState) {
        newState[date] = newState[date].map(i => i.id === id ? { ...i, ...changes } : i);
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
