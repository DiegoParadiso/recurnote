// DayItemGroup.jsx
import React from 'react';
import formatDateKey from '../../../utils/formatDateKey';

export default function DayItemGroup({ date, items, onDaySelect, renderItem }) {
  const key = formatDateKey(date.toObject());

  return (
    <div className="flex flex-col gap-2 border-b pb-3">
      <h3
        onClick={() => onDaySelect(date.toObject())}
        className="text-[10px] font-semibold text-neutral-500 mono tracking-wide uppercase cursor-pointer hover:text-black transition"
      >
        {date.setLocale('es').toFormat('cccc d LLLL')}
      </h3>

      {items.map((item) => renderItem(item, key))}
    </div>
  );
}
