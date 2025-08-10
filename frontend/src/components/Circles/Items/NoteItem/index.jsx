import React, { useRef } from 'react';
import UnifiedContainer from '../../../common/UnifiedContainer';
import WithContextMenu from '../../../common/WithContextMenu';

export default function NoteItem({
  id,
  x,
  y,
  rotation,
  rotationEnabled = true,
  item,
  onUpdate,
  onResize,
  onDelete,
  circleSize,
  cx,
  cy,
  isSmallScreen,
  onItemDrag,
  onItemDrop,
}) {
  const textareaRef = useRef(null);
  const { content = '', width = 150, height = 80 } = item;

  const computedMinHeight = height;

  // Simplificado: actualiza siempre el contenido
  const handleTextChange = (e) => {
    onUpdate(id, e.target.value);
  };

  return (
    <WithContextMenu
  onDelete={() => onDelete?.(id)}
  extraOptions={[
    { label: 'Duplicar', onClick: () => console.log('Duplicar', id) }
  ]}
>
      <UnifiedContainer
        x={x}
        y={y}
        rotation={rotationEnabled ? rotation : 0}
        width={width}
        height={height}
        minWidth={120}
        minHeight={computedMinHeight}
        maxWidth={224}
        maxHeight={computedMinHeight}
        onMove={({ x, y }) => {
          onUpdate?.(id, content, null, null, { x, y });
          onItemDrag?.(id, { x, y });
        }}
        onResize={(newSize) => {
          const newWidth = Math.min(newSize.width, 400);
          onUpdate?.(id, content, null, { width: newWidth, height: computedMinHeight });
          onResize?.({ width: newWidth, height: computedMinHeight });
        }}
        onDrop={() => {
          onItemDrop?.(id);
        }}
        circleCenter={{ cx, cy }}
        maxRadius={circleSize / 2}
        isSmallScreen={isSmallScreen}
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
          className="pl-6 pr-2 pt-1 text-[10px] rounded-md w-full h-full outline-none resize-none"
          style={{
            backgroundColor: 'var(--color-neutral)',
            color: 'var(--color-text-primary)',
            overflow: 'hidden',
            wordBreak: 'break-word',
          }}
        />
      </UnifiedContainer>
    </WithContextMenu>
  );
}