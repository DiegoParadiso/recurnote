import { useState, useRef, useEffect } from 'react';
import UnifiedContainer from '../../Shared/UnifiedContainer';

export default function NoteItem({
  id,
  x,
  y,
  rotation,
  item,
  onDragStart,
  onUpdate,
  circleSize,
  cx,
  cy
}) {
  const textareaRef = useRef(null);

  // Usamos solo item.content y item.width/item.height de props, sin estado local
  const { content = '', width = 150, height = 80 } = item;

  const handleTextChange = (e) => {
    const nextValue = e.target.value;
    const textarea = textareaRef.current;

    // Comprobamos overflow para evitar scroll
    const overflowY = textarea.scrollHeight > textarea.clientHeight;
    const overflowX = textarea.scrollWidth > textarea.clientWidth;

    if (!overflowY && !overflowX) {
      // Avisamos al padre del cambio
      onUpdate(id, nextValue);
    } else {
      // Restauramos valor anterior forzando cambio de valor (controlado)
      textarea.value = content;
    }
  };

  return (
    <UnifiedContainer
      x={x}
      y={y}
      rotation={rotation}
      width={width}
      height={height}
      minWidth={110}
      minHeight={60}
      maxWidth={224}
      maxHeight={214}
      onMove={({ x, y }) => onDragStart({ x, y }, id)}
      onResize={(size) => onUpdate(id, content, null, size)}
      circleCenter={{ cx, cy }}
      maxRadius={circleSize / 2}
    >
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 pointer-events-none select-none">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-[6px] h-[6px] bg-neutral-400/30 rounded-full" />
        ))}
      </div>

      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleTextChange}
        placeholder="Escribe aquí..."
        className="pl-6 pr-2 pt-1 text-[10px] bg-transparent outline-none text-black rounded-md w-full h-full"
        style={{
          resize: 'none',
          overflow: 'hidden',
          wordBreak: 'break-word',
        }}
      />
    </UnifiedContainer>
  );
}
