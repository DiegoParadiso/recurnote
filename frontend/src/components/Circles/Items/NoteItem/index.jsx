import React, { useRef } from 'react';
import UnifiedContainer from '../../../common/UnifiedContainer';
import WithContextMenu from '../../../common/WithContextMenu';
import '../../../../styles/components/circles/items/NoteItem.css';

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

  const handleTextChange = (e) => {
    onUpdate(id, e.target.value);
  };

  return (
    <WithContextMenu
      onDelete={() => onDelete?.(id)}
      extraOptions={[
        { label: 'Duplicar', onClick: () => console.log('Duplicar', id) },
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
        <div className="noteitem-draghandle">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="noteitem-dot" />
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          placeholder="Escribe aquí..."
          className="noteitem-textarea"
        />
      </UnifiedContainer>
    </WithContextMenu>
  );
}
