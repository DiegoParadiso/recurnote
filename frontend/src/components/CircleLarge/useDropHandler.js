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

    // 📏 Usar dimensiones reales si se mueve, o dimensiones por defecto si es nuevo
    const newWidth = existingItem?.width || (label === 'Tarea' ? 200 : 100);
    const newHeight = existingItem?.height || (label === 'Tarea' ? 150 : 100);

    const isPositionFree = (angle, distance, width, height, idToIgnore = null) => {
      const angleRad = (angle * Math.PI) / 180;
      const x = cx + distance * Math.cos(angleRad);
      const y = cy + distance * Math.sin(angleRad);

      for (const item of droppedItems) {
        if (idToIgnore && item.id.toString() === idToIgnore) continue;

        const itemAngleRad = (item.angle * Math.PI) / 180;
        const itemX = cx + item.distance * Math.cos(itemAngleRad);
        const itemY = cy + item.distance * Math.sin(itemAngleRad);
        const itemWidth = item.width || 150;
        const itemHeight = item.height || 80;

        if (isColliding(x, y, width, height, itemX, itemY, itemWidth, itemHeight)) {
          return false;
        }
      }
      return true;
    };

    let finalAngle = angle;
    let finalDistance = distance;
    const stepAngle = 5;
    const maxAttempts = 36;
    let found = isPositionFree(finalAngle, finalDistance, newWidth, newHeight, itemId);

    if (!found) {
      for (let i = 1; i <= maxAttempts; i++) {
        let testAngle = (finalAngle + i * stepAngle) % 360;
        if (isPositionFree(testAngle, finalDistance, newWidth, newHeight, itemId)) {
          finalAngle = testAngle;
          found = true;
          break;
        }
        testAngle = (finalAngle - i * stepAngle + 360) % 360;
        if (isPositionFree(testAngle, finalDistance, newWidth, newHeight, itemId)) {
          finalAngle = testAngle;
          found = true;
          break;
        }
      }

      if (!found) {
        for (let dist = finalDistance - 10; dist > 20; dist -= 10) {
          if (isPositionFree(finalAngle, dist, newWidth, newHeight, itemId)) {
            finalDistance = dist;
            found = true;
            break;
          }
        }
      }

      if (!found) return; // No hay espacio libre
    }

    if (source === 'sidebar') {
      const newItem = {
        id: Date.now(),
        label,
        angle: finalAngle,
        distance: finalDistance,
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
            ? { ...item, angle: finalAngle, distance: finalDistance }
            : item
        )
      );
    }
  }, [containerRef, droppedItems, setDroppedItems, rotationAngle, radius, cx, cy]);

  return handleDrop;
}
