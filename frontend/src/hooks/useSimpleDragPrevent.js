import { useRef, useCallback } from 'react';

export const useSimpleDragPrevent = () => {
  const isDragging = useRef(false);
  const dragStart = useRef(null);

  const handleMouseDown = useCallback((e) => {
    isDragging.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!dragStart.current) return;
    
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Si se movió más de 3px, es un drag
    if (distance > 3) {
      isDragging.current = true;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    const result = isDragging.current;
    isDragging.current = false;
    dragStart.current = null;
    return result;
  }, []);

  const getCurrentlyDragging = useCallback(() => {
    return isDragging.current;
  }, []);

  return {
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove, 
    onMouseUp: handleMouseUp,
    isDragging: getCurrentlyDragging
  };
};
