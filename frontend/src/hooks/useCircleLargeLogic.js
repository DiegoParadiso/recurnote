import { useState, useEffect, useRef, useCallback } from 'react';
import { useItems } from '@context/ItemsContext';
import { useAuth } from '@context/AuthContext';
import useRotationControls from '@hooks/useRotationControls';
import { formatDateKey } from '@utils/formatDateKey';

export function useCircleLargeLogic(selectedDay, onItemDrag) {
  const { itemsByDate, setItemsByDate, updateItem, deleteItem, flushItemUpdate } = useItems();
  const { user, token } = useAuth();
  
  const containerRef = useRef(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [errorToast, setErrorToast] = useState('');
  
  const rotationSpeed = 2;
  const { onMouseDown, onMouseMove, onMouseUp, prevRotationRef } = useRotationControls({
    containerRef,
    rotationAngle,
    setRotationAngle,
    rotationSpeed,
  });

  // Asegurar que itemsByDate siempre sea un objeto seguro para lecturas
  const safeCombinedItemsByDate = itemsByDate || {};
  
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

  const handleNoteUpdate = useCallback((id, newContent, newPolar, maybeSize, newPosition, cx, cy, extra, opts = {}) => {
    const dateKey = selectedDay ? formatDateKey(selectedDay) : null;
    if (!dateKey) return;

    // Usar updateItem del ItemsContext para todo (tanto servidor como local)
    const changes = {};
    if (Array.isArray(newContent)) changes.content = newContent;
    else if (newContent !== undefined && !Array.isArray(newContent)) changes.content = newContent;
    if (Array.isArray(newPolar)) changes.checked = newPolar;
    if (maybeSize?.width && maybeSize?.height) {
      changes.width = maybeSize.width;
      changes.height = maybeSize.height;
    }
    // Agregar coordenadas x, y cuando newPosition está presente
    if (newPosition?.x !== undefined && newPosition?.y !== undefined) {
      changes.x = newPosition.x;
      changes.y = newPosition.y;
    }
    if (extra && typeof extra === 'object') Object.assign(changes, extra);
    
    if (Object.keys(changes).length) {
      updateItem(id, changes, opts).catch((error) => {
        setErrorToast({ key: 'common.error_update_item' });
      });
    }
  }, [selectedDay, updateItem]);

  const handleDeleteItem = useCallback((id) => {
    const dateKey = selectedDay ? formatDateKey(selectedDay) : null;
    if (!dateKey) return;

    // Usar deleteItem del ItemsContext para todo (tanto servidor como local)
    deleteItem(id).catch((error) => {
      setErrorToast({ key: 'common.error_delete_item' });
    });
  }, [selectedDay, deleteItem]);

  const persistPositionOnDrop = useCallback((id) => {
    const dateKey = selectedDay ? formatDateKey(selectedDay) : null;
    if (!dateKey) return;
    
    const item = (safeCombinedItemsByDate[dateKey] || []).find(i => i.id === id);
    if (!item) return;
    
    // SIEMPRE recalcular posición para mantener consistencia con el círculo
    const angleRad = (item.angle * Math.PI) / 180;
    const x = item.distance * Math.cos(angleRad);
    const y = item.distance * Math.sin(angleRad);
    
    // Usar updateItem del ItemsContext para todo (tanto servidor como local)
    // Marcar como fromDrag: true para que se procese con debounce largo
    updateItem(id, { angle: item.angle, distance: item.distance, x, y }, { fromDrag: true }).catch((error) => {
      setErrorToast({ key: 'common.error_update_position' });
    });
    // Forzar envío inmediato del último payload de posición para evitar rollback al recargar
    flushItemUpdate?.(id);
  }, [selectedDay, safeCombinedItemsByDate, updateItem, flushItemUpdate]);

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
    errorToast,
    setErrorToast,
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
