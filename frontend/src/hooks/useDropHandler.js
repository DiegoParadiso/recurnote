import { useCallback } from 'react';
import formatDateKey from '../utils/formatDateKey';

export default function useHandleDrop({
  containerRef,
  setItemsByDate,
  selectedDay,
  rotationAngle,
  radius,
  onInvalidDrop,
}) {
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

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

      let distance = Math.hypot(rotatedX, rotatedY);
      if (distance > radius) {
        const scale = radius / distance;
        rotatedX *= scale;
        rotatedY *= scale;
        distance = radius;
      }

      let angle = (Math.atan2(rotatedY, rotatedX) * 180) / Math.PI;
      angle = (angle + 360) % 360;

      const source = e.dataTransfer.getData('source');
      const label = e.dataTransfer.getData('label') || 'Nota';
      const itemId = e.dataTransfer.getData('itemId');
      const dateKey = formatDateKey(selectedDay);

      setItemsByDate((prev) => {
        const itemsForDate = prev[dateKey] || [];
        if (source === 'sidebar') {
          // Nuevo ítem
          const newItem = {
            id: Date.now(),
            label,
            angle,
            distance,
            content: label === 'Tarea' ? [''] : '',
            checked: label === 'Tarea' ? [false] : undefined,
            width: label === 'Tarea' ? 200 : 100,
            height: label === 'Tarea' ? 150 : 100,
          };

          return {
            ...prev,
            [dateKey]: [...itemsForDate, newItem],
          };
        } else if (source === 'dropped' && itemId) {
          // Actualizar posición item existente
          const exists = itemsForDate.find((it) => it.id.toString() === itemId);
          if (!exists) return prev;

          const updatedItems = itemsForDate.map((it) =>
            it.id.toString() === itemId
              ? { ...it, angle, distance }
              : it
          );

          return {
            ...prev,
            [dateKey]: updatedItems,
          };
        }

        return prev; // Fuente desconocida, no cambia nada
      });
    },
    [containerRef, selectedDay, rotationAngle, radius, setItemsByDate, onInvalidDrop]
  );

  return handleDrop;
}
