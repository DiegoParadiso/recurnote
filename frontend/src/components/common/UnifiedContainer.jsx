import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDragResize } from '../../hooks/useDragResize';
import { limitPositionInsideCircle } from '../../utils/geometry';
import { getContainerStyle } from '../../utils/styles/getContainerStyle';

export default function UnifiedContainer({ ...props }) {
  const {
    x, y, width, height, rotation = 0,
    minWidth = 100, minHeight = 80,
    maxWidth = 400, maxHeight = 400,
    circleCenter = { cx: 0, cy: 0 },
    maxRadius = 200,
    onMove, onResize,
    children, style = {},
    disableResize = false,
    isSmallScreen = false,
    onContextMenu,
  } = props;

  const containerRef = useRef(null);
  const [pos, setPos] = useState({ x, y });
  const [sizeState, setSizeState] = useState({ width, height });

  // Drag and resize refs y estados de hook custom
  const {
    isDragging, isResizing, dragStartPos, resizeStartPos,
  } = useDragResize({
    pos, setPos, sizeState, setSizeState,
    minWidth, minHeight, maxWidth, maxHeight,
    circleCenter, maxRadius, onMove, onResize,
    rotation,
    isSmallScreen,
  });

  // Limitar posición y tamaño al recibir props
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

  // onMouseDown drag sigue igual
  const onMouseDownDrag = (e) => {
    const tag = e.target.tagName.toLowerCase();

    if (['input', 'textarea', 'select'].includes(tag)) return;
    if (e.target.dataset.resizeHandle) return;

    e.stopPropagation();
    e.preventDefault();

    isDragging.current = true;
    dragStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      x: pos.x,
      y: pos.y,
      containerRotation: -rotation,
    };
  };

  // onMouseDown resize igual
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
  };

  // onTouchStartResize igual
  const onTouchStartResize = (e) => {
    if (disableResize) return;
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    e.stopPropagation();
    e.preventDefault();
    isResizing.current = true;
    resizeStartPos.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      width: sizeState.width,
      height: sizeState.height,
    };
  };

  // Manejo manual del touchstart drag con addEventListener para evitar error passive
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onTouchStartDrag(e) {
      if (e.touches.length !== 1) return;

      e.preventDefault();
      e.stopPropagation();

      const touch = e.touches[0];

      // Ignorar si el target es input, textarea, select o resize handle
      const tag = e.target.tagName.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag)) return;
      if (e.target.dataset.resizeHandle) return;

      isDragging.current = true;
      dragStartPos.current = {
        mouseX: touch.clientX,
        mouseY: touch.clientY,
        x: pos.x,
        y: pos.y,
        containerRotation: -rotation,
      };
    }

    el.addEventListener('touchstart', onTouchStartDrag, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStartDrag);
    };
  }, [pos.x, pos.y, rotation, isDragging, dragStartPos]);

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDownDrag}
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
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
}