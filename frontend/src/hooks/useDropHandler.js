import { useCallback } from 'react';

export default function useHandleDrop({
  containerRef,
  droppedItems,
  setDroppedItems,
  rotationAngle,
  radius
}) {
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      // Desrotar posición del mouse
      const rad = (rotationAngle * Math.PI) / 180;
      const rotatedX = mouseX * Math.cos(rad) + mouseY * Math.sin(rad);
      const rotatedY = -mouseX * Math.sin(rad) + mouseY * Math.cos(rad);

      let distance = Math.hypot(rotatedX, rotatedY);
      if (distance > radius) {
        const scale = radius / distance;
        distance = radius;
        rotatedX *= scale;
        rotatedY *= scale;
      }

      let angle = (Math.atan2(rotatedY, rotatedX) * 180) / Math.PI;
      angle = (angle + 360) % 360;

      const source = e.dataTransfer.getData('source');
      const label = e.dataTransfer.getData('label') || 'Nota';
      const itemId = e.dataTransfer.getData('itemId');
      const existing = droppedItems.find((it) => it.id.toString() === itemId);
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
          height
        };
        setDroppedItems((prev) => [...prev, newItem]);
      } else {
        setDroppedItems((prev) =>
          prev.map((it) =>
            it.id.toString() === itemId
              ? { ...it, angle, distance }
              : it
          )
        );
      }
    },
    [containerRef, droppedItems, setDroppedItems, rotationAngle, radius]
  );

  return handleDrop;
}