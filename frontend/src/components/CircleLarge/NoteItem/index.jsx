import NoteContainer from './NoteContainer';
import ResizableTextarea from './ResizableTextarea';

import { useState, useEffect, useRef } from 'react';

export default function NoteItem({ id, x, y, rotation, item, onDragStart, onUpdate, circleSize, cx, cy }) {
  const [text, setText] = useState(item.content || '');
  const textareaRef = useRef(null);
  const [maxSize, setMaxSize] = useState({ width: 100, height: 100 });

  useEffect(() => {
    if (!textareaRef.current) return;

    const dx = x - cx;
    const dy = y - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = circleSize / 2 - 8;
    const remainingDistance = maxRadius - distance;
    const safeSize = Math.max(40, remainingDistance * Math.SQRT1_2 * 2);

    setMaxSize({
      width: Math.min(224, safeSize),
      height: Math.min(214, safeSize),
    });
  }, [x, y, cx, cy, circleSize]);

  return (
    <NoteContainer
      x={x}
      y={y}
      rotation={rotation}
      draggable
      onDragStart={(e) => onDragStart(e, id)}
      style={{ cursor: 'grab' }}
    >
      {/* Puntitos visuales */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 pointer-events-none select-none">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-[6px] h-[6px] bg-neutral-400/30 rounded-full" />
        ))}
      </div>

      {/* Área editable */}
      <ResizableTextarea
        text={text}
        onChange={(e) => {
          setText(e.target.value);
          onUpdate(id, e.target.value);
        }}
        maxSize={maxSize}
        textareaRef={textareaRef}
      />
    </NoteContainer>
  );
}
