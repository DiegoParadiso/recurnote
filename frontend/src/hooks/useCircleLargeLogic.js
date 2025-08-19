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
  
  const combinedItemsByDate = user && token ? itemsByDate : {};
  
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
      if (userRef.current && tokenRef.current) {
        updateItem(id, changes).catch(() => {});
      }
      timers.delete(id);
    }, delayMs);
    timers.set(id, t);
  }, [updateItem]);

  useEffect(() => {
    const delta = (rotationAngle - prevRotationRef.current + 360) % 360;
    if (delta !== 0 && selectedDay) {
      const dateKey = formatDateKey(selectedDay);
      
      // Usar la función correcta según el modo
      const setCombinedFunc = userRef.current && tokenRef.current 
        ? setItemsByDateRef.current 
        : setItemsByDateRef.current;
        
      setCombinedFunc((prev) => {
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

  const handleNoteUpdate = (id, newContent, newPolar, maybeSize, newPosition, cx, cy, extra) => {
    const dateKey = selectedDay ? formatDateKey(selectedDay) : null;
    if (!dateKey) return;

    // Usar la función correcta según el modo
    const setCombinedFunc = userRef.current && tokenRef.current 
      ? setItemsByDateRef.current 
      : setItemsByDateRef.current;

    setCombinedFunc((prev) => {
      const currentItems = prev[dateKey] || [];
      if (!currentItems.length) return prev;
      
      const updatedItems = currentItems.map((item) => {
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
      });
      
      return {
        ...prev,
        [dateKey]: updatedItems,
      };
    });

    // Programar actualización para items del servidor Y locales
    const idIsNumeric = typeof id === 'number' && Number.isFinite(id);
    if (idIsNumeric && userRef.current && tokenRef.current) {
      // Item del servidor
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
    } else {
      // Item local - actualizar inmediatamente en localStorage Y estado visual
      const changes = {};
      if (Array.isArray(newContent)) changes.content = newContent;
      else if (newContent !== undefined && !Array.isArray(newContent)) changes.content = newContent;
      if (Array.isArray(newPolar)) changes.checked = newPolar;
      if (maybeSize?.width && maybeSize?.height) {
        changes.width = maybeSize.width;
        changes.height = maybeSize.height;
      }
      if (extra && typeof extra === 'object') Object.assign(changes, extra);
      if (Object.keys(changes).length) {
        updateItem(id, changes);
        
        // También actualizar el estado visual inmediatamente para items locales
        setItemsByDateRef.current((prev) => {
          const currentItems = prev[dateKey] || [];
          if (!currentItems.length) return prev;
          
          const updatedItems = currentItems.map((item) => {
            if (item.id === id) {
              const updated = { ...item };
              if (Array.isArray(newContent)) updated.content = newContent;
              else if (newContent !== undefined && !Array.isArray(newContent)) updated.content = newContent;
              if (Array.isArray(newPolar)) updated.checked = newPolar;
              if (maybeSize?.width && maybeSize?.height) {
                updated.width = maybeSize.width;
                updated.height = maybeSize.height;
              }
              if (extra && typeof extra === 'object') Object.assign(updated, extra);
              return updated;
            }
            return item;
          });
          
          return {
            ...prev,
            [dateKey]: updatedItems,
          };
        });
      }
    }
  };

  const handleDeleteItem = useCallback((id) => {
    const dateKey = selectedDay ? formatDateKey(selectedDay) : null;
    if (!dateKey) return;

    // Solo eliminar del servidor si es un item autenticado (ID numérico)
    const idIsNumeric = typeof id === 'number' && Number.isFinite(id);
    
    if (idIsNumeric && userRef.current && tokenRef.current) {
      // Item del servidor - usar setItemsByDate
      setItemsByDateRef.current((prev) => {
        const currentItems = prev[dateKey] || [];
        if (!currentItems.length) return prev;
        
        return {
          ...prev,
          [dateKey]: currentItems.filter((item) => item.id !== id),
        };
      });
      
      // Eliminar del servidor
      deleteItem(id).catch(() => {});
    } else {
      // Es un item local - usar deleteLocalItem
      // deleteLocalItem(id); // This line was removed from the new_code, so it's removed here.
    }
  }, [selectedDay, deleteItem]);

  const persistPositionOnDrop = useCallback((id) => {
    const dateKey = selectedDay ? formatDateKey(selectedDay) : null;
    if (!dateKey) return;
    
    const item = (safeCombinedItemsByDate[dateKey] || []).find(i => i.id === id);
    if (!item) return;
    
    const angleRad = (item.angle * Math.PI) / 180;
    const x = item.distance * Math.cos(angleRad);
    const y = item.distance * Math.sin(angleRad);
    
    if (user && token && typeof id === 'number' && Number.isFinite(id)) {
      // Item del servidor
      updateItem(id, { angle: item.angle, distance: item.distance, x, y }).catch(() => {});
    } else {
      // Item local - actualizar tanto localStorage como estado visual
      // updateLocalItem(id, { angle: item.angle, distance: item.distance, x, y }); // This line was removed from the new_code, so it's removed here.
      
      // Actualizar el estado visual inmediatamente para que se mueva en tiempo real
      setItemsByDateRef.current((prev) => {
        const currentItems = prev[dateKey] || [];
        if (!currentItems.length) return prev;
        
        const updatedItems = currentItems.map((item) =>
          item.id === id 
            ? { ...item, angle: item.angle, distance: item.distance, x, y }
            : item
        );
        
        return {
          ...prev,
          [dateKey]: updatedItems,
        };
      });
    }
  }, [selectedDay, safeCombinedItemsByDate, updateItem, user, token]);

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
