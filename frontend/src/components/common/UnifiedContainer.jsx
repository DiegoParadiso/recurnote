import React, { useState, useEffect, useRef } from 'react';
import { useDragResize } from '../../hooks/useDragResize';
import { limitPositionInsideCircle } from '../../utils/helpers/geometry';
import { getContainerStyle } from '../../utils/styles/getContainerStyle';

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
    
    // No prevenir el comportamiento por defecto aquí para permitir que el long press funcione
    // Solo registrar la posición inicial
    isDragging.current = true;
    dragStartPos.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      x: pos.x,
      y: pos.y,
      containerRotation: -rotation,
    };
  };

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