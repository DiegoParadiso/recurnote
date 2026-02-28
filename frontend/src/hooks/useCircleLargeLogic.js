import { useState, useEffect, useRef, useCallback } from 'react';
import { useItems } from '@context/ItemsContext';
import { useAuth } from '@context/AuthContext';
import useRotationControls from '@hooks/useRotationControls';
import { formatDateKey } from '@utils/formatDateKey';
import { limitPositionInsideCircle } from '@utils/helpers/geometry';
import { getItemDimensions } from '@utils/helpers/itemHelpers';

export function useCircleLargeLogic(selectedDay, onItemDrag, radius, isSmallScreen) {
  const { itemsByDate, setItemsByDate, updateItem, deleteItem } = useItems();
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

        const updatedItems = currentItems.map((item) => {
          const newAngle = (item.angle + delta) % 360;

          // Calcular posición tentativa con el nuevo ángulo
          // Nota: cx y cy son relativos al centro del círculo para el cálculo de limitPositionInsideCircle
          // Asumimos que el centro es (radius, radius) si no se pasa explícitamente,
          // pero limitPositionInsideCircle espera coordenadas absolutas si se usa en contexto de pantalla completa,
          // o relativas al contenedor si es un círculo.
          // En este caso, ItemsOnCircle calcula x/y basado en cx/cy del contenedor.
          // Para simplificar, simulamos un centro en (0,0) para la lógica de "dentro del círculo"
          // o mejor, usamos la distancia directamente.

          // Sin embargo, limitPositionInsideCircle verifica las esquinas del item (rectangular).
          // Necesitamos convertir polar -> cartesiano, verificar, y si cambia, actualizar distancia.

          // El radio del círculo visual es 'radius'.
          // El centro del círculo visual es (radius, radius) aproximadamente (ignorando bordes).
          // Vamos a usar un centro ficticio grande para evitar problemas de bordes negativos si fuera necesario,
          // pero lo más correcto es usar el radio que nos pasan.

          const circleCenter = { cx: radius, cy: radius };
          const angleRad = (newAngle * Math.PI) / 180;

          // Posición tentativa relativa al centro del círculo
          const tentativeX = radius + item.distance * Math.cos(angleRad);
          const tentativeY = radius + item.distance * Math.sin(angleRad);

          const { width, height } = getItemDimensions(item);

          // Verificar y limitar
          const limited = limitPositionInsideCircle(
            tentativeX,
            tentativeY,
            width,
            height,
            circleCenter,
            radius,
            isSmallScreen,
            newAngle
          );

          // Si la posición fue limitada, recalculamos la distancia
          let newDistance = item.distance;
          if (limited.x !== tentativeX || limited.y !== tentativeY) {
            const dx = limited.x - radius;
            const dy = limited.y - radius;
            newDistance = Math.sqrt(dx * dx + dy * dy);
          }

          return {
            ...item,
            angle: newAngle,
            distance: newDistance,
          };
        });

        return {
          ...prev,
          [dateKey]: updatedItems,
        };
      });
    }
    prevRotationRef.current = rotationAngle;
  }, [rotationAngle, selectedDay, radius, isSmallScreen]);

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
