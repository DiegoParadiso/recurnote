import { useState, useEffect, useRef } from 'react';

export default function NoteItem({ id, x, y, rotation, item, onDragStart, onUpdate, circleSize, cx, cy  }) {
  const [text, setText] = useState(item.content || '');
  const textareaRef = useRef(null);
    const [maxSize, setMaxSize] = useState({ width: 100, height: 100 });


  // Ajustar altura del textarea automáticamente
 useEffect(() => {
  if (!textareaRef.current) return;

  const dx = x - cx;
  const dy = y - cy;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const maxRadius = circleSize / 2 - 8; // 8px de margen

  const angle = Math.atan2(dy, dx);
  const remainingDistance = maxRadius - distance;

  // Asumiendo que la nota puede crecer en ambas direcciones,
  // usamos una hipotenusa mínima para evitar que se pase del borde.
  const safeSize = Math.max(40, remainingDistance * Math.SQRT1_2 * 2); // √1/2 ≈ 0.707

  setMaxSize({ width: safeSize, height: safeSize });
}, [x, y, cx, cy, circleSize]);
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        maxWidth: '240px',
        maxHeight: '180px',
        minWidth: '120px',
        cursor: 'default',
      }}
      className="draggable-note relative rounded-md p-2 border bg-neutral-100 backdrop-blur-md flex flex-col justify-between"
    >
      {/* Handle para arrastrar */}
      <div
        className="draggable-note absolute left-1 top-1/2 -translate-y-1/2 flex flex-col pl-1 gap-1.5 cursor-grab"
        draggable
        onDragStart={(e) => onDragStart(e, id)}
      >
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-[6px] h-[6px] bg-neutral-400/30 rounded-full" />
        ))}
      </div>

      {/* Textarea editable */}
      <textarea
        ref={textareaRef}
        className="draggable-note w-full pl-6 pr-2 pt-1 text-[10px] bg-transparent outline-none text-gray-800 resize rounded-md overflow-auto"
        value={text}
        onChange={e => {
          setText(e.target.value);
          onUpdate(id, e.target.value);
        }}
        style={{
          minHeight: '40px',
          minWidth: '60px',
          maxWidth: `${maxSize.width}px`,
          maxHeight: `${maxSize.height}px`,
          resize: 'both',
          pointerEvents: 'auto',
        }}
        placeholder="Escribe aquí..."
      />
    </div>
  );
}
