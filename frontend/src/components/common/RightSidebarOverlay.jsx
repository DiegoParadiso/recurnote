import React from 'react';
import { RIGHT_SIDEBAR_MOBILE_WIDTH } from '../../utils/constants/layout';

export default function RightSidebarOverlay({ children }) {
  return (
    <div
      className="fixed top-0 bottom-0 right-0"
      style={{
        width: RIGHT_SIDEBAR_MOBILE_WIDTH,
        backgroundColor: 'var(--color-bg)',
        padding: 0,
        overflow: 'hidden',
        zIndex: 'var(--z-modal)',
      }}
    >
      {children}
    </div>
  );
}


