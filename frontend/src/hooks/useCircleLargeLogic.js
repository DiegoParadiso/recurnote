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

    // Guardar posición cruzada: cada modo guarda AMBOS conjuntos de coordenadas
    // para que al cambiar de modo el item aparezca en una posición razonable.
    if (newPosition?.x !== undefined && newPosition?.y !== undefined) {
      const px = newPosition.x;
      const py = newPosition.y;

      if (isSmallScreen) {
        // Mobile: solo actualiza mobile coords
        changes.mobile_x = px;
        changes.mobile_y = py;

      } else if (extra?.fullboardMode) {
        // Fullboard mode: guardar fullboard_x/y
        changes.fullboard_x = px;
        changes.fullboard_y = py;

        // Cross-save: calcular angle/distance equivalentes desde el centro del viewport
        // para que normal mode pueda posicionar el item si se sale de fullboard
        if (typeof cx === 'number' && typeof cy === 'number') {
          const dx = px - cx;
          const dy = py - cy;
          const dist = Math.hypot(dx, dy);
          const ang = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
          // Limitar distancia para que quede dentro del círculo en modo normal
          const safeRadius = typeof radius === 'number' ? radius * 0.75 : dist;
          changes.angle = ang;
          changes.distance = Math.min(dist, safeRadius);
          // También guardar x/y absolutos para consistencia
          const angleRad = (ang * Math.PI) / 180;
          changes.x = cx + changes.distance * Math.cos(angleRad);
          changes.y = cy + changes.distance * Math.sin(angleRad);
        }

      } else {
        // Normal mode: guardar x/y + angle/distance
        changes.x = px;
        changes.y = py;

        // Cross-save: calcular fullboard_x/y mapeando desde coordenadas del círculo a pantalla
        if (typeof cx === 'number' && typeof cy === 'number') {
          // cx/cy son el centro del círculo en coordenadas locales.
          // Para fullboard, el centro de la pantalla es window.innerWidth/2, window.innerHeight/2.
          const screenCenterX = typeof window !== 'undefined' ? window.innerWidth / 2 : 400;
          const screenCenterY = typeof window !== 'undefined' ? window.innerHeight / 2 : 300;
          const offsetX = px - cx;
          const offsetY = py - cy;
          // Escalar para que quede visible en la pantalla
          const scale = Math.min(1, Math.min(screenCenterX, screenCenterY) / (Math.hypot(offsetX, offsetY) + 1));
          changes.fullboard_x = screenCenterX + offsetX * scale;
          changes.fullboard_y = screenCenterY + offsetY * scale;
        }
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
  }, [selectedDay, updateItem, isSmallScreen, radius]);

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
