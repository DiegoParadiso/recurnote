import React from 'react';
import { RIGHT_SIDEBAR_MOBILE_WIDTH, RIGHT_SIDEBAR_Z_INDEX } from '../../utils/constants';

export default function RightSidebarOverlay({ children }) {
  return (
    <div
      className="fixed top-0 bottom-0 right-0"
      style={{
        width: RIGHT_SIDEBAR_MOBILE_WIDTH,
        backgroundColor: 'var(--color-bg)',
        padding: 0,
        overflow: 'hidden',
        zIndex: RIGHT_SIDEBAR_Z_INDEX,
      }}
    >
      {children}
    </div>
  );
}


