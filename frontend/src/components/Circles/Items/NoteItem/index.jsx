import React, { useRef, useState } from 'react';
import UnifiedContainer from '../../../common/UnifiedContainer';
import WithContextMenu from '../../../common/WithContextMenu';

export default function NoteItem({
  id,
  x,
  y,
  rotation,
  rotationEnabled = true,
  item,
  onDragStart,
  onUpdate,
  onDelete,
  circleSize,
  cx,
  cy,
  isSmallScreen,
}) {
  const textareaRef = useRef(null);
  const { content = '', width = 150, height = 80 } = item;

  const handleTextChange = (e) => {
    const nextValue = e.target.value;
    const ta = textareaRef.current;
    const overflowY = ta.scrollHeight > ta.clientHeight;
    const overflowX = ta.scrollWidth > ta.clientWidth;
    if (!overflowY && !overflowX) {
      onUpdate(id, nextValue);
    } else {
      ta.value = content;
    }
  };

  return (
    <WithContextMenu onDelete={() => onDelete?.(id)}>
      <UnifiedContainer
        x={x}
        y={y}
        rotation={rotationEnabled ? rotation : 0}
        width={width}
        height={height}
        minWidth={120}
        minHeight={60}
        maxWidth={224}
        maxHeight={214}
        onMove={({ x, y }) => onUpdate(id, content, null, null, { x, y })}
        onResize={(size) => onUpdate(id, content, null, size)}
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
