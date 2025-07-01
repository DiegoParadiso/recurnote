import React, { useEffect, useRef, useState } from 'react';

export default function UnifiedContainer({
  x,
  y,
  rotation = 0,
  width,
  height,
  minWidth = 100,
  minHeight = 80,
  maxWidth = 400,
  maxHeight = 400,
  circleCenter = { cx: 0, cy: 0 },
  maxRadius = 200,
  onMove,
  onResize,
  children,
  style = {},
}) {
  const isDragging = useRef(false);
  const dragStartPos = useRef({ mouseX: 0, mouseY: 0, x, y });
  const isResizing = useRef(false);
  const resizeStartPos = useRef({ mouseX: 0, mouseY: 0, width, height });

  // Estado local para controlar tamaño y posición con límites
  const [pos, setPos] = useState({ x, y });
  const [sizeState, setSizeState] = useState({ width, height });

  // Limita posición dentro del círculo según tamaño
  const limitPositionInsideCircle = (newX, newY, w, h) => {
    const { cx, cy } = circleCenter;

    const dx = newX - cx;
    const dy = newY - cy;
    const distanceCenter = Math.sqrt(dx * dx + dy * dy);

    const halfDiagonal = Math.sqrt(w * w + h * h) / 2;

    const maxDistance = maxRadius - halfDiagonal;

    if (distanceCenter > maxDistance) {
      const angle = Math.atan2(dy, dx);
      const limitedX = cx + maxDistance * Math.cos(angle);
      const limitedY = cy + maxDistance * Math.sin(angle);
      return { x: limitedX, y: limitedY };
    }

    return { x: newX, y: newY };
  };

  // Efecto para actualizar local state cuando cambian props x,y,width,height
  useEffect(() => {
    // Limitar posición y tamaño para evitar salir del círculo
    let newX = x;
    let newY = y;
    let newWidth = width;
    let newHeight = height;

    // Limitar tamaño máximo según circle
    newWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
    newHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);

    // Limitar posición con el nuevo tamaño
    const limitedPos = limitPositionInsideCircle(newX, newY, newWidth, newHeight);

    // Si la posición cambia, actualizar también
    newX = limitedPos.x;
    newY = limitedPos.y;

    setPos({ x: newX, y: newY });
    setSizeState({ width: newWidth, height: newHeight });
  }, [x, y, width, height, minWidth, minHeight, maxWidth, maxHeight, circleCenter, maxRadius]);

  useEffect(() => {
    function onMouseMove(e) {
      if (isDragging.current) {
        const dx = e.clientX - dragStartPos.current.mouseX;
        const dy = e.clientY - dragStartPos.current.mouseY;
        let newX = dragStartPos.current.x + dx;
        let newY = dragStartPos.current.y + dy;

        const limited = limitPositionInsideCircle(newX, newY, sizeState.width, sizeState.height);
        newX = limited.x;
        newY = limited.y;

        setPos({ x: newX, y: newY });
        onMove?.({ x: newX, y: newY });
      } else if (isResizing.current) {
        const dx = e.clientX - resizeStartPos.current.mouseX;
        const dy = e.clientY - resizeStartPos.current.mouseY;

        let newWidth = Math.min(Math.max(resizeStartPos.current.width + dx, minWidth), maxWidth);
        let newHeight = Math.min(Math.max(resizeStartPos.current.height + dy, minHeight), maxHeight);

        const limited = limitPositionInsideCircle(pos.x, pos.y, newWidth, newHeight);

        // Ajustar tamaño si no entra
        if (limited.x !== pos.x || limited.y !== pos.y) {
          const distToCenter = Math.sqrt(
            (limited.x - circleCenter.cx) ** 2 + (limited.y - circleCenter.cy) ** 2
          );
          const maxAllowedDiagonal = maxRadius - distToCenter;
          const currentDiagonal = Math.sqrt(newWidth * newWidth + newHeight * newHeight) / 2;
          const scale = Math.min(1, maxAllowedDiagonal / currentDiagonal);
          newWidth *= scale;
          newHeight *= scale;
        }

        setSizeState({ width: newWidth, height: newHeight });
        onResize?.({ width: newWidth, height: newHeight });
      }
    }

    function onMouseUp() {
      isDragging.current = false;
      isResizing.current = false;
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    onMove,
    onResize,
    pos.x,
    pos.y,
    sizeState.width,
    sizeState.height,
    circleCenter,
    maxRadius,
  ]);

    const onMouseDownDrag = (e) => {
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.dataset.resizeHandle) {
        return;
    }
    e.stopPropagation();  // <-- evitar burbujeo al padre
    isDragging.current = true;
    dragStartPos.current = { mouseX: e.clientX, mouseY: e.clientY, x: pos.x, y: pos.y };
    e.preventDefault();
    };

  const onMouseDownResize = (e) => {
    isResizing.current = true;
    resizeStartPos.current = { mouseX: e.clientX, mouseY: e.clientY, width: sizeState.width, height: sizeState.height };
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      onMouseDown={onMouseDownDrag}
      style={{
        position: 'absolute',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        width: `${sizeState.width}px`,
        height: `${sizeState.height}px`,
        overflow: 'auto',
        cursor: isDragging.current ? 'grabbing' : 'grab',
        backgroundColor: '#f5f5f5',
        borderRadius: '0.5rem',
        border: '1px solid rgba(0,0,0,0.05)',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        ...style,
      }}
    >
      {children}
      <div
        data-resize-handle="true"
        onMouseDown={onMouseDownResize}
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
    </div>
  );
}
