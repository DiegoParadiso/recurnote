import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import formatDateKey from '../../../../utils/formatDateKey';

export default function useItemsForDays(itemsByDate) {
  const [itemsForDays, setItemsForDays] = useState([]);
  const [startDate, setStartDate] = useState(null);

  useEffect(() => {
    const now = DateTime.now();
    setStartDate(now);

    const fechasConItems = Object.keys(itemsByDate)
      .map(key => DateTime.fromISO(key))
      .filter(date => date >= now);

    if (fechasConItems.length === 0) {
      setItemsForDays([]);
      return;
    }

    const maxDate = fechasConItems.reduce((a, b) => (a > b ? a : b));
    const itemsList = [];

    for (let date = now; date <= maxDate; date = date.plus({ days: 1 })) {
      const key = formatDateKey(date.toObject());
      const items = itemsByDate[key] || [];
      if (items.length > 0) {
        itemsList.push({ date, items });
      }
    }

    setItemsForDays(itemsList);
  }, [itemsByDate]);

  return { itemsForDays, startDate };
}
