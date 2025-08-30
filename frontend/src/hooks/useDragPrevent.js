import { useRef, useCallback } from 'react';

export const useDragPrevent = (threshold = 5) => {
  const dragStartRef = useRef(null);
  const isDraggingRef = useRef(false);
  const timeoutRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    // Registrar posición inicial
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };
    isDraggingRef.current = false;

    // Timeout para detectar si es un drag largo
    timeoutRef.current = setTimeout(() => {
      isDraggingRef.current = true;
    }, 150); // 150ms para considerar un drag

    return false; // No prevenir el evento aún
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!dragStartRef.current) return false;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Si se movió más del threshold, es un drag
    if (distance > threshold) {
      isDraggingRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return isDraggingRef.current;
  }, [threshold]);

  const handleMouseUp = useCallback(() => {
    const wasDragging = isDraggingRef.current;
    
    // Reset
    dragStartRef.current = null;
    isDraggingRef.current = false;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    return wasDragging;
  }, []);

  const isDragging = useCallback(() => {
    return isDraggingRef.current;
  }, []);

  // Touch events
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return false;
    
    const touch = e.touches[0];
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    isDraggingRef.current = false;

    timeoutRef.current = setTimeout(() => {
      isDraggingRef.current = true;
    }, 150);

    return false;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!dragStartRef.current || e.touches.length !== 1) return false;

    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.x;
    const dy = touch.clientY - dragStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > threshold) {
      isDraggingRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return isDraggingRef.current;
  }, [threshold]);

  const handleTouchEnd = useCallback(() => {
    const wasDragging = isDraggingRef.current;
    
    dragStartRef.current = null;
    isDraggingRef.current = false;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    return wasDragging;
  }, []);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isDragging
  };
};
