import React from 'react';

function NoteContainer({ x, y, rotation, children }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        maxWidth: '240px',
        maxHeight: '230px',
        minWidth: '120px',
        cursor: 'default',
        overflow: 'hidden', // <--- Importante para evitar que el contenido se salga
      }}
      className="draggable-note relative rounded-md p-2 border bg-neutral-100 backdrop-blur-md flex flex-col justify-between"
    >
      {children}
    </div>
  );
}

export default NoteContainer;
