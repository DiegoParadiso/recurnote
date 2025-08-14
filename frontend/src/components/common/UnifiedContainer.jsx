import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDragResize } from '../../hooks/useDragResize';
import { limitPositionInsideCircle } from '../../utils/helpers/geometry';
import { getContainerStyle } from '../../utils/styles/getContainerStyle';
import useIsMobile from '../../hooks/useIsMobile';

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
  ...rest
}) {

  const containerRef = useRef(null);
  const [pos, setPos] = useState({ x, y });
  const [sizeState, setSizeState] = useState({ width, height });
  const isMobile = useIsMobile();
  
  // Refs para manejar long press vs drag
  const touchStartTimeRef = useRef(null);
  const touchStartPosRef = useRef(null);
  const longPressThreshold = 500; // 500ms para long press
  const moveThreshold = 10; // 10px para considerar movimiento
  const isLongPressModeRef = useRef(false);

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
  };
  
  const handleTouchEnd = (e) => {
    if (isDragging.current) {
      onDrop?.();
      isDragging.current = false;
    }
    
    // Limpiar refs de long press
    touchStartTimeRef.current = null;
    touchStartPosRef.current = null;
    isLongPressModeRef.current = false;
  };
  
  const onMouseDownDrag = (e) => {
    const tag = e.target.tagName.toLowerCase();

    if (['input', 'textarea', 'select'].includes(tag)) return;
    if (e.target.dataset.resizeHandle) return;

    e.stopPropagation();
    isDragging.current = true;
    dragStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      x: pos.x,
      y: pos.y,
      containerRotation: -rotation,
    };
  };

  const onTouchStartDrag = (e) => {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const now = Date.now();
    
    // Guardar tiempo y posición inicial
    touchStartTimeRef.current = now;
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    
    // En móviles, esperar un poco antes de activar el drag
    if (isMobile) {
      setTimeout(() => {
        // Solo activar drag si no es long press y se movió
        if (touchStartTimeRef.current === now && !isLongPressModeRef.current) {
          const currentTouch = e.touches[0];
          if (currentTouch) {
            const deltaX = Math.abs(currentTouch.clientX - touchStartPosRef.current.x);
            const deltaY = Math.abs(currentTouch.clientY - touchStartPosRef.current.y);
            
            if (deltaX > moveThreshold || deltaY > moveThreshold) {
              e.stopPropagation();
              isDragging.current = true;
              dragStartPos.current = {
                mouseX: currentTouch.clientX,
                mouseY: currentTouch.clientY,
                x: pos.x,
                y: pos.y,
                containerRotation: -rotation,
              };
            }
          }
        }
      }, longPressThreshold);
    } else {
      // En desktop, comportamiento normal
      e.stopPropagation();
      isDragging.current = true;
      dragStartPos.current = {
        mouseX: touch.clientX,
        mouseY: touch.clientY,
        x: pos.x,
        y: pos.y,
        containerRotation: -rotation,
      };
    }
  };

  // Función para marcar que estamos en modo long press
  const setLongPressMode = useCallback((isLongPress) => {
    isLongPressModeRef.current = isLongPress;
  }, []);

  // Exponer la función para que WithContextMenu pueda usarla
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.setLongPressMode = setLongPressMode;
    }
  }, [setLongPressMode]);

  const onMouseDownResize = (e) => {
    if (disableResize) return;
    e.stopPropagation();
    isResizing.current = true;
    resizeStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: sizeState.width,
      height: sizeState.height,
    };
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
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDownDrag}
      onTouchStart={onTouchStartDrag}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleTouchEnd}
      
      onContextMenu={onContextMenu}
      style={getContainerStyle({
        pos,
        rotation,
        sizeState,
        isDragging: isDragging.current,
        style: {
          ...style,
          backgroundColor: 'var(--color-neutral)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-text-secondary)',
        }
      })}
    >
      {children}
      {!disableResize && (
        <div
          data-resize-handle="true"
          onMouseDown={onMouseDownResize}
          onTouchStart={onTouchStartResize}
          className="resize-handle-native"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            cursor: 'nwse-resize',
            borderRadius: '2px',
            zIndex: 'var(--z-low)',
          }}
        />
      )}
    </div>
  );
}