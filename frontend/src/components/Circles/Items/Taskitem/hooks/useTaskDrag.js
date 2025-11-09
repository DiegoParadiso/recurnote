import { useRef, useState, useCallback, useEffect } from 'react';
import { useItems } from '@context/ItemsContext';

export default function useTaskDrag({ id, onActivate, onItemDrop }) {
  const [isDragging, setIsDragging] = useState(false);
  const timeoutRef = useRef(null);
  const wasDraggingRef = useRef(false);
  const dragTimeoutRef = useRef(null);
  const { markItemAsDragging, unmarkItemAsDragging } = useItems();

  const handleContainerDragStart = useCallback(() => {
    if (onActivate) onActivate();
    
    // Marcar el item como en drag inmediatamente
    markItemAsDragging?.(id);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsDragging(true);
      wasDraggingRef.current = true;
    }, 100);
  }, [id, onActivate, markItemAsDragging]);

  const handleContainerDragEnd = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsDragging(false);
    
    // Desmarcar el item como en drag
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    dragTimeoutRef.current = setTimeout(() => {
      unmarkItemAsDragging?.(id);
      dragTimeoutRef.current = null;
    }, 300);
    
    if (onItemDrop) onItemDrop(id);
    setTimeout(() => {
      wasDraggingRef.current = false;
    }, 200);
  }, [id, onItemDrop, unmarkItemAsDragging]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        unmarkItemAsDragging?.(id);
      }
    };
  }, [id, unmarkItemAsDragging]);

  return {
    isDragging,
    wasDraggingRef,
    handleContainerDragStart,
    handleContainerDragEnd,
    setIsDragging,
  };
}
