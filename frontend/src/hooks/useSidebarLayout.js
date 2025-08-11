import { useEffect, useState, useMemo } from 'react';

export default function useSidebarLayout(selectedDay, isMobile) {
  const [showSmall, setShowSmall] = useState(true);
  const [showLeftSidebarMobile, setShowLeftSidebarMobile] = useState(false);
  const [showRightSidebarMobile, setShowRightSidebarMobile] = useState(false);

  useEffect(() => {
    if (!selectedDay) {
      setShowSmall(true);
      return;
    }
    if (isMobile) {
      setShowLeftSidebarMobile(true);
    }
  }, [selectedDay, isMobile]);

  const leftSidebarMobileWrapperStyle = useMemo(
    () => ({ bottom: 'var(--mobile-bottom-offset)' }),
    []
  );

  return {
    showSmall,
    setShowSmall,
    showLeftSidebarMobile,
    setShowLeftSidebarMobile,
    showRightSidebarMobile,
    setShowRightSidebarMobile,
    leftSidebarMobileWrapperStyle,
  };
}


