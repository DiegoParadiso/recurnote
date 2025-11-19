import '@styles/layouts/sidebars/CurvedSidebar.css';
import { useState } from 'react';
import SidebarItem from '@components/layout/Sidebars/CurvedSidebar/SidebarItem';
import { useTranslation } from 'react-i18next';

export default function CurvedSidebar({ showConfigPanel, isMobile = false, onSelectItem, isLeftSidebarPinned = false, onHover, onStartDrag }) {
  const { t } = useTranslation();
  const [items] = useState([
    { id: 1, label: 'nota' },
    { id: 2, label: 'Tarea' },
    { id: 3, label: 'Evento' },
    { id: 4, label: 'Archivo' },
  ]);
  const [draggingId, setDraggingId] = useState(null);

  // Manejar hover interno
  const handleMouseEnter = () => {
    if (onHover && !isLeftSidebarPinned) {
      onHover(true);
    }
  };

  const handleMouseLeave = () => {
    if (onHover && !isLeftSidebarPinned) {
      onHover(false);
    }
  };

  return (
    <div
      className={`curved-sidebar-container 
        ${showConfigPanel ? 'config-open' : ''} 
        ${isMobile ? 'mobile' : ''} 
        ${isLeftSidebarPinned ? 'pinned' : ''}  /* clase para fijar */
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!isMobile && !isLeftSidebarPinned && (
        <div className="curved-sidebar-hover-zone" />
      )}
      <div
        className="scroll-hidden curved-sidebar-panel"
        onMouseDown={(e) => {
          if (!isMobile && !isLeftSidebarPinned) {
            // Evitar arrastrar el contenedor si el click/drag empezó sobre un item
            const isOverItem = e.target && e.target.closest && e.target.closest('.sidebar-item');
            if (isOverItem) return;
            onStartDrag?.(e);
          }
        }}
      >
        {items
          .filter((item) => item.label !== 'Evento') // si querés mostrar Evento acá sacá este filtro
          .map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', item.label);
                e.dataTransfer.setData('label', item.label);
                e.dataTransfer.setData('source', 'sidebar');
                setDraggingId(item.id);
              }}
              onDragEnd={() => setDraggingId(null)}
              className={`curved-draggable ${draggingId === item.id ? 'is-dragging' : ''}`}
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
