import React, { useRef, useState, useEffect } from 'react';
import UnifiedContainer from '../../../common/UnifiedContainer';
import WithContextMenu from '../../../common/WithContextMenu';
import { useItems } from '../../../../context/ItemsContext';

import '../../../../styles/components/circles/items/NoteItem.css';

export default function NoteItem({
  id,
  x,
  y,
  rotation,
  rotationEnabled = true,
  item,
  onUpdate,
  onResize,
  onDelete,
  circleSize,
  cx,
  cy,
  isSmallScreen,
  onItemDrag,
  onItemDrop,
}) {
  const textareaRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const timeoutRef = useRef(null);
  const wasDraggingRef = useRef(false);
  const { content = '', width = 240, height = 80 } = item;
  
  // Detectar si es móvil
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const { duplicateItem } = useItems();

  const handleDuplicate = async () => {
    try {
      await duplicateItem(id);
    } catch (error) {
      console.error('Error al duplicar item:', error);
    }
  };

  const computedMinHeight = height;

  const handleTextChange = (e) => {
    // No cambiar texto si se está arrastrando
    if (isDragging || wasDraggingRef.current) {
      return;
    }
    onUpdate(id, e.target.value);
  };

  const handleContainerDragStart = () => {
    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Pequeño delay para permitir clicks rápidos
    timeoutRef.current = setTimeout(() => {
      setIsDragging(true);
      wasDraggingRef.current = true;
    }, 100);
  };

  const handleContainerDragEnd = () => {
    // Limpiar timeout si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Reset drag state inmediatamente al terminar
    setIsDragging(false);
    
    // Mantener wasDragging por un breve momento para evitar activaciones
    setTimeout(() => {
      wasDraggingRef.current = false;
    }, 200);
  };

  // Funciones para manejar edición
  const startEditing = () => {
    setIsEditing(true);
  };

  const stopEditing = () => {
    setIsEditing(false);
  };

  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Cambiar estado inmediatamente para bloquear visualmente
      stopEditing();
      e.target.blur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      // Cambiar estado inmediatamente para bloquear visualmente
      stopEditing();
      e.target.blur();
    }
  };

  // Desenfocar textarea cuando se detecta drag
  useEffect(() => {
    if (isDragging && textareaRef.current && document.activeElement === textareaRef.current) {
      textareaRef.current.blur();
      setIsEditing(false);
    }
  }, [isDragging]);



  // Limpiar timeouts cuando se desmonte el componente
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <WithContextMenu
      onDelete={() => onDelete?.(id)}
      extraOptions={[
        { label: 'Duplicar', onClick: handleDuplicate },
      ]}
    >
      <UnifiedContainer
        x={x}
        y={y}
        rotation={rotationEnabled ? rotation : 0}
        width={width}
        height={height}
        minWidth={120}
        minHeight={computedMinHeight}
        maxWidth={224}
        maxHeight={computedMinHeight}
        onMove={({ x, y }) => {
          // NO recalcular posición automáticamente para items recién duplicados
          if (item._justDuplicated) {
            // Solo actualizar la posición visual, no recalcular ángulo/distance
            onItemDrag?.(id, { x, y });
            return;
          }
          
          // Calcular el ángulo y distancia desde el centro del círculo
          const dx = x - cx;
          const dy = y - cy;
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Actualizar la posición del item
          onUpdate?.(id, content, null, null, { x, y }, { angle, distance });
          onItemDrag?.(id, { x, y });
        }}
        onResize={(newSize) => {
          const newWidth = Math.min(newSize.width, 400);
          onUpdate?.(id, content, null, { width: newWidth, height: computedMinHeight });
          onResize?.({ width: newWidth, height: computedMinHeight });
        }}
        onDrag={handleContainerDragStart}
        onDrop={handleContainerDragEnd}
        circleCenter={{ cx, cy }}
        maxRadius={circleSize / 2}
        isSmallScreen={isSmallScreen}
      >
        <div 
          data-drag-container="true"
          style={{
            userSelect: isDragging ? 'none' : 'auto',
            WebkitUserSelect: isDragging ? 'none' : 'auto',
            MozUserSelect: isDragging ? 'none' : 'auto',
            msUserSelect: isDragging ? 'none' : 'auto',
          }}
        >
          <div className="noteitem-draghandle">
          <div className="noteitem-dot"></div>
          <div className="noteitem-dot"></div>
          <div className="noteitem-dot"></div>
        </div>
        <textarea
          ref={textareaRef}
          className="noteitem-textarea"
          value={content}
          onChange={handleTextChange}
          onDoubleClick={(e) => {
            // En móviles no usar doble click
            if (isMobile) return;
            
            // Solo permitir edición con doble click si no se está arrastrando
            if (!isDragging && !wasDraggingRef.current) {
              startEditing();
              // Forzar focus después de activar edición
              setTimeout(() => {
                e.target.focus();
              }, 0);
            }
          }}
          onFocus={(e) => {
            // En móviles comportamiento normal
            if (isMobile) {
              startEditing();
              return;
            }
            
            // En desktop - prevenir focus directo, solo por doble click
            if (!isEditing) {
              e.target.blur();
            }
          }}
          onMouseDown={(e) => {
            // En móviles no delegar drag
            if (isMobile) return;
            
            // Si no está en edición, delegar el drag al contenedor padre
            if (!isEditing) {
              e.preventDefault();
              // Buscar el contenedor de drag y simular mousedown ahí
              const dragContainer = e.target.closest('[data-drag-container]');
              if (dragContainer) {
                const mouseEvent = new MouseEvent('mousedown', {
                  bubbles: true,
                  cancelable: true,
                  clientX: e.clientX,
                  clientY: e.clientY,
                  button: e.button
                });
                dragContainer.dispatchEvent(mouseEvent);
              }
            }
          }}
          onBlur={() => {
            stopEditing();
          }}
          onKeyDown={handleTextareaKeyDown}
          placeholder={isMobile ? "Escribe tu nota aquí..." : "Doble click para editar..."}
          readOnly={!isEditing}
          style={{
            cursor: isMobile ? 'text' : (isEditing ? 'text' : 'grab'),
            opacity: isMobile ? 1 : (isEditing ? 1 : 0.7),
            pointerEvents: isDragging ? 'none' : 'auto',
            backgroundColor: isEditing ? 'var(--color-bg-secondary)' : 'transparent',
            border: isEditing ? '1px solid var(--color-primary)' : '1px solid transparent',
            resize: isEditing ? 'none' : 'none',
          }}
        />
        </div>
      </UnifiedContainer>
    </WithContextMenu>
  );
}
