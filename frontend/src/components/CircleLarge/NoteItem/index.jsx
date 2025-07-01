import { useState } from 'react';
import UnifiedContainer from '../../Shared/UnifiedContainer';

export default function NoteItem({ id, x, y, rotation, item, onDragStart, onUpdate, circleSize, cx, cy }) {
  const [text, setText] = useState(item.content || '');

  // Tamaño fijo inicial, no cambia automáticamente
  const [size, setSize] = useState({ width: 150, height: 150 });

  const handleTextChange = (e) => {
    setText(e.target.value);
    onUpdate(id, e.target.value);
    // NO cambiamos tamaño aquí para que sea fijo
  };

  return (
    <UnifiedContainer
      x={x}
      y={y}
      rotation={rotation}
      width={size.width}
      height={size.height}
      minWidth={40}
      minHeight={40}
      maxWidth={224}
      maxHeight={214}
      onMove={({ x, y }) => onDragStart({ x, y }, id)}
      onResize={setSize} // Tamaño cambia solo al hacer resize manual
      circleCenter={{ cx, cy }}
      maxRadius={circleSize / 2}
    >
      {/* Puntitos visuales */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 pointer-events-none select-none">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-[6px] h-[6px] bg-neutral-400/30 rounded-full" />
        ))}
      </div>

      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder="Escribe aquí..."
        className="pl-6 pr-2 pt-1 text-[10px] bg-transparent outline-none text-black rounded-md resize-none w-full h-full"
        style={{
          overflow: 'auto',  // Scroll si se excede tamaño
        }}
      />
    </UnifiedContainer>
  );
}
