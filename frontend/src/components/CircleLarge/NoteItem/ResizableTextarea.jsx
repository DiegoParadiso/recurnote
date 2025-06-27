import React, { useEffect, useRef, useState } from 'react';

function ResizableTextarea({ text, onChange, maxSize, textareaRef }) {
  const internalRef = useRef(null);
  const [minSize, setMinSize] = useState({ width: 0, height: 0 });
  const [size, setSize] = useState({ width: 100, height: 50 });
  const isResizing = useRef(false);
  const resizeStartPos = useRef({ mouseX: 0, mouseY: 0, width: 100, height: 50 });

  useEffect(() => {
    const el = textareaRef?.current || internalRef.current;
    if (el && minSize.width === 0 && minSize.height === 0) {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      setMinSize({ width: w, height: h });
      setSize({ width: w, height: h });
    }
  }, [textareaRef, minSize]);

  useEffect(() => {
    function handleMouseMove(e) {
      if (isResizing.current) {
        const dx = e.clientX - resizeStartPos.current.mouseX;
        const dy = e.clientY - resizeStartPos.current.mouseY;
        const newWidth = Math.min(Math.max(resizeStartPos.current.width + dx, minSize.width), maxSize.width);
        const newHeight = Math.min(Math.max(resizeStartPos.current.height + dy, minSize.height), maxSize.height);
        setSize({ width: newWidth, height: newHeight });
      }
    }
    function handleMouseUp() {
      if (isResizing.current) {
        isResizing.current = false;
      }
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [minSize, maxSize]);

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
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <textarea
        ref={textareaRef || internalRef}
        className="pl-6 pr-2 pt-1 text-[10px] bg-transparent outline-none text-black rounded-md overflow-auto"
        value={text}
        onChange={onChange}
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          minWidth: `${minSize.width}px`,
          minHeight: `${minSize.height}px`,
          maxWidth: `${maxSize.width}px`,
          maxHeight: `${maxSize.height}px`,
          resize: 'none',
          pointerEvents: 'auto',
        }}
        placeholder="Escribe aquí..."
      />

      <div
        onMouseDown={onMouseDownResize}
        className="resize-handle-native"
        style={{
          position: 'absolute',
          right: '0',
          bottom: '0',
          cursor: 'nwse-resize',
          right: '-8px', // <--- Compensa el padding de NoteContainer
          bottom: '-8px', // <--- Compensa el padding de NoteContainer
          zIndex: 10,
          borderRadius: '2px',
        }}
      />
    </div>
  );
}

export default ResizableTextarea;
