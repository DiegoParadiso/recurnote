import { useRef, useState, useCallback } from 'react';

export default function useTaskDrag({ id, onActivate, onItemDrop }) {
  const [isDragging, setIsDragging] = useState(false);
  const timeoutRef = useRef(null);
  const wasDraggingRef = useRef(false);

  const handleContainerDragStart = useCallback(() => {
    if (onActivate) onActivate();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsDragging(true);
      wasDraggingRef.current = true;
    }, 100);
  }, [onActivate]);

  const handleContainerDragEnd = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsDragging(false);
    if (onItemDrop) onItemDrop(id);
    setTimeout(() => {
      wasDraggingRef.current = false;
    }, 200);
  }, [id, onItemDrop]);

  return {
    isDragging,
    wasDraggingRef,
    handleContainerDragStart,
    handleContainerDragEnd,
    setIsDragging,
  };
}
