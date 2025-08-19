import { useState, useEffect, useRef, useCallback } from 'react';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';
import useHandleDrop from './useDropHandler';
import useRotationControls from './useRotationControls';
import { formatDateKey } from '../utils/formatDateKey';

export function useCircleLargeLogic(selectedDay, onItemDrag) {
  const { itemsByDate, setItemsByDate, updateItem, deleteItem } = useItems();
  const { user, token } = useAuth();
  
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
  
  const combinedItemsByDate = itemsByDate || {};
  
  // Asegurar que combinedItemsByDate siempre sea un objeto
  const safeCombinedItemsByDate = combinedItemsByDate || {};
  
  // Usar refs para evitar recreación de funciones
  const setItemsByDateRef = useRef(setItemsByDate);
  const userRef = useRef(user);
  const tokenRef = useRef(token);
  const onItemDragRef = useRef(onItemDrag);

  useEffect(() => {
    setItemsByDateRef.current = setItemsByDate;
    userRef.current = user;
    tokenRef.current = token;
    onItemDragRef.current = onItemDrag;
  }, [setItemsByDate, user, token, onItemDrag]);
  
  const scheduleUpdate = useCallback((id, changes, delayMs = 500) => {
    const timers = debounceTimersRef.current;
    if (timers.has(id)) clearTimeout(timers.get(id));
    const t = setTimeout(() => {
      // Usar updateItem del ItemsContext para todo (tanto servidor como local)
      updateItem(id, changes).catch((error) => {
        console.error('Error updating item:', error);
      });
      timers.delete(id);
    }, delayMs);
    timers.set(id, t);
  }, [updateItem]);

  useEffect(() => {
    const delta = (rotationAngle - prevRotationRef.current + 360) % 360;
    if (delta !== 0 && selectedDay) {
      const dateKey = formatDateKey(selectedDay);
      
      // Actualizar el estado visual inmediatamente para todos los items
      setItemsByDateRef.current((prev) => {
        const currentItems = prev[dateKey] || [];
        if (!currentItems.length) return prev;
        
        const updatedItems = currentItems.map((item) => ({
          ...item,
          angle: (item.angle + delta) % 360,
        }));
        
        return {
          ...prev,
          [dateKey]: updatedItems,
        };
      });
    }
    prevRotationRef.current = rotationAngle;
  }, [rotationAngle, selectedDay]);

  const handleNoteDragStart = (e, itemId) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('source', 'dropped');
      e.dataTransfer.setData('itemId', String(itemId));
    }
  };

  const handleNoteUpdate = useCallback((id, newContent, newPolar, maybeSize, newPosition, cx, cy, extra) => {
    const dateKey = selectedDay ? formatDateKey(selectedDay) : null;
    if (!dateKey) return;

    console.log('🔍 handleNoteUpdate llamado:', { id, newContent, newPolar, maybeSize, newPosition, extra });

    // Usar updateItem del ItemsContext para todo (tanto servidor como local)
    const changes = {};
    if (Array.isArray(newContent)) changes.content = newContent;
    else if (newContent !== undefined && !Array.isArray(newContent)) changes.content = newContent;
    if (Array.isArray(newPolar)) changes.checked = newPolar;
    if (maybeSize?.width && maybeSize?.height) {
      changes.width = maybeSize.width;
      changes.height = maybeSize.height;
    }
    if (extra && typeof extra === 'object') Object.assign(changes, extra);
    
    console.log('🔍 Cambios a aplicar:', changes);
    
    if (Object.keys(changes).length) {
      updateItem(id, changes).catch((error) => {
        console.error('Error updating item:', error);
      });
    }
  }, [selectedDay, updateItem]);

  const handleDeleteItem = useCallback((id) => {
    const dateKey = selectedDay ? formatDateKey(selectedDay) : null;
    if (!dateKey) return;

    // Usar deleteItem del ItemsContext para todo (tanto servidor como local)
    deleteItem(id).catch((error) => {
      console.error('Error deleting item:', error);
    });
  }, [selectedDay, deleteItem]);

  const persistPositionOnDrop = useCallback((id) => {
    const dateKey = selectedDay ? formatDateKey(selectedDay) : null;
    if (!dateKey) return;
    
    const item = (safeCombinedItemsByDate[dateKey] || []).find(i => i.id === id);
    if (!item) return;
    
    const angleRad = (item.angle * Math.PI) / 180;
    const x = item.distance * Math.cos(angleRad);
    const y = item.distance * Math.sin(angleRad);
    
    // Usar updateItem del ItemsContext para todo (tanto servidor como local)
    updateItem(id, { angle: item.angle, distance: item.distance, x, y }).catch((error) => {
      console.error('Error updating item position:', error);
    });
  }, [selectedDay, safeCombinedItemsByDate, updateItem]);

  const handleItemDrop = (id) => {
    // Solo persistir la posición, no llamar a onItemDrop del componente padre
    persistPositionOnDrop(id);
    
    // También llamar al onItemDrop del componente padre si existe
    if (onItemDragRef.current) {
      onItemDragRef.current(id, { action: 'drop' });
    }
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
    itemsByDate: safeCombinedItemsByDate,
    setItemsByDate: setItemsByDateRef.current,
  };
}
