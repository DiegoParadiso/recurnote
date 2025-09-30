import { useCallback, useState } from 'react';
import { formatDateKey } from '../utils/formatDateKey';
import { useItems } from '../context/ItemsContext';

export default function useHandleDrop({
  containerRef,
  selectedDay,
  rotationAngle,
  radius,
  onInvalidDrop,
}) {
  const { addItem, updateItem, deleteItem } = useItems();
  const [errorToast, setErrorToast] = useState('');

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();

      if (!containerRef.current || !selectedDay) {
        if (typeof onInvalidDrop === 'function') {
          onInvalidDrop();
        }
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      const rad = (rotationAngle * Math.PI) / 180;
      let rotatedX = mouseX * Math.cos(rad) + mouseY * Math.sin(rad);
      let rotatedY = -mouseX * Math.sin(rad) + mouseY * Math.cos(rad);

      const distance = Math.hypot(rotatedX, rotatedY);

      let angle = (Math.atan2(rotatedY, rotatedX) * 180) / Math.PI;
      angle = (angle + 360) % 360;

      const source = e.dataTransfer.getData('source');
      const label = e.dataTransfer.getData('label') || 'Nota';
      const itemId = e.dataTransfer.getData('itemId');
      const dateKey = formatDateKey(selectedDay);

      // Fuera del círculo - solo eliminar si es un drop intencional
      if (distance > radius) {
        if (source === 'dropped' && itemId) {
          // Solo eliminar si realmente se está arrastrando fuera del círculo intencionalmente
          // ItemsContext maneja automáticamente tanto items locales como del servidor
          deleteItem(itemId).catch((error) => {
            setErrorToast({ key: 'common.error_delete_item' });
          });
          return;
        }
        if (source === 'sidebar') {
          if (typeof onInvalidDrop === 'function') onInvalidDrop();
          return;
        }
      }

      // Dentro del círculo
      if (source === 'sidebar') {
        // ItemsContext maneja automáticamente tanto items locales como del servidor
        addItem({
          date: dateKey,
          x: rotatedX,
          y: rotatedY,
          rotation: 0,
          rotation_enabled: true,
          label,
          angle,
          distance,
          content: label === 'Tarea' ? [''] : '',
          ...(label === 'Tarea' ? { checked: [false] } : {}),
          width: label === 'Tarea' ? 200 : 100,
          height: label === 'Tarea' ? 150 : 100,
        }).catch((error) => {
          setErrorToast({ key: 'common.error_create_item' });
        });
        return;
      }

      if (source === 'dropped' && itemId) {
        // ItemsContext maneja automáticamente tanto items locales como del servidor
        updateItem(itemId, {
          x: rotatedX,
          y: rotatedY,
          angle,
          distance,
        }).catch((error) => {
          setErrorToast({ key: 'common.error_update_item' });
        });
        return;
      }
    },
    [addItem, updateItem, deleteItem, selectedDay, rotationAngle, radius, onInvalidDrop, containerRef]
  );

  return { handleDrop, errorToast, setErrorToast };
}
