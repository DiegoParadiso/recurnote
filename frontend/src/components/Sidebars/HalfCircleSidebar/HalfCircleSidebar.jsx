import './HalfCircleSidebar.css';
import { useState } from 'react';
import SidebarItem from './SidebarItem';

export default function CurvedSidebar({ showConfigPanel, isMobile = false, onSelectItem }) {
  const [items] = useState([
    { id: 1, label: 'nota' },
    { id: 2, label: 'Tarea' },
    { id: 3, label: 'Evento' },
    { id: 4, label: 'Archivo' },
  ]);

  return (
    <div
      className={`curved-sidebar-container ${showConfigPanel ? 'config-open' : ''} ${
        isMobile ? 'mobile' : ''
      }`}
    >
      {!isMobile && <div className="curved-sidebar-hover-zone" />}
      <div className="scroll-hidden curved-sidebar-panel">
        {items
          .filter((item) => item.label !== 'Evento')
          .map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', item.label);
                e.dataTransfer.setData('label', item.label);
                e.dataTransfer.setData('source', 'sidebar');
              }}
            >
              <SidebarItem
                item={item}
                onClick={() => {
                  onSelectItem?.(item);
                }}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
