import { useEffect, useState, useMemo } from 'react';

export default function useSidebarLayout(selectedDay, isMobile) {
  const [showSmall, setShowSmall] = useState(true);
  const [showLeftSidebarMobile, setShowLeftSidebarMobile] = useState(false);
  const [showRightSidebarMobile, setShowRightSidebarMobile] = useState(false);

  useEffect(() => {
    if (!selectedDay) {
      setShowSmall(true);
    }
  }, [selectedDay]);

  // Setters seguros para mantener exclusividad en mobile respetando la última acción del usuario
  const setShowSmallExclusive = (next) => {
    setShowSmall((prev) => {
      const value = typeof next === 'function' ? next(prev) : next;
      if (isMobile && value) {
        // Si abrimos CircleSmall en mobile, cerramos CurvedSidebar
        setShowLeftSidebarMobile(false);
      }
      return value;
    });
  };

  const setShowLeftSidebarMobileExclusive = (next) => {
    setShowLeftSidebarMobile((prev) => {
      const value = typeof next === 'function' ? next(prev) : next;
      if (isMobile && value) {
        // Si abrimos CurvedSidebar en mobile, cerramos CircleSmall
        setShowSmall(false);
      }
      return value;
    });
  };

  const leftSidebarMobileWrapperStyle = useMemo(
    () => ({ bottom: 'var(--mobile-bottom-offset)' }),
    []
  );

  return {
    showSmall,
    setShowSmall: setShowSmallExclusive,
    showLeftSidebarMobile,
    setShowLeftSidebarMobile: setShowLeftSidebarMobileExclusive,
    showRightSidebarMobile,
    setShowRightSidebarMobile,
    leftSidebarMobileWrapperStyle,
  };
}


