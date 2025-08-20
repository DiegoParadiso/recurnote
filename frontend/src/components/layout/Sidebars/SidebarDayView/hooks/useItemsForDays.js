import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { formatDateKey } from '../../../../../utils/formatDateKey';
import { useAuth } from '../../../../../context/AuthContext';

export default function useItemsForDays(itemsByDate) {
  const [itemsForDays, setItemsForDays] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const { user, token } = useAuth();

  // Usar itemsByDate del ItemsContext (que ahora incluye tanto servidor como local)
  const combinedItemsByDate = () => {
    return itemsByDate || {};
  };

  useEffect(() => {
    const now = DateTime.now();
    const today = now.startOf('day');
    setStartDate(today);

    const currentItemsByDate = combinedItemsByDate();
    if (!currentItemsByDate || typeof currentItemsByDate !== 'object') {
      setItemsForDays([]);
      return;
    }

    // Obtener todas las fechas que tienen items
    const fechasConItems = Object.keys(currentItemsByDate)
      .map(key => {
        try {
          return DateTime.fromISO(key);
        } catch (error) {
          return null;
        }
      })
      .filter(date => date && date.isValid && date >= today);

    if (fechasConItems.length === 0) {
      setItemsForDays([]);
      return;
    }

    // Ordenar fechas y obtener la fecha máxima
    fechasConItems.sort((a, b) => a.toMillis() - b.toMillis());
    const maxDate = fechasConItems[fechasConItems.length - 1];
    
    const itemsList = [];

    // Generar lista de días desde hoy hasta la fecha máxima
    for (let date = today; date <= maxDate; date = date.plus({ days: 1 })) {
      const key = formatDateKey(date.toObject());
      const items = currentItemsByDate[key] || [];
      if (items.length > 0) {
        itemsList.push({ date, items });
      }
    }

    setItemsForDays(itemsList);
  }, [itemsByDate, user, token]);

  return { itemsForDays, startDate };
}
