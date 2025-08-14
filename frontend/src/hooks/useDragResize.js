import { useEffect, useRef } from 'react';
import { limitPositionInsideCircle } from '../utils/helpers/geometry';

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

        let newX = dragStartPos.current.x + correctedDx;
        let newY = dragStartPos.current.y + correctedDy;

        const limited = limitPositionInsideCircle(
          newX,
          newY,
          sizeState.width,
          sizeState.height,
          circleCenter,
          maxRadius,
          isSmallScreen 
        );

        setPos({ x: limited.x, y: limited.y });
        onMove?.({ x: limited.x, y: limited.y });
        onDrag?.({ x: limited.x, y: limited.y }); 
      } else if (isResizing.current) {
        const dx = clientX - resizeStartPos.current.mouseX;
        const dy = clientY - resizeStartPos.current.mouseY;

        let newWidth = Math.min(Math.max(resizeStartPos.current.width + dx, minWidth), maxWidth);
        let newHeight = Math.min(Math.max(resizeStartPos.current.height + dy, minHeight), maxHeight);

        const limited = limitPositionInsideCircle(
          pos.x,
          pos.y,
          newWidth,
          newHeight,
          circleCenter,
          maxRadius
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
    onDrop
  ]);

  return {
    isDragging,
    isResizing,
    dragStartPos,
    resizeStartPos,
  };
};
