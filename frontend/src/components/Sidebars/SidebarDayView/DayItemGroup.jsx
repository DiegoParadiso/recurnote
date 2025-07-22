// DayItemGroup.jsx
import React from 'react';
import formatDateKey from '../../../utils/formatDateKey';
import './SidebarDayView.css';

export default function DayItemGroup({ date, items, onDaySelect, renderItem }) {
  const key = formatDateKey(date.toObject());

  return (
    <div className="flex flex-col gap-2 border-b day-item-group pb-3">
      <h3
        onClick={() => onDaySelect(date.toObject())}
        className="text-[10px] font-semibold  mono tracking-wide uppercase cursor-pointer day-header transition"
      >
        {date.setLocale('es').toFormat('cccc d LLLL')}
      </h3>

      {items.map((item) => renderItem(item, key))}
    </div>
  );
}
