import React from 'react';

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
        color: 'var(--color-text-primary)',
      }}
    >
      {isOverTrash ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zm0 5h2v9H9zm4 0h2v9h-2z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zM7 6h10v13H7zm2 2v9h2V8zm4 0v9h2V8z" />
        </svg>
      )}
    </div>
  );
}