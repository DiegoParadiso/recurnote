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
        // Agrupa items por fecha YYYY-MM-DD
        const grouped = data.reduce((acc, item) => {
          const dateKey = item.date; // debe venir en formato 'YYYY-MM-DD'
          if (!acc[dateKey]) acc[dateKey] = [];
          acc[dateKey].push(item);
          return acc;
        }, {});
        setItemsByDate(grouped);
      });
  }, [user, token]);

  async function addItem(item) {
    if (!token) return;
    const res = await fetch(`${API_URL}/api/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(item)
    });
    const saved = await res.json();
    setItemsByDate(prev => {
      const dateKey = saved.date;
      return { ...prev, [dateKey]: [...(prev[dateKey] || []), saved] };
    });
  }

  async function updateItem(id, changes) {
    await fetch(`${API_URL}/api/items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(changes)
    });
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
    });
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
