import { useEffect, useRef } from 'react';
import { limitPositionInsideCircle, getRotatedCorners } from '@utils/helpers/geometry';

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

        const limited = limitPositionInsideCircle(
          x0, y0,
          sizeRef.current.width, sizeRef.current.height,
          circleCenter,
          maxRadius,
          isSmallScreen || fullboardMode,
          rotation
        );
        finalPos = { x: limited.x, y: limited.y };

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          setPos(finalPos);
          onMove?.(finalPos);
          onDrag?.(finalPos);
        });

      } else if (isResizing.current) {
        const dx = clientX - resizeStartPos.current.mouseX;
        const dy = clientY - resizeStartPos.current.mouseY;

        // Calculate rotation constants early
        const rotRad = ((resizeStartPos.current.rotation || 0) * Math.PI) / 180;
        const cos = Math.cos(rotRad);
        const sin = Math.sin(rotRad);

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

        // Calculate tentative position based on tentative size
        let deltaW = newWidth - resizeStartPos.current.width;
        let deltaH = newHeight - resizeStartPos.current.height;
        let deltaX = (deltaW / 2) * cos - (deltaH / 2) * sin;
        let deltaY = (deltaW / 2) * sin + (deltaH / 2) * cos;
        let newX = resizeStartPos.current.x + deltaX;
        let newY = resizeStartPos.current.y + deltaY;

        const isGrowing = newWidth > sizeRef.current.width || newHeight > sizeRef.current.height;

        if (isSmallScreen || fullboardMode) {
          const screenLimited = limitPositionInsideCircle(
            newX, newY, newWidth, newHeight, circleCenter, maxRadius, isSmallScreen || fullboardMode
          );

          if (screenLimited.x !== newX || screenLimited.y !== newY) {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const maxPossibleWidth = Math.min(newWidth, screenWidth - 16);
            const maxPossibleHeight = Math.min(newHeight, screenHeight - 16);

            newWidth = maxPossibleWidth;
            newHeight = maxPossibleHeight;

            // Recalculate position for clamped size
            deltaW = newWidth - resizeStartPos.current.width;
            deltaH = newHeight - resizeStartPos.current.height;
            deltaX = (deltaW / 2) * cos - (deltaH / 2) * sin;
            deltaY = (deltaW / 2) * sin + (deltaH / 2) * cos;
            newX = resizeStartPos.current.x + deltaX;
            newY = resizeStartPos.current.y + deltaY;
          }
        } else if (isGrowing) {
          const { cx, cy } = circleCenter;
          const halfWidth = newWidth / 2;
          const halfHeight = newHeight / 2;

          const startHalfW = resizeStartPos.current.width / 2;
          const startCorners = getRotatedCorners(resizeStartPos.current.x, resizeStartPos.current.y, resizeStartPos.current.width, resizeStartPos.current.height, rotation);
          const startExcesses = startCorners.map(c => {
            const dist = Math.sqrt((c.x - cx) ** 2 + (c.y - cy) ** 2);
            return Math.max(0, dist - maxRadius);
          });

          const corners = getRotatedCorners(newX, newY, newWidth, newHeight, rotation);

          let needsLimit = false;
          for (let i = 0; i < 4; i++) {
            const corner = corners[i];
            const cornerDx = corner.x - cx;
            const cornerDy = corner.y - cy;
            const cornerDist = Math.sqrt(cornerDx * cornerDx + cornerDy * cornerDy);
            const excess = cornerDist - maxRadius;
            if (excess > 0 && excess > startExcesses[i] + 0.1) {
              needsLimit = true;
              break;
            }
          }

          if (needsLimit) {
            // Binary search for the limit to avoid shrinking
            // We want to find t in [0, 1] such that start + delta*t is valid
            let low = 0;
            let high = 1;
            let bestT = 0;

            // 6 iterations gives enough precision
            for (let i = 0; i < 6; i++) {
              const t = (low + high) / 2;

              const candW = resizeStartPos.current.width + (newWidth - resizeStartPos.current.width) * t;
              const candH = resizeStartPos.current.height + (newHeight - resizeStartPos.current.height) * t;

              const candDeltaW = candW - resizeStartPos.current.width;
              const candDeltaH = candH - resizeStartPos.current.height;
              const candDeltaX = (candDeltaW / 2) * cos - (candDeltaH / 2) * sin;
              const candDeltaY = (candDeltaW / 2) * sin + (candDeltaH / 2) * cos;

              const candX = resizeStartPos.current.x + candDeltaX;
              const candY = resizeStartPos.current.y + candDeltaY;

              const candCorners = getRotatedCorners(candX, candY, candW, candH, rotation);

              let valid = true;
              for (let j = 0; j < 4; j++) {
                const c = candCorners[j];
                const dist = Math.sqrt((c.x - cx) ** 2 + (c.y - cy) ** 2);
                const excess = dist - maxRadius;
                if (excess > 0 && excess > startExcesses[j] + 0.1) {
                  valid = false;
                  break;
                }
              }

              if (valid) {
                bestT = t;
                low = t;
              } else {
                high = t;
              }
            }

            // Apply bestT
            newWidth = resizeStartPos.current.width + (newWidth - resizeStartPos.current.width) * bestT;
            newHeight = resizeStartPos.current.height + (newHeight - resizeStartPos.current.height) * bestT;

            // Recalculate position for clamped size
            deltaW = newWidth - resizeStartPos.current.width;
            deltaH = newHeight - resizeStartPos.current.height;
            deltaX = (deltaW / 2) * cos - (deltaH / 2) * sin;
            deltaY = (deltaW / 2) * sin + (deltaH / 2) * cos;
            newX = resizeStartPos.current.x + deltaX;
            newY = resizeStartPos.current.y + deltaY;
          }
        }

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          setPos({ x: newX, y: newY });
          setSizeState({ width: newWidth, height: newHeight });
          onResize?.({ width: newWidth, height: newHeight, x: newX, y: newY });
          onMove?.({ x: newX, y: newY });
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
        onDrop?.(); // Commit changes (Undo/Redo)
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
