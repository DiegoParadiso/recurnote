import React, { useEffect, useRef, useState } from 'react';

function ResizableTextarea({ text, onChange, maxSize, textareaRef }) {
  const internalRef = useRef(null);
  const [minSize, setMinSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = textareaRef?.current || internalRef.current;
    if (el && minSize.width === 0 && minSize.height === 0) {
      setMinSize({
        width: el.offsetWidth,
        height: el.offsetHeight,
      });
    }
  }, [textareaRef, minSize]);

  return (
    <textarea
      ref={textareaRef || internalRef}
      className="draggable-note w-full pl-6 pr-2 pt-1 text-[10px] bg-transparent outline-none text-gray-800 resize rounded-md overflow-auto"
      value={text}
      onChange={onChange}
      style={{
        minHeight: minSize.height ? `${minSize.height}px` : '40px',
        minWidth: minSize.width ? `${minSize.width}px` : '60px',
        maxWidth: `${maxSize.width}px`,
        maxHeight: `${maxSize.height}px`,
        resize: 'both',
        pointerEvents: 'auto',
      }}
      placeholder="Escribe aquí..."
    />
  );
}

export default ResizableTextarea;
