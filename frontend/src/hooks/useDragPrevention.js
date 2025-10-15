import { useRef, useCallback } from 'react';

/**
 * Hook  para prevenir clicks accidentales durante drags
 */
export function useDragPrevention(options = {}) {
  const {
    threshold = 5,
    delay = 150,
    supportTouch = true,
    simple = false
  } = options;

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

    // En modo simple, no usar timeout
    if (!simple && delay > 0) {
      timeoutRef.current = setTimeout(() => {
        isDraggingRef.current = true;
      }, delay);
    }

    return false;
  }, [delay, simple]);

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

  // Touch events (solo si está habilitado)
  const handleTouchStart = useCallback((e) => {
    if (!supportTouch || e.touches.length !== 1) return false;

    const touch = e.touches[0];
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    isDraggingRef.current = false;

    if (!simple && delay > 0) {
      timeoutRef.current = setTimeout(() => {
        isDraggingRef.current = true;
      }, delay);
    }

    return false;
  }, [supportTouch, delay, simple]);

  const handleTouchMove = useCallback((e) => {
    if (!supportTouch || !dragStartRef.current || e.touches.length !== 1) return false;

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
  }, [supportTouch, threshold]);

  const handleTouchEnd = useCallback(() => {
    if (!supportTouch) return false;

    const wasDragging = isDraggingRef.current;

    dragStartRef.current = null;
    isDraggingRef.current = false;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    return wasDragging;
  }, [supportTouch]);

  return {
    // Handlers de mouse
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    // Handlers de touch
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    // Estado
    isDragging,
    // Aliases para compatibilidad con useSimpleDragPrevent
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
  };
}

// Re-exports para backward compatibility
export const useDragPrevent = (threshold) => useDragPrevention({ threshold });
export const useSimpleDragPrevent = () => useDragPrevention({ threshold: 3, simple: true, supportTouch: false });

export default useDragPrevention;
