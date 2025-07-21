import { useState } from 'react';
import SidebarItem from './SidebarItem';
import { ChevronRight } from 'lucide-react';

export default function HalfCircleSidebar({ showConfigPanel }) {
  const [items] = useState([
    { id: 1, label: 'nota' },
    { id: 2, label: 'Tarea' },
    { id: 3, label: 'Evento' },
    { id: 4, label: 'Archivo' },
  ]);

  return (
    <div
      className="fixed top-0 left-0 h-screen w-[30px] group z-50"
      style={{ zIndex: showConfigPanel ? 10 : 50 }}
    >
      {/* Hover zone izquierda */}
      <div className="absolute top-0 left-0 h-full w-[30px] z-10" />

      {/* Sidebar deslizante */}
      <div
        className={`
          absolute top-1/2 left-[-300px] -translate-y-1/2
          group-hover:left-0
          transition-all duration-300 ease-in-out
          bg-neutral border border-neutral-700 bg-neutral-100
          rounded-r-full w-[300px] h-[600px] flex flex-col items-start justify-center gap-4 overflow-auto p-16 z-20
        `}
      >

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
  );
}
