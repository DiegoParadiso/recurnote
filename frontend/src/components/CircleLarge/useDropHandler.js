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

    // Obtengo el ángulo respecto al centro del contenedor usando la función utilitaria
    let angle = getAngleFromCenter(mouseX, mouseY, containerRef);
    angle = (angle - rotationAngle + 360) % 360;

    // Calculo distancia desde el centro
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let dx = mouseX - centerX;
    let dy = mouseY - centerY;

    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > radius - 50) distance = radius - 50;

    const source = e.dataTransfer.getData('source');
    const label = e.dataTransfer.getData('label') || 'Nota';

    const isPositionFree = (angle, distance, idToIgnore = null) => {
      const angleRad = (angle * Math.PI) / 180;
      const x = cx + distance * Math.cos(angleRad);
      const y = cy + distance * Math.sin(angleRad);

      const width = 150;
      const height = 80;

      for (const item of droppedItems) {
        if (idToIgnore !== null && item.id === idToIgnore) continue;

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

    if (!isPositionFree(finalAngle, finalDistance)) {
      let found = false;

      for (let i = 1; i <= maxAttempts; i++) {
        let testAngle = (finalAngle + i * stepAngle) % 360;
        if (isPositionFree(testAngle, finalDistance)) {
          finalAngle = testAngle;
          found = true;
          break;
        }
        testAngle = (finalAngle - i * stepAngle + 360) % 360;
        if (isPositionFree(testAngle, finalDistance)) {
          finalAngle = testAngle;
          found = true;
          break;
        }
      }

      // Si no se encontró posición por ángulo, intentar con distancia menor
      if (!found) {
        for (let dist = finalDistance - 10; dist > 20; dist -= 10) {
          if (isPositionFree(finalAngle, dist)) {
            finalDistance = dist;
            found = true;
            break;
          }
        }
      }

      if (!found) {
        // No hay espacio libre, salir
        return;
      }
    }

    if (source === 'sidebar') {
      const newItem = {
        id: Date.now(),
        label,
        angle: finalAngle,
        distance: finalDistance,
        content: '',
        width: 150,
        height: 80,
      };
      setDroppedItems((prev) => [...prev, newItem]);
    } else if (source === 'dropped') {
      const itemId = e.dataTransfer.getData('itemId');
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
