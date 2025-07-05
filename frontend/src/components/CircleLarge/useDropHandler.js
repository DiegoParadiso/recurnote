import { useCallback } from 'react';
import { isColliding, getAngleFromCenter } from './utils';

export default function useHandleDrop({
  containerRef,
  droppedItems,
  setDroppedItems,
  rotationAngle,
  radius,
  cx,
  cy
}) {
  const handleDrop = useCallback((e) => {
  e.preventDefault();
  if (!containerRef.current) return;

  const rect = containerRef.current.getBoundingClientRect();
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  let angle = getAngleFromCenter(mouseX, mouseY, containerRef);
  angle = (angle - rotationAngle + 360) % 360;

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  let dx = mouseX - centerX;
  let dy = mouseY - centerY;
  let distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > radius - 50) distance = radius - 50;

  const source = e.dataTransfer.getData('source');
  const label = e.dataTransfer.getData('label') || 'Nota';

  const itemId = e.dataTransfer.getData('itemId');
  const existingItem = droppedItems.find((item) => item.id.toString() === itemId);

  // Dimensiones para el item (no cambian)
  const newWidth = existingItem?.width || (label === 'Tarea' ? 200 : 100);
  const newHeight = existingItem?.height || (label === 'Tarea' ? 150 : 100);

  // --- Aquí NO chequeamos colisiones ni intentamos mover ---
  // Simplemente usamos el ángulo y distancia calculados con límite en el radio

  if (source === 'sidebar') {
    const newItem = {
      id: Date.now(),
      label,
      angle,
      distance,
      content: label === 'Tarea' ? [''] : '',
      checked: label === 'Tarea' ? [false] : undefined,
      width: newWidth,
      height: newHeight,
    };
    setDroppedItems((prev) => [...prev, newItem]);
  } else if (source === 'dropped') {
    setDroppedItems((prev) =>
      prev.map((item) =>
        item.id.toString() === itemId
          ? { ...item, angle, distance }
          : item
      )
    );
  }
}, [containerRef, droppedItems, setDroppedItems, rotationAngle, radius]);

  return handleDrop;
}
