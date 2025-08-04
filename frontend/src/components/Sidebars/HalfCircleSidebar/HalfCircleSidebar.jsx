import './HalfCircleSidebar.css';
import { useState } from 'react';
import SidebarItem from './SidebarItem';

export default function CurvedSidebar({ showConfigPanel, isMobile = false }) {
  const [items] = useState([
    { id: 1, label: 'nota' },
    { id: 2, label: 'Tarea' },
    { id: 3, label: 'Evento' },
    { id: 4, label: 'Archivo' },
  ]);

  const [dragPreview, setDragPreview] = useState(null);

  const handleMobileDragStart = (item) => {
    // Lógica adicional opcional al comenzar el drag en mobile
  };

  return (
    <div
      className={`curved-sidebar-container ${showConfigPanel ? 'config-open' : ''} ${isMobile ? 'mobile' : ''}`}
    >
      {!isMobile && <div className="curved-sidebar-hover-zone" />}
      <div className="scroll-hidden curved-sidebar-panel">
        {items
          .filter((item) => item.label !== 'Evento') // ocultar si se desea
          .map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              onMobileDragStart={handleMobileDragStart}
              setDragPreview={setDragPreview}
            />
          ))}
      </div>

      {/* Vista previa del ítem mientras se arrastra (solo mobile) */}
      {dragPreview && (
        <div
          className="drag-preview"
          style={{
            position: 'fixed',
            top: dragPreview.y,
            left: dragPreview.x,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          <SidebarItem item={dragPreview.item} />
        </div>
      )}
    </div>
  );
}
