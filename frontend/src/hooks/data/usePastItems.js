import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { formatDateKey } from '@utils/formatDateKey';

export default function usePastItems(itemsByDate) {
    const [pastItems, setPastItems] = useState([]);
    const [hasHistory, setHasHistory] = useState(false);

    useEffect(() => {
        if (!itemsByDate || typeof itemsByDate !== 'object') {
            setPastItems([]);
            setHasHistory(false);
            return;
        }

        const now = DateTime.now();
        const today = now.startOf('day');

        const pastDates = Object.keys(itemsByDate)
            .map(key => {
                try {
                    return DateTime.fromISO(key);
                } catch (error) {
                    return null;
                }
            })
            .filter(date => date && date.isValid && date < today)
            .sort((a, b) => b.toMillis() - a.toMillis()); // Descending order (newest past date first)

        if (pastDates.length === 0) {
            setPastItems([]);
            setHasHistory(false);
            return;
        }

        const itemsList = [];

        pastDates.forEach(date => {
            const key = formatDateKey(date.toObject());
            const items = itemsByDate[key] || [];
            if (items.length > 0) {
                itemsList.push({ date, items });
            }
        });

        setPastItems(itemsList);
        setHasHistory(itemsList.length > 0);
    }, [itemsByDate]);

    return { pastItems, hasHistory };
}
