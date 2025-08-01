import React, { useState, useEffect, useRef } from 'react';
import { useDragResize } from '../../hooks/useDragResize';
import { limitPositionInsideCircle } from '../../utils/geometry';
import { getContainerStyle } from '../../utils/styles/getContainerStyle';

export default function UnifiedContainer({ ...props }) {
  const {
    x, y, width, height, rotation = 0,
    minWidth = 100, minHeight = 80,
    maxWidth = 400, maxHeight = 400,
    circleCenter = { cx: 0, cy: 0 },
    maxRadius = 200,
    onMove, onResize,
    children, style = {},
    disableResize = false,
    isSmallScreen = false, 
  } = props;

  const containerRef = useRef(null);
  const [pos, setPos] = useState({ x, y });
  const [sizeState, setSizeState] = useState({ width, height });

useEffect(() => {
  const limited = limitPositionInsideCircle(
    x, y, width, height, circleCenter, maxRadius, isSmallScreen
  );
  setPos({ x: limited.x, y: limited.y });
  setSizeState({
    width: Math.min(Math.max(width, minWidth), maxWidth),
    height: Math.min(Math.max(height, minHeight), maxHeight),
  });
}, [x, y, width, height, circleCenter, maxRadius, minWidth, minHeight, maxWidth, maxHeight, isSmallScreen]);

  const { isDragging, isResizing, dragStartPos, resizeStartPos } = useDragResize({
    pos, setPos, sizeState, setSizeState,
    minWidth, minHeight, maxWidth, maxHeight,
    circleCenter, maxRadius, onMove, onResize,
    rotation,
    isSmallScreen, 
  });

  const onMouseDownDrag = (e) => {
    const tag = e.target.tagName.toLowerCase();

    if (['input', 'textarea', 'select'].includes(tag)) return;
    if (e.target.dataset.resizeHandle) return;

    e.stopPropagation();
    e.preventDefault();
    isDragging.current = true;
    dragStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      x: pos.x,
      y: pos.y,
      containerRotation: -rotation,
    };
  };

  const onTouchStartDrag = (e) => {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    e.preventDefault();
    e.stopPropagation();

    isDragging.current = true;
    dragStartPos.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      x: pos.x,
      y: pos.y,
      containerRotation: -rotation,
    };
  };

  const onMouseDownResize = (e) => {
    if (disableResize) return;
    e.stopPropagation();
    e.preventDefault();
    isResizing.current = true;
    resizeStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: sizeState.width,
      height: sizeState.height,
    };
  };

  const onTouchStartResize = (e) => {
    if (disableResize) return;
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    e.stopPropagation();
    e.preventDefault();
    isResizing.current = true;
    resizeStartPos.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      width: sizeState.width,
      height: sizeState.height,
    };
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDownDrag}
      onTouchStart={onTouchStartDrag}
      onContextMenu={props.onContextMenu}
      style={getContainerStyle({
        pos,
        rotation,
        sizeState,
        isDragging: isDragging.current,
        style: {
          ...style,
          backgroundColor: 'var(--color-neutral)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-text-secondary)',
        }
      })}
    >
      {children}
      {!disableResize && (
        <div
          data-resize-handle="true"
          onMouseDown={onMouseDownResize}
          onTouchStart={onTouchStartResize}
          className="resize-handle-native"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            cursor: 'nwse-resize',
            borderRadius: '2px',
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
}