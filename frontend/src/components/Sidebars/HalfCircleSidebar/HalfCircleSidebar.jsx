import { useState } from 'react';
import SidebarItem from './SidebarItem';

export default function HalfCircleSidebar() {
  const [items] = useState([
    { id: 1, label: 'nota' },
    { id: 2, label: 'Tarea' },
    { id: 3, label: 'Evento' },
    { id: 4, label: 'Archivo' },
  ]);

  return (
    <div className="fixed top-0 left-0 h-screen w-[30px] group z-50">
      <div className="absolute left-0 top-0 h-full w-[30px] z-10" />

      <div className="absolute left-[-270px] top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out group-hover:left-[-1px]">
        <div className="w-[300px] h-[600px] border border-neutral-700 rounded-r-full flex flex-col items-start justify-center gap-4 overflow-auto p-16 bg-neutral">
          {items.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', item.label);
                e.dataTransfer.setData('label', item.label);
                e.dataTransfer.setData('source', 'sidebar');
              }}
            >
              <SidebarItem item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
