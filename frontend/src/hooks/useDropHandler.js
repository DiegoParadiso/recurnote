import { useCallback, useState } from 'react';
import { formatDateKey } from '@utils/formatDateKey';
import { useItems } from '@context/ItemsContext';
import { limitPositionInsideScreen } from '@utils/helpers/geometry';

export default function useHandleDrop({
  containerRef,
  selectedDay,
  rotationAngle,
  radius,
  fullboardMode = false,
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
      
      let rotatedX, rotatedY, distance, angle;
      
      if (fullboardMode) {
        // En fullboard mode: coordenadas absolutas desde la esquina superior izquierda
        rotatedX = e.clientX - rect.left;
        rotatedY = e.clientY - rect.top;
        distance = 0; // No importa en fullboard mode
        angle = 0; // No importa en fullboard mode
      } else {
        // Modo normal: coordenadas relativas al centro del círculo con rotación
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        const rad = (rotationAngle * Math.PI) / 180;
        rotatedX = mouseX * Math.cos(rad) + mouseY * Math.sin(rad);
        rotatedY = -mouseX * Math.sin(rad) + mouseY * Math.cos(rad);

        distance = Math.hypot(rotatedX, rotatedY);

        angle = (Math.atan2(rotatedY, rotatedX) * 180) / Math.PI;
        angle = (angle + 360) % 360;
      }

      const source = e.dataTransfer.getData('source');
      const label = e.dataTransfer.getData('label') || 'Nota';
      const itemId = e.dataTransfer.getData('itemId');
      const dateKey = formatDateKey(selectedDay);

      // Fuera del círculo - solo eliminar si es un drop intencional (excepto en fullboard mode)
      if (!fullboardMode && distance > radius) {
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
        // Dimensiones reales de los items para el cálculo de límites en fullboard mode
        const itemWidth = label === 'Tarea' ? 200 : (label === 'Nota' ? 169 : 110);
        const itemHeight = label === 'Tarea' ? 46 : (label === 'Nota' ? 100 : 110);
        
        // En fullboard mode, limitar las coordenadas dentro de la pantalla visible
        let finalX = rotatedX;
        let finalY = rotatedY;
        if (fullboardMode) {
          const limited = limitPositionInsideScreen(rotatedX, rotatedY, itemWidth, itemHeight);
          finalX = limited.x;
          finalY = limited.y;
        }
        
        // ItemsContext maneja automáticamente tanto items locales como del servidor
        addItem({
          date: dateKey,
          x: finalX,
          y: finalY,
          rotation: 0,
          rotation_enabled: true,
          label,
          angle,
          distance,
          content: label === 'Tarea' ? [''] : '',
          ...(label === 'Tarea' ? { checked: [false] } : {}),
          width: itemWidth,
          height: itemHeight,
        }).catch((error) => {
          setErrorToast({ key: 'common.error_create_item' });
        });
        return;
      }

      if (source === 'dropped' && itemId) {
        // Los límites ya fueron aplicados durante el drag en useDragResize
        // Aquí solo guardamos la posición final
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
    [addItem, updateItem, deleteItem, selectedDay, rotationAngle, radius, fullboardMode, onInvalidDrop, containerRef]
  );

  return { handleDrop, errorToast, setErrorToast };
}
