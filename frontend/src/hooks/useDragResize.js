import { useEffect, useRef } from 'react';
import { limitPositionInsideCircleSimple } from '@utils/helpers/geometry';

export const useDragResize = ({
  pos,
  setPos,
  sizeState,
  setSizeState,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  circleCenter,
  maxRadius,
  onMove, 
  onResize,
  onDrag,
  onDrop,
  rotation,
  isSmallScreen = false
}) => {
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStartPos = useRef({});
  const resizeStartPos = useRef({});

  useEffect(() => {
    const handleMove = (e) => {
      let clientX, clientY;

      if (e.touches && e.touches.length === 1) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        // Solo prevenir el comportamiento por defecto si realmente estamos haciendo drag
        if (isDragging.current || isResizing.current) {
          e.preventDefault();
        }
      } else if (e.clientX !== undefined && e.clientY !== undefined) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return;
      }

      if (isDragging.current) {
        const dx = clientX - dragStartPos.current.mouseX;
        const dy = clientY - dragStartPos.current.mouseY;

        const angle = (dragStartPos.current.containerRotation * Math.PI) / 180;
        const correctedDx = dx * Math.cos(angle) + dy * Math.sin(angle);
        const correctedDy = -dx * Math.sin(angle) + dy * Math.cos(angle);

        // ----- NUEVO: Limitar moviendo en el sistema desrotado -----
        const cx = circleCenter.cx;
        const cy = circleCenter.cy;
        let x0 = dragStartPos.current.x + correctedDx;
        let y0 = dragStartPos.current.y + correctedDy;
        if (isSmallScreen) {
          // MOBILE: límite por pantalla, sin ningún círculo
          const limited = limitPositionInsideCircleSimple(
            x0, y0,
            sizeState.width, sizeState.height,
            circleCenter, // param, pero limitPositionInsideCircleSimple delega correctamente a limitPositionInsideScreen en mobile
            maxRadius,
            isSmallScreen
          );
          setPos({ x: limited.x, y: limited.y });
          onMove?.({ x: limited.x, y: limited.y });
          onDrag?.({ x: limited.x, y: limited.y });
          return;
        }
        // DESKTOP: sistema rotado robusto
        // 1. Desrota la posición destino (aplica la inversa de la rotación CSS de CircleLarge)
        const rotRad = (rotation || 0) * Math.PI / 180;
        const relX = x0 - cx;
        const relY = y0 - cy;
        // Aplica la matriz inversa (rotar por -rotRad)
        const desrotX = relX * Math.cos(-rotRad) - relY * Math.sin(-rotRad);
        const desrotY = relX * Math.sin(-rotRad) + relY * Math.cos(-rotRad);
        const posDesrotado = { x: cx + desrotX, y: cy + desrotY };
        // 2. Limitar en el sistema original (NO rotado): aseguramos que todas las esquinas quedan dentro
        // Usamos la función binaria robusta para ese sistema
        function esquinasNoRotadas(cx, cy, x, y, w, h) {
          const halfW = w / 2, halfH = h / 2;
          const relCorners = [
            { x: -halfW, y: -halfH },
            { x: halfW, y: -halfH },
            { x: -halfW, y: halfH },
            { x: halfW, y: halfH }
          ];
          return relCorners.map(({x:rx, y:ry}) => ({ x: x + rx, y: y + ry }));
        }
        function todasAdentro(cx, cy, corners, radius) {
          return corners.every(c => {
            const dx = c.x - cx;
            const dy = c.y - cy;
            return Math.sqrt(dx*dx + dy*dy) <= radius + 0.05;
          });
        }
        function limitarCentroByBiseccion(targetX, targetY, cx, cy, w, h, radius) {
          let corners = esquinasNoRotadas(cx, cy, targetX, targetY, w, h);
          if (todasAdentro(cx, cy, corners, radius)) {
            return { x: targetX, y: targetY };
          }
          const vx = targetX - cx, vy = targetY - cy;
          const dist = Math.sqrt(vx*vx + vy*vy);
          if (dist === 0) return { x: cx, y: cy };
          let lo = 0, hi = dist, best = { x: cx, y: cy };
          for (let i = 0; i < 20; i++) {
            const m = (lo + hi) / 2;
            const testX = cx + (vx / dist) * m;
            const testY = cy + (vy / dist) * m;
            const cornersTest = esquinasNoRotadas(cx, cy, testX, testY, w, h);
            if (todasAdentro(cx, cy, cornersTest, radius)) {
              best = { x: testX, y: testY };
              lo = m;
            } else {
              hi = m;
            }
          }
          return best;
        }
        const posLimitOrig = limitarCentroByBiseccion(
          posDesrotado.x, posDesrotado.y,
          cx, cy,
          sizeState.width, sizeState.height,
          maxRadius
        );
        // 3. Rota el resultado limitado de vuelta al sistema visual
        const limRelX = posLimitOrig.x - cx;
        const limRelY = posLimitOrig.y - cy;
        const xFinal = cx + (limRelX * Math.cos(rotRad) - limRelY * Math.sin(rotRad));
        const yFinal = cy + (limRelX * Math.sin(rotRad) + limRelY * Math.cos(rotRad));
        setPos({ x: xFinal, y: yFinal });
        onMove?.({ x: xFinal, y: yFinal });
        onDrag?.({ x: xFinal, y: yFinal });
      } else if (isResizing.current) {
        const dx = clientX - resizeStartPos.current.mouseX;
        const dy = clientY - resizeStartPos.current.mouseY;

        let newWidth = Math.min(Math.max(resizeStartPos.current.width + dx, minWidth), maxWidth);
        let newHeight = Math.min(Math.max(resizeStartPos.current.height + dy, minHeight), maxHeight);

        const limited = limitPositionInsideCircleSimple(
          pos.x,
          pos.y,
          newWidth,
          newHeight,
          circleCenter,
          maxRadius,
          isSmallScreen
        );

        if (limited.x !== pos.x || limited.y !== pos.y) {
          const distToCenter = Math.sqrt(
            (limited.x - circleCenter.cx) ** 2 + (limited.y - circleCenter.cy) ** 2
          );
          const maxAllowedDiagonal = maxRadius - distToCenter;
          const currentDiagonal = Math.sqrt(newWidth ** 2 + newHeight ** 2) / 2;
          const scale = Math.min(1, maxAllowedDiagonal / currentDiagonal);

          newWidth *= scale;
          newHeight *= scale;
        }

        setSizeState({ width: newWidth, height: newHeight });
        onResize?.({ width: newWidth, height: newHeight });
      }
    };

    const onEnd = () => {
      if (isDragging.current) {
        onDrop?.(); // avisar que terminó el drag
      }
      isDragging.current = false;
      isResizing.current = false;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', onEnd);

    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', onEnd);

      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, [
    pos,
    sizeState,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    circleCenter,
    maxRadius,
    onMove,
    onResize,
    onDrag,
    onDrop,
    isSmallScreen,
    rotation
  ]);

  return {
    isDragging,
    isResizing,
    dragStartPos,
    resizeStartPos,
  };
};
