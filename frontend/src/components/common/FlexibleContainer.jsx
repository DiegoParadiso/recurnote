import React, { useState, useRef, useEffect } from 'react';

export default function FlexibleContainer({
  x,
  y,
  rotation = 0,
  width,
  height,
  minWidth = 120,
  minHeight = 100,
  maxWidth = 400,
  maxHeight = 400,
  draggable = true,
  resizable = true,
  onMove,
  onResize,
  children,
  style = {},
  ...restProps
}) {
  const [size, setSize] = useState({ width: width || minWidth, height: height || minHeight });

  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, x, y });
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, width: size.width, height: size.height });

  const onMouseDownDrag = (e) => {
    const tag = e.target.tagName.toLowerCase();
    if (!draggable || ['input', 'textarea', 'select'].includes(tag) || e.target.dataset.resizeHandle) return;
    isDragging.current = true;
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, x, y };
    e.preventDefault();
  };

  const onMouseDownResize = (e) => {
    if (!resizable) return;
    isResizing.current = true;
    resizeStart.current = { mouseX: e.clientX, mouseY: e.clientY, width: size.width, height: size.height };
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (isDragging.current) {
        const dx = e.clientX - dragStart.current.mouseX;
        const dy = e.clientY - dragStart.current.mouseY;
        onMove?.({ x: dragStart.current.x + dx, y: dragStart.current.y + dy });
      } else if (isResizing.current) {
        const dx = e.clientX - resizeStart.current.mouseX;
        const dy = e.clientY - resizeStart.current.mouseY;
        const newWidth = Math.min(Math.max(resizeStart.current.width + dx, minWidth), maxWidth);
        const newHeight = Math.min(Math.max(resizeStart.current.height + dy, minHeight), maxHeight);
        setSize({ width: newWidth, height: newHeight });
        onResize?.({ width: newWidth, height: newHeight });
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
      isResizing.current = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [minWidth, minHeight, maxWidth, maxHeight, onMove, onResize]);

  // Solo actualizar tamaño si NO se está redimensionando manualmente para no pisar al usuario
  useEffect(() => {
    if (!isResizing.current && width && height) {
      setSize({ width, height });
    }
  }, [width, height]);

  return (
    <div
      onMouseDown={onMouseDownDrag}
      style={{
        position: 'absolute',
        left: `${x - size.width / 2}px`,
        top: `${y - size.height / 2}px`,
        transform: `rotate(${rotation}deg)`,
        width: size.width,
        height: size.height,
        minHeight,
        maxHeight,
        overflow: 'auto',
        cursor: isDragging.current ? 'grabbing' : draggable ? 'grab' : 'default',
        border: '1px solid rgba(0,0,0,0.05)',
        backgroundColor: '#f5f5f5',
        borderRadius: '0.5rem',
        padding: '8px',
        ...style,
      }}
      {...restProps}
    >
      {children}
      {resizable && (
        <div
          data-resize-handle
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
      )}
    </div>
  );
}
