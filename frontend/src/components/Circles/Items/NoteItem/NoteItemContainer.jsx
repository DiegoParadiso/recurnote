import React, { useRef } from 'react';
import UnifiedContainer from '@components/common/UnifiedContainer';
import useItemDrag from '../hooks/useItemDrag';

export default function NoteItemContainer({
  id,
  x,
  y,
  width,
  height,
  rotation,
  rotationEnabled = true,
  circleCenter,
  maxRadius,
  isSmallScreen,
  isActive,
  onActivate,
  onItemDrag,
  onItemDrop,
  onPositionChange,
  onSizeChange,
  children,
  zIndexOverride,
  minWidth,
  minHeight,
  maxWidth = 320,
  maxHeight = 260,
  fullboardMode = false,
  ...rest
}) {
  const lastPosRef = useRef({ x, y });
  const { isDragging, handleContainerDragStart, handleContainerDragEnd } = useItemDrag({ id, onActivate, onItemDrop });

  return (
    <UnifiedContainer
      x={x}
      y={y}
      rotation={rotationEnabled ? rotation : 0}
      width={width}
      height={height}
      minWidth={minWidth}
      minHeight={minHeight}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      onMove={({ x, y }) => {
        lastPosRef.current = { x, y };
        onItemDrag?.(id, { x, y });
      }}
      onResize={(newSize) => {
        onSizeChange?.(newSize);
      }}
      onDrag={handleContainerDragStart}
      onDrop={() => {
        handleContainerDragEnd(id);
        const finalPos = lastPosRef.current || { x, y };
        const { cx, cy } = circleCenter || {};
        if (cx !== undefined && cy !== undefined) {
          const dx = finalPos.x - cx;
          const dy = finalPos.y - cy;
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          const distance = Math.sqrt(dx * dx + dy * dy);
          onPositionChange?.({ x: finalPos.x, y: finalPos.y, angle, distance, fullboardMode });
        } else {
          onPositionChange?.({ x: finalPos.x, y: finalPos.y, fullboardMode });
        }
      }}
      circleCenter={circleCenter}
      maxRadius={maxRadius}
      isSmallScreen={isSmallScreen}
      fullboardMode={fullboardMode}
      isActive={isActive}
      onActivate={onActivate}
      zIndexOverride={zIndexOverride}
      {...rest}
    >
      {typeof children === 'function' ? children({ isDragging }) : children}
    </UnifiedContainer>
  );
}
