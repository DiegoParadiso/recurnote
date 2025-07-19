import { useCallback } from 'react';
import formatDateKey from '../utils/formatDateKey';

export default function useHandleDrop({
  containerRef,
  itemsByDate,
  setItemsByDate,
  selectedDay,
  rotationAngle,
  radius,
  onInvalidDrop, // nuevo callback
}) {
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();

      // Avisar si no hay día seleccionado
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

      // Desrotar posición del mouse
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
      const itemsForDate = itemsByDate[dateKey] || [];
      const existing = itemsForDate.find((it) => it.id.toString() === itemId);

      const width = existing?.width ?? (label === 'Tarea' ? 200 : 100);
      const height = existing?.height ?? (label === 'Tarea' ? 150 : 100);

      if (source === 'sidebar') {
        const newItem = {
          id: Date.now(),
          label,
          angle,
          distance,
          content: label === 'Tarea' ? [''] : '',
          checked: label === 'Tarea' ? [false] : undefined,
          width,
          height,
        };

        setItemsByDate((prev) => ({
          ...prev,
          [dateKey]: [...(prev[dateKey] || []), newItem],
        }));
      } else if (source === 'dropped') {
        setItemsByDate((prev) => ({
          ...prev,
          [dateKey]: prev[dateKey].map((it) =>
            it.id.toString() === itemId
              ? { ...it, angle, distance }
              : it
          ),
        }));
      }
    },
    [
      containerRef,
      itemsByDate,
      setItemsByDate,
      selectedDay,
      rotationAngle,
      radius,
      onInvalidDrop,
    ]
  );

  return handleDrop;
}
