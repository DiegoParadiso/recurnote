import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { formatDateKey } from '../../../../../utils/formatDateKey';
import { useLocal } from '../../../../../context/LocalContext';
import { useAuth } from '../../../../../context/AuthContext';

export default function useItemsForDays(itemsByDate) {
  const [itemsForDays, setItemsForDays] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const { localItemsByDate } = useLocal();
  const { user, token } = useAuth();

  // Combinar items del servidor y locales
  const combinedItemsByDate = () => {
    if (user && token) {
      return itemsByDate || {};
    } else {
      return localItemsByDate || {};
    }
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

    const fechasConItems = Object.keys(currentItemsByDate)
      .map(key => DateTime.fromISO(key))
      .filter(date => date >= today);

    if (fechasConItems.length === 0) {
      setItemsForDays([]);
      return;
    }

    const maxDate = fechasConItems.reduce((a, b) => (a > b ? a : b));
    const itemsList = [];

    for (let date = today; date <= maxDate; date = date.plus({ days: 1 })) {
      const key = formatDateKey(date.toObject());
      const items = currentItemsByDate[key] || [];
      if (items.length > 0) {
        itemsList.push({ date, items });
      }
    }

    setItemsForDays(itemsList);
  }, [itemsByDate, localItemsByDate, user, token]);

  return { itemsForDays, startDate };
}
