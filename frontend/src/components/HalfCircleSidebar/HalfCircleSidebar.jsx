import { useState } from 'react';

export default function HalfCircleSidebar() {
  const [items] = useState([
    { id: 1, label: 'nota' },
    { id: 2, label: 'Evento' },
    { id: 3, label: 'Tarea' },
    { id: 4, label: 'Idea' },
    { id: 5, label: 'Archivo' },
  ]);

  return (
    <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
      <div className="w-[300px] h-[600px] border border-neutral-700 rounded-r-full flex flex-col items-start justify-center gap-4 overflow-auto p-10">
        {items.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', item.label);
              e.dataTransfer.setData('source', 'sidebar');
            }}
            className="relative w-[120px] h-[70px] border border-neutral-300 rounded-md p-2 pl-5 cursor-grab hover:bg-neutral-100 transition-colors flex flex-col justify-between"
          >
            {/* Hojalillos decorativos */}
            <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-[6px] h-[6px] bg-neutral-400/30 rounded-full"
                />
              ))}
            </div>

            <div className="text-sm font-medium text-neutral-800">{item.label}</div>
            <div className="text-[10px] text-neutral-400 text-right">12:45</div>
          </div>
        ))}
      </div>
    </div>
  );
}