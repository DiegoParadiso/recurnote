import React from 'react';
import { useRightClickHandler } from '../../hooks/useRightClickHandler';

export default function WithContextMenu({ onDelete, children }) {
  const handleContextMenu = useRightClickHandler(onDelete);

  return (
    <div onContextMenu={handleContextMenu}>
      {children}
    </div>
  );
}
