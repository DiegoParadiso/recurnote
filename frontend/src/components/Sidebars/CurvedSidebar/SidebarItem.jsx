import { useRef, useEffect, useState } from 'react';
import { CheckSquare } from 'lucide-react';
import './SidebarItem.css';

export default function SidebarItem({ item, onMobileDragStart, onClick }) {
  const base = 'sidebar-item';
  const touchTimeout = useRef(null);
  const [isTouchDragging, setIsTouchDragging] = useState(false);

  const handleTouchStart = (e) => {
    if (window.innerWidth > 640) return;

    touchTimeout.current = setTimeout(() => {
      setIsTouchDragging(true);
      onMobileDragStart?.(item);
    }, 100);
  };

  const handleTouchEnd = () => {
    clearTimeout(touchTimeout.current);
    if (isTouchDragging) setIsTouchDragging(false);
  };

  useEffect(() => {
    return () => clearTimeout(touchTimeout.current);
  }, []);

  // Validación para evitar errores
  if (!item || typeof item.label !== 'string') {
    // Podés devolver null o un fallback visual si querés
    return null;
  }

  const commonProps = {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    draggable: true,
    onDragStart: () => onMobileDragStart?.(item),
    onClick: (e) => {
      if (!isTouchDragging) {
        onClick?.(e);
      }
    },
  };

  switch (item.label) {
    case 'nota':
      return (
        <div className={`${base} sidebar-item-nota`} {...commonProps}>
          <div className="dots">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="dot" />
            ))}
          </div>
        </div>
      );
    case 'Evento':
      return (
        <div className={`${base} sidebar-item-evento`} {...commonProps}>
          <div className="top-line" />
          <div className="row">
            {[...Array(4)].map((_, i) => (
              <div key={`row1-${i}`} className="block" />
            ))}
          </div>
          <div className="row">
            {[...Array(3)].map((_, i) => (
              <div key={`row2-${i}`} className="block light" />
            ))}
          </div>
        </div>
      );
    case 'Tarea':
      return (
        <div className={`${base} sidebar-item-tarea`} {...commonProps}>
          <div className="flex flex-col gap-1 ml-1">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="check-line">
                <CheckSquare className="text-neutral-400" size={12} />
                <div className="bar" />
              </div>
            ))}
          </div>
        </div>
      );
    case 'Archivo':
      return (
        <div className={`${base} sidebar-item-archivo`} {...commonProps}>
          <div className="top-bar" />
          <div className="tab" />
          <div className="separator" />
          <div className="flex justify-center items-center grow pt-4" />
        </div>
      );
    default:
      return null;
  }
}
