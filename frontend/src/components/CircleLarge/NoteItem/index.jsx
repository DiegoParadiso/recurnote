import { useState, useRef, useEffect } from 'react';
import UnifiedContainer from '../../Shared/UnifiedContainer';

export default function NoteItem({
  id,
  x, y, rotation,     // Posición y rotación actuales del ítem
  item,               // Contiene content, width, height
  onDragStart,        // (No usado acá pero viene como prop)
  onUpdate,           // Función para actualizar datos en el padre
  circleSize,         // Diámetro del círculo grande
  cx, cy              // Centro del círculo
}) {
  const textareaRef = useRef(null);

  // Desestructuramos datos del ítem. No usamos estado local porque el valor lo maneja el padre.
  const { content = '', width = 150, height = 80 } = item;

  // Maneja cambios de texto
  const handleTextChange = (e) => {
    const nextValue = e.target.value;
    const textarea = textareaRef.current;

    // Detectamos si hay overflow para evitar que aparezca scroll
    const overflowY = textarea.scrollHeight > textarea.clientHeight;
    const overflowX = textarea.scrollWidth > textarea.clientWidth;

    if (!overflowY && !overflowX) {
      // Si no hay overflow, actualizamos el contenido en el padre
      onUpdate(id, nextValue);
    } else {
      // Si hay overflow, restauramos el valor anterior
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
      minWidth={120}
      minHeight={60}
      maxWidth={224}
      maxHeight={214}

      // Cuando el usuario mueve el ítem, pasamos la posición al padre
      // El padre se encargará de convertirla en ángulo/distancia
      onMove={({ x, y }) => onUpdate(id, content, null, null, { x, y })}

      // ⬇Cuando redimensionamos, informamos el nuevo tamaño
      onResize={(size) => onUpdate(id, content, null, size)}

      circleCenter={{ cx, cy }}
      maxRadius={circleSize / 2} // Limita el movimiento al radio del círculo
    >
      {/* Indicadores visuales a la izquierda del textarea */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 pointer-events-none select-none">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-[6px] h-[6px] bg-neutral-400/30 rounded-full" />
        ))}
      </div>

      {/* Área de texto editable */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleTextChange}
        placeholder="Escribe aquí..."
        className="pl-6 pr-2 pt-1 text-[10px] bg-transparent outline-none text-black rounded-md w-full h-full"
        style={{
          resize: 'none',           // No permitir redimensionar manualmente
          overflow: 'hidden',       // Ocultamos scroll
          wordBreak: 'break-word',  // Cortamos palabras si es necesario
        }}
      />
    </UnifiedContainer>
  );
}
