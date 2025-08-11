import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { useItems } from '../context/ItemsContext';

export function useHomeLogic() {
  const { itemsByDate, setItemsByDate, addItem } = useItems();
  
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [isRightSidebarPinned, setIsRightSidebarPinned] = useState(false);
  const [isLeftSidebarPinned, setIsLeftSidebarPinned] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [isOverTrash, setIsOverTrash] = useState(false);

  const [displayOptions, setDisplayOptions] = useState({
    year: true,
    month: true,
    week: false,
    weekday: true,
    day: true,
    time: false,
    timeZone: 'America/Argentina/Buenos_Aires',
    timeFormat: '24h'
  });

  function isOverTrashZone(pos) {
    if (!pos) return false;
    const trashX = 0;
    const trashY = 5;
    const trashWidth = 80;
    const trashHeight = 80;

    return (
      pos.x >= trashX &&
      pos.x <= trashX + trashWidth &&
      pos.y >= trashY &&
      pos.y <= trashY + trashHeight
    );
  }

  useEffect(() => {
    setIsOverTrash(isOverTrashZone(draggedItem));
  }, [draggedItem]);

  async function handleSelectItem(item, dateKey) {
    if (!dateKey) {
      alert('Seleccioná un día primero');
      return;
    }

    const angle = Math.random() * 360;
    const distance = 120;
    const rad = (angle * Math.PI) / 180;
    const x = distance * Math.cos(rad);
    const y = distance * Math.sin(rad);

    const newItem = {
      label: item.label,
      angle,
      distance,
      content: item.label === 'Tarea' ? [''] : '',
      ...(item.label === 'Tarea' && { checked: [false] }),
      width: item.label === 'Tarea' ? 200 : 100,
      height: item.label === 'Tarea' ? 150 : 100,
    };

    try {
      await addItem({
        date: dateKey,
        x,
        y,
        rotation: 0,
        rotation_enabled: true,
        ...newItem,
      });
    } catch {}
  }

  return {
    showRightSidebar,
    setShowRightSidebar,
    showLeftSidebar,
    setShowLeftSidebar,
    showConfig,
    setShowConfig,
    isRightSidebarPinned,
    setIsRightSidebarPinned,
    isLeftSidebarPinned,
    setIsLeftSidebarPinned,
    draggedItem,
    setDraggedItem,
    isOverTrash,
    setIsOverTrash,
    displayOptions,
    setDisplayOptions,
    handleSelectItem,
    itemsByDate,
    setItemsByDate,
  };
}
