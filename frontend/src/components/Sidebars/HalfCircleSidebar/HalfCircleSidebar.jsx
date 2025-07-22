import { useState } from 'react';
import SidebarItem from './SidebarItem';

export default function CurvedSidebar({ showConfigPanel }) {
  const [items] = useState([
    { id: 1, label: 'nota' },
    { id: 2, label: 'Tarea' },
    { id: 3, label: 'Evento' },
    { id: 4, label: 'Archivo' },
  ]);

  return (
    <div
      className="fixed left-0 w-[80px] group z-50"
      style={{
        zIndex: showConfigPanel ? 10 : 50,
        top: 'calc(50vh - 100px)',
        height: '200px',
      }}
    >
      {/* Zona hover ocupa todo el contenedor */}
      <div
        className="w-full h-full cursor-pointer"
      />

      {/* Sidebar deslizante */}
      <div
        className="
          scroll-hidden
          absolute top-1/2 left-[-224px] -translate-y-1/2
          group-hover:left-0
          transition-all duration-300 ease-in-out
          bg-neutral-100 border border-neutral-300
          rounded-tr-2xl rounded-br-2xl
          w-55 h-[450px]
          flex flex-col items-start justify-center gap-6
          overflow-auto p-8 z-20
        "
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