import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function DragTrashZone({ isActive, isOverTrash, onItemDrop, draggedItem }) {
  const { isLightTheme } = useTheme();
  
  // Filtro para adaptar iconos al tema
  const iconFilter = isLightTheme 
    ? 'brightness(0) saturate(100%)' // Negro para tema claro
    : 'brightness(0) saturate(100%) invert(1)'; // Blanco para tema oscuro

  if (!isActive) return null;

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedItem && onItemDrop) {
      onItemDrop();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 5,
        left: 25,
        transform: 'translateX(-50%)',
        width: 60,
        height: 60,
        zIndex: 'var(--z-floating)',
        pointerEvents: isActive ? 'auto' : 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'var(--color-text-primary)',
        cursor: isActive ? 'pointer' : 'default',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '50%',
        transition: 'all 0.2s ease',
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {isOverTrash ? (
        <img 
          src="/assets/postdelete.svg" 
          alt="Delete Active" 
          width="30" 
          height="30"
          style={{ filter: iconFilter }}
        />
      ) : (
        <img 
          src="/assets/delete.svg" 
          alt="Delete" 
          width="30" 
          height="30"
          style={{ filter: iconFilter }}
        />
      )}
    </div>
  );
}