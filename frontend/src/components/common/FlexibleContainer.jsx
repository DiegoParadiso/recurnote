import React, { useState, useRef, useEffect } from 'react';

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
  const dragStart = useRef({ x, y, startX: 0, startY: 0 });
  const resizeStart = useRef({ width: size.width, height: size.height, startX: 0, startY: 0 });

  const getEventXY = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      return { x: e.clientX, y: e.clientY };
    }
  };

  const handleMove = (e) => {
    const { x: clientX, y: clientY } = getEventXY(e);
    if (isDragging.current) {
      const dx = clientX - dragStart.current.startX;
      const dy = clientY - dragStart.current.startY;
      onMove?.({ x: dragStart.current.x + dx, y: dragStart.current.y + dy });
    } else if (isResizing.current) {
      const dx = clientX - resizeStart.current.startX;
      const dy = clientY - resizeStart.current.startY;
      const newWidth = Math.min(Math.max(resizeStart.current.width + dx, minWidth), maxWidth);
      const newHeight = Math.min(Math.max(resizeStart.current.height + dy, minHeight), maxHeight);
      setSize({ width: newWidth, height: newHeight });
      onResize?.({ width: newWidth, height: newHeight });
    }
  };

  const stopInteraction = () => {
    isDragging.current = false;
    isResizing.current = false;
  };

  const onStartDrag = (e) => {
    if (!draggable) return;
    const tag = e.target.tagName.toLowerCase();
    if (['input', 'textarea', 'select'].includes(tag) || e.target.dataset.resizeHandle) return;

    const { x: clientX, y: clientY } = getEventXY(e);
    isDragging.current = true;
    dragStart.current = { x, y, startX: clientX, startY: clientY };
    e.preventDefault();
  };

  const onStartResize = (e) => {
    if (!resizable) return;
    const { x: clientX, y: clientY } = getEventXY(e);
    isResizing.current = true;
    resizeStart.current = {
      width: size.width,
      height: size.height,
      startX: clientX,
      startY: clientY,
    };
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', stopInteraction);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', stopInteraction);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', stopInteraction);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', stopInteraction);
    };
  }, [onMove, onResize]);

  useEffect(() => {
    if (!isResizing.current && width && height) {
      setSize({ width, height });
    }
  }, [width, height]);

  return (
    <div
      onMouseDown={onStartDrag}
      onTouchStart={onStartDrag}
      style={{
        position: 'absolute',
        left: `${x - size.width / 2}px`,
        top: `${y - size.height / 2}px`,
        transform: `rotate(${rotation}deg)`,
        width: size.width,
        height: size.height,
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
          onMouseDown={onStartResize}
          onTouchStart={onStartResize}
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '16px',
            height: '16px',
            cursor: 'nwse-resize',
            backgroundColor: 'transparent',
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
}
