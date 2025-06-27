import React from 'react';

function NoteContainer({ x, y, rotation, children, draggable, onDragStart, style }) {
  return (
    <div
      style={{
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      maxWidth: '400px',
      maxHeight: '400px',
      minWidth: '120px',
      cursor: draggable ? 'grab' : 'default',
      overflow: 'visible',
      ...style,
    }}
      className="draggable-note relative rounded-md pt-2 pr-2 pb-2 pl-2 border bg-neutral-100 backdrop-blur-md flex flex-col justify-between"
      draggable={draggable}
      onDragStart={onDragStart}
    >
      {children}
    </div>
  );
}

export default NoteContainer;