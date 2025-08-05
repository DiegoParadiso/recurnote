import React from 'react';
import trashOpen from '../../assets/trash-open.svg';
import trashClosed from '../../assets/trash-closed.svg';

export default function DragTrashZone({ isActive, isOverTrash }) {
  if (!isActive) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 5, 
        left: 25,
        transform: 'translateX(-50%)',
        width: 50,
        height: 50,
        zIndex: 100,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <img
        src={isOverTrash ? trashClosed : trashOpen}
        alt="Papelera"
        style={{ width: '60%', height: '60%' }}
        draggable={false}
        />
    </div>
  );
}
