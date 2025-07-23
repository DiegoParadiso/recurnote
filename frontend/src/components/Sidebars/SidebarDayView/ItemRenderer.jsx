import React from 'react';
import './ItemRenderer.css';

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
        className="w-full rounded p-2 item-card border shadow-sm text-[10px]"
      >
        {(item.content || []).map((task, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-1">
            <label className="checkbox-label relative cursor-pointer select-none">
              <input
                type="checkbox"
                className="checkbox-input"
                checked={item.checked?.[idx] || false}
                onChange={() => toggleTaskCheck(dateKey, idx)}
              />
              <span
                className={`checkbox-box ${item.checked?.[idx] ? 'checked' : ''}`}
              >
                <svg
                  viewBox="0 0 12 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 5L4 8L11 1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </label>
            <span className={item.checked?.[idx] ? 'line-through' : ''}>
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
      className="w-full rounded p-2 item-card border shadow-sm text-[10px]"
      title={item.content}
    >
      {item.content}
    </div>
  );
}
