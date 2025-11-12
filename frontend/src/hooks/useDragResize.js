import { useEffect, useRef } from 'react';
import { limitPositionInsideCircle } from '@utils/helpers/geometry';

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
  isSmallScreen = false,
  aspectRatio = null, // Nuevo: relación de aspecto (width/height) para mantener durante resize
  fullboardMode = false,
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
        if (isSmallScreen || fullboardMode) {
          // MOBILE o FULLBOARD: límite por pantalla, sin ningún círculo
          const limited = limitPositionInsideCircle(
            x0, y0,
            sizeState.width, sizeState.height,
            circleCenter, // param, pero limitPositionInsideCircle delega correctamente a limitPositionInsideScreen en mobile/fullboard
            maxRadius,
            isSmallScreen || fullboardMode
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

        let newWidth = resizeStartPos.current.width + dx;
        let newHeight = resizeStartPos.current.height + dy;

        // Si hay aspect ratio definido, mantenerlo durante el resize
        if (aspectRatio && aspectRatio > 0) {
          // Determinar qué dimensión está cambiando más (en términos relativos)
          const widthChange = Math.abs(dx / resizeStartPos.current.width);
          const heightChange = Math.abs(dy / resizeStartPos.current.height);
          
          if (widthChange > heightChange) {
            newHeight = newWidth / aspectRatio;
          } else {
            newWidth = newHeight * aspectRatio;
          }
          
          if (newWidth > maxWidth) {
            newWidth = maxWidth;
            newHeight = newWidth / aspectRatio;
          }
          if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = newHeight * aspectRatio;
          }
          
          // Luego verificar límites mínimos
          if (newWidth < minWidth) {
            newWidth = minWidth;
            newHeight = newWidth / aspectRatio;
          }
          if (newHeight < minHeight) {
            newHeight = minHeight;
            newWidth = newHeight * aspectRatio;
          }
          
          // Si después de aplicar mínimos, alguna dimensión quedó fuera de rango, ajustar
          if (newWidth > maxWidth) {
            newWidth = maxWidth;
            newHeight = newWidth / aspectRatio;
          }
          if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = newHeight * aspectRatio;
          }
        } else {
          // Sin aspect ratio, aplicar límites directamente
          newWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
          newHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);
        }

        // Detectar si estamos agrandando o achicando
        const isGrowing = newWidth > sizeState.width || newHeight > sizeState.height;

        // Para mobile o fullboard, usar límites de pantalla
        if (isSmallScreen || fullboardMode) {
          const screenLimited = limitPositionInsideCircle(
            pos.x, pos.y, newWidth, newHeight, circleCenter, maxRadius, isSmallScreen || fullboardMode
          );
          
          // Si la posición cambió, ajustar el tamaño proporcionalmente
          if (screenLimited.x !== pos.x || screenLimited.y !== pos.y) {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const maxPossibleWidth = Math.min(newWidth, screenWidth - 16);
            const maxPossibleHeight = Math.min(newHeight, screenHeight - 16);
            
            newWidth = maxPossibleWidth;
            newHeight = maxPossibleHeight;
          }
        } else if (isGrowing) {
          // Para desktop, solo verificar límites del círculo cuando estamos AGRANDANDO
          // Si estamos achicando, permitir siempre (nunca se saldrá del círculo al achicar)
          const { cx, cy } = circleCenter;
          const halfWidth = newWidth / 2;
          const halfHeight = newHeight / 2;
          
          // Calcular las 4 esquinas del elemento con el nuevo tamaño
          const corners = [
            { x: pos.x - halfWidth, y: pos.y - halfHeight }, // Superior izquierda
            { x: pos.x + halfWidth, y: pos.y - halfHeight }, // Superior derecha
            { x: pos.x - halfWidth, y: pos.y + halfHeight }, // Inferior izquierda
            { x: pos.x + halfWidth, y: pos.y + halfHeight }  // Inferior derecha
          ];
          
          // Verificar si alguna esquina está fuera del círculo
          let maxExcess = 0;
          for (const corner of corners) {
            const cornerDx = corner.x - cx;
            const cornerDy = corner.y - cy;
            const cornerDist = Math.sqrt(cornerDx * cornerDx + cornerDy * cornerDy);
            const excess = cornerDist - maxRadius;
            if (excess > maxExcess) {
              maxExcess = excess;
            }
          }
          
          // Si hay exceso, reducir el tamaño proporcionalmente
          if (maxExcess > 0) {
            // Calcular el factor de escala necesario para que todas las esquinas estén dentro
            const currentMaxCornerDist = Math.sqrt(halfWidth * halfWidth + halfHeight * halfHeight);
            const centerDist = Math.sqrt((pos.x - cx) ** 2 + (pos.y - cy) ** 2);
            const maxAllowedCornerDist = maxRadius - centerDist;
            
            if (maxAllowedCornerDist > 0) {
              const scale = Math.min(1, maxAllowedCornerDist / currentMaxCornerDist);
              newWidth = Math.max(minWidth, newWidth * scale);
              newHeight = Math.max(minHeight, newHeight * scale);
            } else {
              // Si el centro está muy cerca del borde, usar tamaños mínimos
              newWidth = minWidth;
              newHeight = minHeight;
            }
          }
        }

        setSizeState({ width: newWidth, height: newHeight });
        onResize?.({ width: newWidth, height: newHeight });
      }
    };

    const onEnd = () => {
      if (isDragging.current) {
        onDrop?.(); // avisar que terminó el drag
      }
      if (isResizing.current) {
        // Asegurar que se conserve el último tamaño válido al finalizar
        onResize?.({ width: sizeState.width, height: sizeState.height });
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
    rotation,
    aspectRatio
  ]);

  return {
    isDragging,
    isResizing,
    dragStartPos,
    resizeStartPos,
  };
};
