import './HalfCircleSidebar.css';
import { useState, useRef } from 'react';
import SidebarItem from './SidebarItem';

export default function CurvedSidebar({ showConfigPanel, isMobile = false }) {
  const [items] = useState([
    { id: 1, label: 'nota' },
    { id: 2, label: 'Tarea' },
    { id: 3, label: 'Evento' },
    { id: 4, label: 'Archivo' },
  ]);

  const [dragPreview, setDragPreview] = useState(null);

  // Referencia al área drop (la zona donde se puede dropear)
  const dropZoneRef = useRef(null);

  const handleMobileDragStart = (item) => {
    // Aquí podrías hacer algo al iniciar drag móvil
  };

  // Manejo del drop en mobile (se dispara cuando termina el touch)
  const handleTouchEndOnContainer = (e) => {
    if (!dragPreview) return;

    const touch = e.changedTouches[0];
    const x = touch.clientX;
    const y = touch.clientY;

    if (dropZoneRef.current) {
      const rect = dropZoneRef.current.getBoundingClientRect();
      // Verifico si la posición del touch está dentro del drop zone
      if (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {
        // Aquí sucede el drop, podés llamar a tu lógica:
        alert(`Dropped item '${dragPreview.item.label}' en drop zone móvil`);
        // Luego limpiar el preview
        setDragPreview(null);
      } else {
        // Tocó fuera del drop zone, cancelar drag preview
        setDragPreview(null);
      }
    }
  };

  return (
    <div
      className={`curved-sidebar-container ${showConfigPanel ? 'config-open' : ''} ${isMobile ? 'mobile' : ''}`}
      onTouchEnd={isMobile ? handleTouchEndOnContainer : undefined} // Captura touchend para drop mobile
    >
      {!isMobile && <div className="curved-sidebar-hover-zone" />}
      <div
        className="scroll-hidden curved-sidebar-panel"
        ref={dropZoneRef} // Zona drop para mobile
      >
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
