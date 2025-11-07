import React, { useState, useEffect, useRef } from 'react';
import { useDragResize } from '@hooks/useDragResize';
import { limitPositionInsideCircle } from '@utils/helpers/geometry';
import { getContainerStyle } from '@utils/styles/getContainerStyle';

export default function UnifiedContainer({
  x, y, width, height, rotation = 0,
  minWidth = 100, minHeight = 80,
  maxWidth = 400, maxHeight = 400,
  circleCenter = { cx: 0, cy: 0 },
  maxRadius = 200,
  onMove, onResize,
  onDrag,
  onDrop,
  onContextMenu,
  children, style = {},
  disableResize = false,
  isSmallScreen = false,
  isActive = false,
  onActivate,
  zIndexOverride,
  ...rest
}) {

  const containerRef = useRef(null);
  const [pos, setPos] = useState({ x, y });
  const [sizeState, setSizeState] = useState({ width, height });
  const dragStartRef = useRef(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const limited = limitPositionInsideCircle(
      x, y, width, height, circleCenter, maxRadius, isSmallScreen
    );
    setPos({ x: limited.x, y: limited.y });
    setSizeState({
      width: Math.min(Math.max(width, minWidth), maxWidth),
      height: Math.min(Math.max(height, minHeight), maxHeight),
    });
  }, [x, y, width, height, circleCenter, maxRadius, minWidth, minHeight, maxWidth, maxHeight, isSmallScreen]);

    const { isDragging, isResizing, dragStartPos, resizeStartPos } = useDragResize({
    pos, setPos, sizeState, setSizeState,
    minWidth, minHeight, maxWidth, maxHeight,
    circleCenter, maxRadius, onMove, onResize,
    onDrag,  
    onDrop,  
    rotation,
    isSmallScreen,
  });
  
  const handleMouseUp = (e) => {
    if (isDragging.current) {
      onDrop?.();
      isDragging.current = false;
    }
    
    // Restaurar selección de texto cuando termine el drag
    document.body.style.userSelect = '';
    document.body.style.WebkitUserSelect = '';
    document.body.style.MozUserSelect = '';
    document.body.style.msUserSelect = '';
  };
  
  const handleTouchEnd = (e) => {
    if (isDragging.current) {
      onDrop?.();
      isDragging.current = false;
    }
    
    // Restaurar selección de texto cuando termine el drag
    document.body.style.userSelect = '';
    document.body.style.WebkitUserSelect = '';
    document.body.style.MozUserSelect = '';
    document.body.style.msUserSelect = '';
  };
  
  const onMouseDownDrag = (e) => {
    const tag = e.target.tagName.toLowerCase();

    if (['input', 'textarea', 'select'].includes(tag)) return;
    if (e.target.dataset.resizeHandle) return;

    onActivate?.();

    e.stopPropagation();
    e.preventDefault(); // Prevenir selección de texto
    
    // Prevenir selección de texto a nivel global durante drag
    document.body.style.userSelect = 'none';
    document.body.style.WebkitUserSelect = 'none';
    document.body.style.MozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
    
    // Registrar posición inicial para detectar drag vs click
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;
    
    // No marcar dragging aún; esperar al umbral de movimiento
    dragStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      x: pos.x,
      y: pos.y,
      containerRotation: -rotation,
    };
    // onDrag se notificará cuando el movimiento supere el umbral
  };

  const onTouchStartDrag = (e) => {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const target = e.target;
    
    // Registrar posición inicial para detectar drag vs click
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    isDraggingRef.current = false;
    
    // No marcar dragging aún; esperar al umbral de movimiento
    dragStartPos.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      x: pos.x,
      y: pos.y,
      containerRotation: -rotation,
    };
    // onDrag se notificará cuando el movimiento supere el umbral
  };

  const onMouseMoveDrag = (e) => {
    if (dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Si se movió más de 5px, se considera drag
      if (distance > 5) {
        if (!isDraggingRef.current) {
          isDraggingRef.current = true;
          isDragging.current = true;
          onDrag?.({ x: pos.x, y: pos.y });
        }
      }
    }
  };

  const onTouchMoveDrag = (e) => {
    if (e.touches.length !== 1) return;
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    
    if (dragStartRef.current) {
      const dx = touch.clientX - dragStartRef.current.x;
      const dy = touch.clientY - dragStartRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Si se movió más de 5px, se considera drag
      if (distance > 5) {
        if (!isDraggingRef.current) {
          isDraggingRef.current = true;
          isDragging.current = true;
          onDrag?.({ x: pos.x, y: pos.y });
        }
      }
    }
  };

  const onMouseDownResize = (e) => {
    if (disableResize) return;
    e.stopPropagation();
    e.preventDefault();
    isResizing.current = true;
    resizeStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: sizeState.width,
      height: sizeState.height,
    };

    // Bloquear selección de texto durante el resize
    document.body.style.userSelect = 'none';
    document.body.style.WebkitUserSelect = 'none';
    document.body.style.MozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';

    const restoreSelection = () => {
      document.body.style.userSelect = '';
      document.body.style.WebkitUserSelect = '';
      document.body.style.MozUserSelect = '';
      document.body.style.msUserSelect = '';
      window.removeEventListener('mouseup', restoreSelection);
      window.removeEventListener('touchend', restoreSelection);
      window.removeEventListener('touchcancel', restoreSelection);
    };

    window.addEventListener('mouseup', restoreSelection);
    window.addEventListener('touchend', restoreSelection);
    window.addEventListener('touchcancel', restoreSelection);
  };

  const onTouchStartResize = (e) => {
    if (disableResize) return;
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    e.stopPropagation();
    isResizing.current = true;
    resizeStartPos.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      width: sizeState.width,
      height: sizeState.height,
    };

    // Bloquear selección de texto durante el resize (por si hay mouse+touch híbrido)
    document.body.style.userSelect = 'none';
    document.body.style.WebkitUserSelect = 'none';
    document.body.style.MozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';

    const restoreSelection = () => {
      document.body.style.userSelect = '';
      document.body.style.WebkitUserSelect = '';
      document.body.style.MozUserSelect = '';
      document.body.style.msUserSelect = '';
      window.removeEventListener('mouseup', restoreSelection);
      window.removeEventListener('touchend', restoreSelection);
      window.removeEventListener('touchcancel', restoreSelection);
    };

    window.addEventListener('mouseup', restoreSelection);
    window.addEventListener('touchend', restoreSelection);
    window.addEventListener('touchcancel', restoreSelection);
  };

  // Función para verificar si se está haciendo drag
  const isCurrentlyDragging = () => {
    return isDraggingRef.current;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDownDrag}
      onMouseMove={onMouseMoveDrag}
      onTouchStart={onTouchStartDrag}
      onTouchMove={onTouchMoveDrag}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleTouchEnd}
      
      onContextMenu={onContextMenu}
      style={getContainerStyle({
        pos,
        rotation,
        sizeState,
        isDragging: isDragging.current,
        isActive,
        zIndexOverride,
        style: {
          ...style,
          backgroundColor: 'var(--color-neutral)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-neutral-darker)',
          touchAction: 'none',
        }
      })}
      data-is-dragging={isCurrentlyDragging()}
    >
      {children}
      {!disableResize && (
        <div
          data-resize-handle="true"
          onMouseDown={onMouseDownResize}
          onTouchStart={onTouchStartResize}
          className="resize-handle-native z-low"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            cursor: 'nwse-resize',
            borderRadius: '2px',
          }}
        />
      )}
    </div>
  );
}