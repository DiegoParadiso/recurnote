import { useRef } from 'react';

export function useSwipeMonthNavigation(setCurrentDate) {
  const startY = useRef(null);

  const handleStart = (y) => { startY.current = y; };
  const handleEnd = (y) => {
    if (startY.current === null) return;
    const deltaY = y - startY.current;
    if (Math.abs(deltaY) > 30) {
      const direction = deltaY > 0 ? 1 : -1;
      setCurrentDate(prev => prev.plus({ months: direction }));
    }
    startY.current = null;
  };

  return {
    handleMouseDown: (e) => handleStart(e.clientY),
    handleMouseUp: (e) => handleEnd(e.clientY),
    handleTouchStart: (e) => handleStart(e.touches[0].clientY),
    handleTouchEnd: (e) => handleEnd(e.changedTouches[0].clientY),
  };
}
