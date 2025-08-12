import { useState, useEffect, useRef } from 'react';
import { useItems } from '../context/ItemsContext';
import useHandleDrop from './useDropHandler';
import useRotationControls from './useRotationControls';
import { formatDateKey } from '../utils/formatDateKey';

export function useCircleLargeLogic(selectedDay, onItemDrag, onItemDrop) {
  const { itemsByDate, setItemsByDate, updateItem, deleteItem } = useItems();
  
  const containerRef = useRef(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  
  const rotationSpeed = 2;
  const { onMouseDown, onMouseMove, onMouseUp, prevRotationRef } = useRotationControls({
    containerRef,
    rotationAngle,
    setRotationAngle,
    rotationSpeed,
  });

  const debounceTimersRef = useRef(new Map());
  
  const scheduleUpdate = (id, changes, delayMs = 500) => {
    const timers = debounceTimersRef.current;
    if (timers.has(id)) clearTimeout(timers.get(id));
    const t = setTimeout(() => {
      updateItem(id, changes).catch(() => {});
      timers.delete(id);
    }, delayMs);
    timers.set(id, t);
  };

  useEffect(() => {
    const delta = (rotationAngle - prevRotationRef.current + 360) % 360;
    if (delta !== 0 && selectedDay) {
      const dateKey = formatDateKey(selectedDay);
      setItemsByDate((prev) => ({
        ...prev,
        [dateKey]: (prev[dateKey] || []).map((item) => ({
          ...item,
          angle: (item.angle + delta) % 360,
        })),
      }));
    }
    prevRotationRef.current = rotationAngle;
  }, [rotationAngle, selectedDay, setItemsByDate, prevRotationRef]);

  const handleNoteDragStart = (e, itemId) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('source', 'dropped');
      e.dataTransfer.setData('itemId', String(itemId));
    }
  };

  const handleNoteUpdate = (id, newContent, newPolar, maybeSize, newPosition, cx, cy, extra) => {
    const dateKey = selectedDay ? formatDateKey(selectedDay) : null;
    if (!dateKey) return;

    setItemsByDate((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item };

        if (Array.isArray(newContent)) {
          updated.content = newContent;
          if (Array.isArray(newPolar)) updated.checked = newPolar;
        } else if (newContent !== undefined) {
          updated.content = newContent;
        }

        if (maybeSize?.width && maybeSize?.height) {
          updated.width = maybeSize.width;
          updated.height = maybeSize.height;
        }
        
        if (newPolar && typeof newPolar === 'object' && !Array.isArray(newPolar)) {
          updated.angle = newPolar.angle ?? item.angle;
          updated.distance = newPolar.distance ?? item.distance;
        }
        
        if (newPosition) {
          const dx = newPosition.x - cx;
          const dy = newPosition.y - cy;
          const radians = (-rotationAngle * Math.PI) / 180;
          const rotatedX = dx * Math.cos(radians) - dy * Math.sin(radians);
          const rotatedY = dx * Math.sin(radians) + dy * Math.cos(radians);
          const angle = (Math.atan2(rotatedY, rotatedX) * 180) / Math.PI;
          updated.angle = (angle + rotationAngle + 360) % 360;
          updated.distance = Math.sqrt(rotatedX ** 2 + rotatedY ** 2);
        }
        
        if (extra && typeof extra === 'object') {
          Object.assign(updated, extra);
        }
        return updated;
      }),
    }));

    const idIsNumeric = typeof id === 'number' && Number.isFinite(id);
    if (!idIsNumeric) return;

    const changes = {};
    if (Array.isArray(newContent)) changes.content = newContent;
    else if (newContent !== undefined && !Array.isArray(newContent)) changes.content = newContent;
    if (Array.isArray(newPolar)) changes.checked = newPolar;
    if (maybeSize?.width && maybeSize?.height) {
      changes.width = maybeSize.width;
      changes.height = maybeSize.height;
    }
    if (extra && typeof extra === 'object') Object.assign(changes, extra);
    if (Object.keys(changes).length) scheduleUpdate(id, changes, 500);
  };

  const handleDeleteItem = (id) => {
    const dateKey = selectedDay ? formatDateKey(selectedDay) : null;
    if (!dateKey) return;

    setItemsByDate((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].filter((item) => item.id !== id),
    }));
    
    const idIsNumeric = typeof id === 'number' && Number.isFinite(id);
    if (idIsNumeric) deleteItem(id).catch(() => {});
  };

  const persistPositionOnDrop = (id) => {
    const idIsNumeric = typeof id === 'number' && Number.isFinite(id);
    if (!idIsNumeric) return;
    
    const dateKey = selectedDay ? formatDateKey(selectedDay) : null;
    if (!dateKey) return;
    
    const item = (itemsByDate[dateKey] || []).find(i => i.id === id);
    if (!item) return;
    
    const angleRad = (item.angle * Math.PI) / 180;
    const x = item.distance * Math.cos(angleRad);
    const y = item.distance * Math.sin(angleRad);
    updateItem(id, { angle: item.angle, distance: item.distance, x, y }).catch(() => {});
  };

  const handleItemDrop = (id) => {
    onItemDrop?.(id);
    persistPositionOnDrop(id);
  };

  // El manejo de drop depende del radius del círculo,
  // por lo que se configura desde el componente padre.

  return {
    containerRef,
    rotationAngle,
    setRotationAngle,
    toastMessage,
    setToastMessage,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    handleNoteDragStart,
    handleNoteUpdate,
    handleDeleteItem,
    handleItemDrop,
    itemsByDate,
    setItemsByDate,
  };
}
