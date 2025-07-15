import { useCallback } from 'react';

export function useRightClickHandler(onDelete) {
  return useCallback((e) => {
    e.preventDefault();
    if (onDelete) onDelete();
  }, [onDelete]);
}