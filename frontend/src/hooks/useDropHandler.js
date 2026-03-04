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

        // Calcular polar coords también en fullboard mode (relativo al centro de la pantalla/contenedor)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const dx = rotatedX - centerX;
        const dy = rotatedY - centerY;
        distance = Math.hypot(dx, dy);
        angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        angle = (angle + 360) % 360;
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
        const isNota = label.toLowerCase() === 'nota';
        const itemWidth = label === 'Tarea' ? 200 : (isNota ? 200 : 110);
        const itemHeight = label === 'Tarea' ? 46 : (isNota ? 100 : 110);

        // En fullboard mode, limitar las coordenadas dentro de la pantalla visible
        let finalX = rotatedX;
        let finalY = rotatedY;
        if (fullboardMode) {
          const limited = limitPositionInsideScreen(rotatedX, rotatedY, itemWidth, itemHeight);
          finalX = limited.x;
          finalY = limited.y;
        }

        // ItemsContext maneja automáticamente tanto items locales como del servidor
        const newItemData = {
          date: dateKey,
          rotation: 0,
          rotation_enabled: true,
          label,
          content: label === 'Tarea' ? [''] : '',
          ...(label === 'Tarea' ? { checked: [false] } : {}),
          width: itemWidth,
          height: itemHeight,
        };

        if (fullboardMode) {
          // Primario: fullboard coords
          newItemData.fullboard_x = finalX;
          newItemData.fullboard_y = finalY;

          // Cross-save: calcular angle/distance para modo normal
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const dx = finalX - centerX;
          const dy = finalY - centerY;
          const dist = Math.hypot(dx, dy);
          const ang = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
          const safeRadius = radius < 10000 ? radius * 0.75 : Math.min(centerX, centerY) * 0.65;
          newItemData.angle = ang;
          newItemData.distance = Math.min(dist, safeRadius);
          const angleRad = (ang * Math.PI) / 180;
          newItemData.x = centerX + newItemData.distance * Math.cos(angleRad);
          newItemData.y = centerY + newItemData.distance * Math.sin(angleRad);
        } else {
          // Primario: angle/distance + x/y para modo normal
          newItemData.x = finalX;
          newItemData.y = finalY;
          newItemData.angle = angle;
          newItemData.distance = distance;

          // Cross-save: mapear a pantalla para fullboard
          const screenCenterX = typeof window !== 'undefined' ? window.innerWidth / 2 : 400;
          const screenCenterY = typeof window !== 'undefined' ? window.innerHeight / 2 : 300;
          const offsetX = finalX - rect.width / 2;
          const offsetY = finalY - rect.height / 2;
          const maxSafeOffset = Math.min(screenCenterX, screenCenterY) * 0.7;
          const norm = Math.hypot(offsetX, offsetY) + 1;
          const scale = Math.min(1, maxSafeOffset / norm);
          newItemData.fullboard_x = screenCenterX + offsetX * scale;
          newItemData.fullboard_y = screenCenterY + offsetY * scale;
        }

        addItem(newItemData).catch((error) => {
          setErrorToast({ key: 'common.error_create_item' });
        });
        return;
      }

      if (source === 'dropped' && itemId) {
        // Los límites ya fueron aplicados durante el drag en useDragResize
        // Guardar posición final + cross-save para que ambos modos queden sincronizados.
        const updateData = {};
        if (fullboardMode) {
          // Primario: fullboard coords
          updateData.fullboard_x = rotatedX;
          updateData.fullboard_y = rotatedY;

          // Cross-save: calcular angle/distance desde el centro del contenedor para modo normal
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const dx = rotatedX - centerX;
          const dy = rotatedY - centerY;
          const dist = Math.hypot(dx, dy);
          const ang = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
          // Limitar distancia al 75% del radio disponible en modo normal
          const safeRadius = radius < 10000 ? radius * 0.75 : Math.min(centerX, centerY) * 0.65;
          updateData.angle = ang;
          updateData.distance = Math.min(dist, safeRadius);
          const angleRad = (ang * Math.PI) / 180;
          updateData.x = centerX + updateData.distance * Math.cos(angleRad);
          updateData.y = centerY + updateData.distance * Math.sin(angleRad);
        } else {
          // Primario: angle/distance + x/y para modo normal
          updateData.x = rotatedX;
          updateData.y = rotatedY;
          updateData.angle = angle;
          updateData.distance = distance;

          // Cross-save: mapear posición normal a coords de pantalla para fullboard
          const screenCenterX = typeof window !== 'undefined' ? window.innerWidth / 2 : 400;
          const screenCenterY = typeof window !== 'undefined' ? window.innerHeight / 2 : 300;
          const circleCenterX = rect.left + rect.width / 2;
          const circleCenterY = rect.top + rect.height / 2;
          const offsetX = rotatedX - rect.width / 2;
          const offsetY = rotatedY - rect.height / 2;
          const maxSafeOffset = Math.min(screenCenterX, screenCenterY) * 0.7;
          const norm = Math.hypot(offsetX, offsetY) + 1;
          const scale = Math.min(1, maxSafeOffset / norm);
          updateData.fullboard_x = screenCenterX + offsetX * scale;
          updateData.fullboard_y = screenCenterY + offsetY * scale;
        }

        updateItem(itemId, updateData).catch((error) => {
          setErrorToast({ key: 'common.error_update_item' });
        });
        return;
      }
    },
    [addItem, updateItem, deleteItem, selectedDay, rotationAngle, radius, fullboardMode, onInvalidDrop, containerRef]
  );

  return { handleDrop, errorToast, setErrorToast };
}
