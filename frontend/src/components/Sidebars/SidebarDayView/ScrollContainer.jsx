import React, { forwardRef } from 'react';

const ScrollContainer = forwardRef(({ children }, ref) => {
  return (
    <div
      ref={ref}
      className="relative flex-grow overflow-hidden px-4 pb-4 flex flex-col gap-5"
      style={{
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
      onWheel={(e) => e.stopPropagation()} 
    >
      <style>
        {`
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      {children}
    </div>
  );
});

export default ScrollContainer;