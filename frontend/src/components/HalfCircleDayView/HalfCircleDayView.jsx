import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { useItems } from '../../context/ItemsContext';
import formatDateKey from '../../utils/formatDateKey';

export default function HalfCircleDayView() {
  const { itemsByDate, setItemsByDate } = useItems();
  const [itemsForDays, setItemsForDays] = useState([]);
  const [startDate, setStartDate] = useState(null);

  useEffect(() => {
    const now = DateTime.now();
    setStartDate(now);
    const lastDay = now.endOf('month').day;
    const itemsList = [];

    for (let day = now.day; day <= lastDay; day++) {
      const date = now.set({ day });
      const key = formatDateKey(date.toObject());
      const items = itemsByDate[key] || [];
      if (items.length > 0) {
        itemsList.push({ date, items });
      }
    }

    setItemsForDays(itemsList);
  }, [itemsByDate]);

  const toggleTaskCheck = (dateKey, index) => {
    const currentItems = itemsByDate[dateKey];
    const updatedItems = currentItems.map((item) => {
      if (item.label === 'Tarea') {
        const checks = [...(item.checked || [])];
        checks[index] = !checks[index];
        return { ...item, checked: checks };
      }
      return item;
    });

    setItemsByDate((prev) => ({
      ...prev,
      [dateKey]: updatedItems,
    }));
  };

  const renderItem = (item, dateKey) => {
    if (item.label === 'Tarea') {
      return (
        <div
          key={item.id}
          className="w-full rounded p-2 bg-neutral-200 border border-neutral-300 shadow-sm text-[10px] text-neutral-700"
        >
          {(item.content || []).map((task, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                className="w-[10px] h-[10px] accent-neutral-500"
                checked={item.checked?.[idx] || false}
                onChange={() => toggleTaskCheck(dateKey, idx)}
              />
              <span className={`${item.checked?.[idx] ? 'line-through text-neutral-400' : ''}`}>
                {task}
              </span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        key={item.id}
        className="w-full rounded p-2 bg-neutral-200 border border-neutral-300 shadow-sm text-[10px] text-neutral-700"
        title={item.content}
      >
        {item.content}
      </div>
    );
  };

  return (
    <div className="fixed top-0 right-0 h-screen w-[30px] group z-50">
      <div className="absolute right-0 top-0 h-full w-[30px] z-10" />

      <div
        className="
          absolute right-[-260px] top-0
          transition-all duration-300 ease-in-out
          bg-neutral-100
          border border-neutral-700
          w-[260px] h-screen
          flex flex-col
          group-hover:right-0
          cursor-default
        "
      >
        {/* Header */}
        <div className="px-4 pt-7 pb-7 flex-shrink-0">
          <h2 className="text-[15px] font-medium text-neutral-700 mono tracking-widest uppercase">
            próximos días
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-auto px-4 pb-4 flex flex-col gap-5">
          {itemsForDays.length === 0 ? (
            <p className="text-neutral-500 text-[10px] italic">
              No hay ítems para los próximos días.
            </p>
          ) : (
            itemsForDays.map(({ date, items }) => {
              const key = formatDateKey(date.toObject());
              return (
                <div key={date.toISODate()} className="flex flex-col gap-2 border-b pb-3">
                  <h3 className="text-[10px] font-semibold text-neutral-500 mono tracking-wide uppercase">
                    {date.setLocale('es').toFormat('cccc d LLLL')}
                  </h3>
                  {items.map((item) => renderItem(item, key))}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {startDate && (
          <div className="p-3 flex-shrink-0 border-t border-neutral-300 text-center text-[10px] text-neutral-500 select-none">
            Mostrando desde <strong>{startDate.setLocale('es').toFormat('cccc d LLLL')}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
