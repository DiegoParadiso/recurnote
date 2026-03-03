import { useState, useEffect, useRef, useCallback } from 'react';
import { useItems } from '@context/ItemsContext';
import { useAuth } from '@context/AuthContext';
import useRotationControls from '@hooks/useRotationControls';
import { formatDateKey } from '@utils/formatDateKey';
import { limitPositionInsideCircle, isItemInsideCircle } from '@utils/helpers/geometry';
import { getItemDimensions } from '@utils/helpers/itemHelpers';

export function useCircleLargeLogic(selectedDay, onItemDrag, radius, isSmallScreen) {
  const { itemsByDate, setItemsByDate, updateItem, deleteItem } = useItems();
  const { user, token } = useAuth();

  const containerRef = useRef(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [errorToast, setErrorToast] = useState('');

  // Asegurar que itemsByDate siempre sea un objeto seguro para lecturas
  const safeCombinedItemsByDate = itemsByDate || {};

  const checkCollision = useCallback((newRotationAngle) => {
    if (isSmallScreen) return false;
    if (!selectedDay) return false;

    const dateKey = formatDateKey(selectedDay);
    const items = safeCombinedItemsByDate[dateKey] || [];
    if (!items.length) return false;

    const circleCenter = { cx: radius, cy: radius };
    const safeRadius = radius - 3;

    for (const item of items) {
      const angleRad = (item.angle * Math.PI) / 180;
      const itemX = radius + item.distance * Math.cos(angleRad);
      const itemY = radius + item.distance * Math.sin(angleRad);
      const { width, height } = getItemDimensions(item);

      if (!isItemInsideCircle(itemX, itemY, width, height, circleCenter, safeRadius, -newRotationAngle)) {
        return true;
      }
    }
    return false;
  }, [isSmallScreen, selectedDay, radius, safeCombinedItemsByDate]);

  const rotationSpeed = 2;
  const { onMouseDown, onMouseMove, onMouseUp, prevRotationRef } = useRotationControls({
    containerRef,
    rotationAngle,
    setRotationAngle,
    rotationSpeed,
    checkCollision,
  });

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
      // Si estamos en fullboard mode (detectado por contexto o flag), deberíamos usar fullboard_x/y
      // Pero handleNoteUpdate no sabe el modo directamente salvo por props/contexto.
      // Vamos a asumir que si newPosition viene, es la posición visual actual.

      // Si el componente que llama a onUpdate pasa 'fullboardMode' en opts o extra, podemos decidir.
      if (isSmallScreen) {
        changes.mobile_x = newPosition.x;
        changes.mobile_y = newPosition.y;
        // No tocamos x, y, angle, distance para no afectar el modo normal
      } else if (extra?.fullboardMode) {
        changes.fullboard_x = newPosition.x;
        changes.fullboard_y = newPosition.y;
        // No tocamos x, y, angle, distance para no afectar el modo normal
      } else {
        changes.x = newPosition.x;
        changes.y = newPosition.y;
      }
    }
    if (extra && typeof extra === 'object') {
      const { fullboardMode, ...restExtra } = extra;
      Object.assign(changes, restExtra);
    }

    if (Object.keys(changes).length) {
      updateItem(id, changes, opts).catch((error) => {
        setErrorToast({ key: 'common.error_update_item' });
      });
    }
  }, [selectedDay, updateItem, isSmallScreen]);

  const handleDeleteItem = useCallback((id) => {
    const dateKey = selectedDay ? formatDateKey(selectedDay) : null;
    if (!dateKey) return;

    // Usar deleteItem del ItemsContext para todo (tanto servidor como local)
    deleteItem(id).catch((error) => {
      setErrorToast({ key: 'common.error_delete_item' });
    });
  }, [selectedDay, deleteItem]);

  const handleItemDrop = (id) => {
    // No persistir inmediatamente; dejar que el debounce por inactividad haga el guardado
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
