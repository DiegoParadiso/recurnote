import React, { useState, useRef, useEffect } from 'react';

export default function ResizableDraggableContainer({
  x,
  y,
  rotation = 0,
  initialWidth = 100,
  initialHeight = 50,
  minWidth = 100,
  minHeight = 80,
  maxWidth = 400,
  maxHeight = 400,
  onMove,
  onResize,
  children,
  style = {},
  ...restProps
}) {
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const isDragging = useRef(false);
  const dragStartPos = useRef({ mouseX: 0, mouseY: 0, x, y });
  const isResizing = useRef(false);
  const resizeStartPos = useRef({ mouseX: 0, mouseY: 0, width: initialWidth, height: initialHeight });

const onMouseDownDrag = (e) => {
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.dataset.resizeHandle) return;
        isDragging.current = true;
        dragStartPos.current = { mouseX: e.clientX, mouseY: e.clientY, x, y };
        e.preventDefault();
    };

  useEffect(() => {
    function onMouseMove(e) {
      if (isDragging.current) {
        const dx = e.clientX - dragStartPos.current.mouseX;
        const dy = e.clientY - dragStartPos.current.mouseY;
        onMove?.({ x: dragStartPos.current.x + dx, y: dragStartPos.current.y + dy });
      } else if (isResizing.current) {
        const dx = e.clientX - resizeStartPos.current.mouseX;
        const dy = e.clientY - resizeStartPos.current.mouseY;
        const newWidth = Math.min(Math.max(resizeStartPos.current.width + dx, minWidth), maxWidth);
        const newHeight = Math.min(Math.max(resizeStartPos.current.height + dy, minHeight), maxHeight);
        setSize({ width: newWidth, height: newHeight });
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
  }, [minWidth, minHeight, maxWidth, maxHeight, onMove, onResize]);

  const onMouseDownResize = (e) => {
    isResizing.current = true;
    resizeStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: size.width,
      height: size.height,
    };
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      onMouseDown={onMouseDownDrag}
      style={{
        position: 'absolute',
        left: `${x}px`,
        backgroundColor: '#f5f5f5', 

        top: `${y}px`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        width: size.width,
        height: size.height,
        overflow: 'auto',
        cursor: isDragging.current ? 'grabbing' : 'grab',
        ...style,
      }}
      {...restProps}
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
