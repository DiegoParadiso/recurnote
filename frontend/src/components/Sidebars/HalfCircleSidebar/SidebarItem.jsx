import { useRef, useState } from 'react';
import { CheckSquare } from 'lucide-react';
import './SidebarItem.css';

export default function SidebarItem({ item, onMobileDragStart, setDragPreview }) {
  const base = 'sidebar-item';
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const touchStartRef = useRef(null);
  const touchTimeoutRef = useRef(null);
  const isTouch = 'ontouchstart' in window;

  // --- TOUCH EVENTS ---
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };

    touchTimeoutRef.current = setTimeout(() => {
      setIsTouchDragging(true);
      onMobileDragStart?.(item);
    }, 100);
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 10 && !isTouchDragging) {
      clearTimeout(touchTimeoutRef.current);
      setIsTouchDragging(true);
      onMobileDragStart?.(item);
    }

    if (isTouchDragging && setDragPreview) {
      setDragPreview({
        x: touch.clientX,
        y: touch.clientY,
        item,
      });
    }
  };

  const handleTouchEnd = (e) => {
    clearTimeout(touchTimeoutRef.current);
    setIsTouchDragging(false);
    touchStartRef.current = null;
    setDragPreview?.(null);
  };

  // --- DESKTOP DRAG ---
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', item.label);
    e.dataTransfer.setData('label', item.label);
    e.dataTransfer.setData('source', 'sidebar');
  };

  const commonProps = {
    draggable: !isTouch,
    onDragStart: !isTouch ? handleDragStart : undefined,
    onTouchStart: isTouch ? handleTouchStart : undefined,
    onTouchMove: isTouch ? handleTouchMove : undefined,
    onTouchEnd: isTouch ? handleTouchEnd : undefined,

    // PREVENIR SELECCIÓN Y MENÚ LARGO EN MOBILE
    onContextMenu: (e) => e.preventDefault(),
    style: {
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      touchAction: 'none', // evita gestos nativos tipo scroll/zoom durante drag
      cursor: 'grab',
    },
  };

  const renderContent = () => {
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
  };

  return renderContent();
}
