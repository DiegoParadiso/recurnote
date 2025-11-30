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
  aspectRatio = null,
  fullboardMode = false,
}) => {
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStartPos = useRef({});
  const resizeStartPos = useRef({});

  // Refs to hold latest values without triggering re-renders/effect cleanup
  const posRef = useRef(pos);
  const sizeRef = useRef(sizeState);
  const rafRef = useRef(null);

  // Update refs when props change
  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  useEffect(() => {
    sizeRef.current = sizeState;
  }, [sizeState]);

  useEffect(() => {
    const handleMove = (e) => {
      let clientX, clientY;

      if (e.touches && e.touches.length === 1) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
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

        const cx = circleCenter.cx;
        const cy = circleCenter.cy;
        let x0 = dragStartPos.current.x + correctedDx;
        let y0 = dragStartPos.current.y + correctedDy;

        let finalPos;

        if (isSmallScreen || fullboardMode) {
          const limited = limitPositionInsideCircle(
            x0, y0,
            sizeRef.current.width, sizeRef.current.height,
            circleCenter,
            maxRadius,
            isSmallScreen || fullboardMode
          );
          finalPos = { x: limited.x, y: limited.y };
        } else {
          const rotRad = (rotation || 0) * Math.PI / 180;
          const relX = x0 - cx;
          const relY = y0 - cy;
          const desrotX = relX * Math.cos(-rotRad) - relY * Math.sin(-rotRad);
          const desrotY = relX * Math.sin(-rotRad) + relY * Math.cos(-rotRad);
          const posDesrotado = { x: cx + desrotX, y: cy + desrotY };

          function esquinasNoRotadas(cx, cy, x, y, w, h) {
            const halfW = w / 2, halfH = h / 2;
            const relCorners = [
              { x: -halfW, y: -halfH },
              { x: halfW, y: -halfH },
              { x: -halfW, y: halfH },
              { x: halfW, y: halfH }
            ];
            return relCorners.map(({ x: rx, y: ry }) => ({ x: x + rx, y: y + ry }));
          }
          function todasAdentro(cx, cy, corners, radius) {
            return corners.every(c => {
              const dx = c.x - cx;
              const dy = c.y - cy;
              return Math.sqrt(dx * dx + dy * dy) <= radius + 0.05;
            });
          }
          function limitarCentroByBiseccion(targetX, targetY, cx, cy, w, h, radius) {
            let corners = esquinasNoRotadas(cx, cy, targetX, targetY, w, h);
            if (todasAdentro(cx, cy, corners, radius)) {
              return { x: targetX, y: targetY };
            }
            const vx = targetX - cx, vy = targetY - cy;
            const dist = Math.sqrt(vx * vx + vy * vy);
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
            sizeRef.current.width, sizeRef.current.height,
            maxRadius
          );

          const limRelX = posLimitOrig.x - cx;
          const limRelY = posLimitOrig.y - cy;
          const xFinal = cx + (limRelX * Math.cos(rotRad) - limRelY * Math.sin(rotRad));
          const yFinal = cy + (limRelX * Math.sin(rotRad) + limRelY * Math.cos(rotRad));
          finalPos = { x: xFinal, y: yFinal };
        }

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          setPos(finalPos);
          onMove?.(finalPos);
          onDrag?.(finalPos);
        });

      } else if (isResizing.current) {
        const dx = clientX - resizeStartPos.current.mouseX;
        const dy = clientY - resizeStartPos.current.mouseY;

        let newWidth = resizeStartPos.current.width + dx;
        let newHeight = resizeStartPos.current.height + dy;

        if (aspectRatio && aspectRatio > 0) {
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

          if (newWidth < minWidth) {
            newWidth = minWidth;
            newHeight = newWidth / aspectRatio;
          }
          if (newHeight < minHeight) {
            newHeight = minHeight;
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
        } else {
          newWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
          newHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);
        }

        const isGrowing = newWidth > sizeRef.current.width || newHeight > sizeRef.current.height;

        if (isSmallScreen || fullboardMode) {
          const screenLimited = limitPositionInsideCircle(
            posRef.current.x, posRef.current.y, newWidth, newHeight, circleCenter, maxRadius, isSmallScreen || fullboardMode
          );

          if (screenLimited.x !== posRef.current.x || screenLimited.y !== posRef.current.y) {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const maxPossibleWidth = Math.min(newWidth, screenWidth - 16);
            const maxPossibleHeight = Math.min(newHeight, screenHeight - 16);

            newWidth = maxPossibleWidth;
            newHeight = maxPossibleHeight;
          }
        } else if (isGrowing) {
          const { cx, cy } = circleCenter;
          const halfWidth = newWidth / 2;
          const halfHeight = newHeight / 2;

          const corners = [
            { x: posRef.current.x - halfWidth, y: posRef.current.y - halfHeight },
            { x: posRef.current.x + halfWidth, y: posRef.current.y - halfHeight },
            { x: posRef.current.x - halfWidth, y: posRef.current.y + halfHeight },
            { x: posRef.current.x + halfWidth, y: posRef.current.y + halfHeight }
          ];

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

          if (maxExcess > 0) {
            const currentMaxCornerDist = Math.sqrt(halfWidth * halfWidth + halfHeight * halfHeight);
            const centerDist = Math.sqrt((posRef.current.x - cx) ** 2 + (posRef.current.y - cy) ** 2);
            const maxAllowedCornerDist = maxRadius - centerDist;

            if (maxAllowedCornerDist > 0) {
              const scale = Math.min(1, maxAllowedCornerDist / currentMaxCornerDist);
              newWidth = Math.max(minWidth, newWidth * scale);
              newHeight = Math.max(minHeight, newHeight * scale);
            } else {
              newWidth = minWidth;
              newHeight = minHeight;
            }
          }
        }

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          setSizeState({ width: newWidth, height: newHeight });
          onResize?.({ width: newWidth, height: newHeight });
        });
      }
    };

    const onEnd = () => {
      if (isDragging.current) {
        onDrop?.();
      }
      if (isResizing.current) {
        onResize?.({
          width: sizeRef.current.width,
          height: sizeRef.current.height,
          x: posRef.current.x,
          y: posRef.current.y,
        });
      }
      isDragging.current = false;
      isResizing.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
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
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [
    // Removed pos and sizeState from dependencies
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
    aspectRatio,
    fullboardMode
  ]);

  return {
    isDragging,
    isResizing,
    dragStartPos,
    resizeStartPos,
  };
};
