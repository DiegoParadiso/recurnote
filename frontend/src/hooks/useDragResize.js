import { useEffect, useRef } from 'react';
import { limitPositionInsideCircle } from '../utils/geometry';

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
  rotation,
}) => {
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStartPos = useRef({});
  const resizeStartPos = useRef({});

  useEffect(() => {
    const onMouseMove = (e) => {
      if (isDragging.current) {
        const dx = e.clientX - dragStartPos.current.mouseX;
        const dy = e.clientY - dragStartPos.current.mouseY;

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
          maxRadius
        );

        setPos({ x: limited.x, y: limited.y });
        onMove?.({ x: limited.x, y: limited.y });
      } else if (isResizing.current) {
        const dx = e.clientX - resizeStartPos.current.mouseX;
        const dy = e.clientY - resizeStartPos.current.mouseY;

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

    const onMouseUp = () => {
      isDragging.current = false;
      isResizing.current = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
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
  ]);

  return {
    isDragging,
    isResizing,
    dragStartPos,
    resizeStartPos,
  };
};
