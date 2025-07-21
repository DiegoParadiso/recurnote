import React from 'react';

export default function ItemRenderer({ item, dateKey, toggleTaskCheck, setItemsByDate }) {
  const handleDelete = (e) => {
    e.preventDefault();
    if (!window.confirm('¿Eliminar este ítem?')) return;

    setItemsByDate((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).filter((i) => i.id !== item.id),
    }));
  };

  if (item.label === 'Tarea') {
    return (
      <div
        key={item.id}
        onContextMenu={handleDelete}
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
            <span className={item.checked?.[idx] ? 'line-through text-neutral-400' : ''}>
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
      onContextMenu={handleDelete}
      className="w-full rounded p-2 bg-neutral-200 border border-neutral-300 shadow-sm text-[10px] text-neutral-700"
      title={item.content}
    >
      {item.content}
    </div>
  );
}
