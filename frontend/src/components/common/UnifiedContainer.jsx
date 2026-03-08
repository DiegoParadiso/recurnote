import React, { useState, useEffect, useRef } from 'react';
import { useDragResize } from '@hooks/useDragResize';
import { limitPositionInsideCircle } from '@utils/helpers/geometry';
import { getContainerStyle } from '@utils/styles/getContainerStyle';
import { notifyDragEnd } from '@utils/dragCoordinator';

export default function UnifiedContainer({
  x, y, width, height, rotation = 0,
  minWidth = 100, minHeight = 80,
  maxWidth = 400, maxHeight = 400,
  circleCenter = { cx: 0, cy: 0 },
  maxRadius = 200,
  onMove, onResize,
  onDrag,
  onDrop,
  onContextMenu,
  children, style = {},
  disableResize = false,
  isSmallScreen = false,
  isActive = false,
  onActivate,
  zIndexOverride,
  aspectRatio = null,
  fullboardMode = false,
  ...rest
}) {

  const containerRef = useRef(null);
  const [pos, setPos] = useState({
    x: (typeof x === 'number' && !isNaN(x)) ? x : 0,
    y: (typeof y === 'number' && !isNaN(y)) ? y : 0
  });
  const [sizeState, setSizeState] = useState({ width, height });
  const dragStartRef = useRef(null);
  const isDraggingRef = useRef(false);
  const prevModeRef = useRef({ isSmallScreen, fullboardMode });

  const { isDragging, isResizing, dragStartPos, resizeStartPos } = useDragResize({
    pos, setPos, sizeState, setSizeState,
    minWidth, minHeight, maxWidth, maxHeight,
    circleCenter, maxRadius, onMove, onResize,
    onDrag,
    onDrop,
    rotation,
    isSmallScreen,
    aspectRatio,
    fullboardMode,
  });

  useEffect(() => {
    if (isDragging.current || isResizing.current) return;

    const modeChanged =
      prevModeRef.current.isSmallScreen !== isSmallScreen ||
      prevModeRef.current.fullboardMode !== fullboardMode;

    prevModeRef.current = { isSmallScreen, fullboardMode };

    const positionToCheck = modeChanged ? pos : { x, y };
    let nextPos;

    if (isSmallScreen || fullboardMode) {
      // En mobile / fullboard, seguir usando limitPositionInsideCircle/Screen
      // Ensure inputs are valid numbers before calling limitPositionInsideCircle
      const safeX = (typeof positionToCheck.x === 'number' && !isNaN(positionToCheck.x)) ? positionToCheck.x : 0;
      const safeY = (typeof positionToCheck.y === 'number' && !isNaN(positionToCheck.y)) ? positionToCheck.y : 0;

      const limited = limitPositionInsideCircle(
        safeX, safeY, width, height,
        circleCenter, maxRadius, true, rotation
      );
      nextPos = { x: limited.x, y: limited.y };
    } else {
      // En modo normal (círculo), no re-clampear: confiar en useDragResize
      // Solo sincronizar estado interno con las props externas x,y
      nextPos = { x, y };
    }

    if (modeChanged || nextPos.x !== pos.x || nextPos.y !== pos.y) {
      if (typeof nextPos.x === 'number' && !isNaN(nextPos.x) && typeof nextPos.y === 'number' && !isNaN(nextPos.y)) {
        setPos(nextPos);
        if (modeChanged && onMove) {
          onMove(nextPos);
        }
      }
    }

    setSizeState({
      width: Math.min(Math.max(width, minWidth), maxWidth),
      height: Math.min(Math.max(height, minHeight), maxHeight),
    });
  }, [x, y, width, height, circleCenter, maxRadius, minWidth, minHeight, maxWidth, maxHeight, isSmallScreen, fullboardMode, isDragging, isResizing, pos, onMove]);

  // Registers a one-shot window-level capture listener to block the synthetic
  // click the browser fires after mouseup/touchend when a drag occurred.
  const blockNextClick = () => {
    const handler = (ev) => {
      ev.stopPropagation();
      ev.preventDefault();
      window.removeEventListener('click', handler, { capture: true });
    };
    window.addEventListener('click', handler, { capture: true });
    // Safety: clean up after 500 ms if no click fires
    setTimeout(() => window.removeEventListener('click', handler, { capture: true }), 500);
  };

  const handleMouseUp = (e) => {
    if (isDragging.current) {
      onDrop?.();
      isDragging.current = false;
    }

    // Block the synthetic click that fires after mouseup when a drag occurred
    if (isDraggingRef.current) {
      notifyDragEnd(); // Notify global coordinator so children can block their clicks
      blockNextClick();
    }

    // Reset per-gesture state
    isDraggingRef.current = false;
    dragStartRef.current = null;

    // Restaurar selección de texto cuando termine el drag
    document.body.style.userSelect = '';
    document.body.style.WebkitUserSelect = '';
    document.body.style.MozUserSelect = '';
    document.body.style.msUserSelect = '';
  };

  const handleTouchEnd = (e) => {
    if (isDragging.current) {
      onDrop?.();
      isDragging.current = false;
    }

    // Block the synthetic click that fires after touchend when a drag occurred
    if (isDraggingRef.current) {
      notifyDragEnd(); // Notify global coordinator so children can block their clicks
      blockNextClick();
    }

    // Reset per-gesture state
    isDraggingRef.current = false;
    dragStartRef.current = null;

    // Restaurar selección de texto cuando termine el drag
    document.body.style.userSelect = '';
    document.body.style.WebkitUserSelect = '';
    document.body.style.MozUserSelect = '';
    document.body.style.msUserSelect = '';
  };

  const onMouseDownDrag = (e) => {
    const tag = e.target.tagName.toLowerCase();

    if (['input', 'textarea', 'select'].includes(tag)) return;
    if (e.target.dataset.resizeHandle) return;

    // Check for contentEditable (including children)
    if (e.target.isContentEditable || e.target.getAttribute('contenteditable') === 'true') return;
    if (e.target.closest('[contenteditable="true"]')) return;

    onActivate?.();

    e.stopPropagation();
    e.preventDefault(); // Prevenir selección de texto

    // Prevenir selección de texto a nivel global durante drag
    document.body.style.userSelect = 'none';
    document.body.style.WebkitUserSelect = 'none';
    document.body.style.MozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';

    // Reset per-gesture drag state
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;

    isDragging.current = true;
    dragStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      x: pos.x,
      y: pos.y,
      containerRotation: -rotation,
    };

    // Notificar inmediatamente que el drag comenzó
    onDrag?.({ x: pos.x, y: pos.y });
  };

  const onTouchStartDrag = (e) => {
    if (e.touches.length !== 1) return;

    // SIEMPRE bloquear el scroll nativo en mobile
    e.preventDefault();

    const touch = e.touches[0];
    const target = e.target;

    const tag = target.tagName.toLowerCase();

    // Si el elemento o sus padres explicitamente YA están en isContentEditable === true o contenteditable="true"
    // ENTONCES denegamos el drag para permitir que el texto interno ruede/seleccione.
    if (target.contentEditable === 'true' || target.isContentEditable) {
      return;
    }
    const editableParent = target.closest('[contenteditable="true"]');
    if (editableParent) {
      return;
    }

    // SI el elemento es un botón explícito no se hace drag.
    if (['button', 'a'].includes(tag)) {
      return;
    }

    // Reset per-gesture drag state
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    isDraggingRef.current = false;

    isDragging.current = true;
    dragStartPos.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      x: pos.x,
      y: pos.y,
      containerRotation: -rotation,
    };

    // Notificar inmediatamente que el drag comenzó
    onDrag?.({ x: pos.x, y: pos.y });
  };

  const onMouseMoveDrag = (e) => {
    if (dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Si se movió más de 5px, se considera drag
      if (distance > 5) {
        isDraggingRef.current = true;
      }
    }
  };

  const onTouchMoveDrag = (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];

    if (dragStartRef.current) {
      const dx = touch.clientX - dragStartRef.current.x;
      const dy = touch.clientY - dragStartRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Si se movió más de 5px, se considera drag
      if (distance > 5) {
        isDraggingRef.current = true;
      }
    }
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
      x: pos.x,
      y: pos.y,
      rotation: rotation,
    };

    // Bloquear selección de texto durante el resize
    document.body.style.userSelect = 'none';
    document.body.style.WebkitUserSelect = 'none';
    document.body.style.MozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';

    const restoreSelection = () => {
      document.body.style.userSelect = '';
      document.body.style.WebkitUserSelect = '';
      document.body.style.MozUserSelect = '';
      document.body.style.msUserSelect = '';
      window.removeEventListener('mouseup', restoreSelection);
      window.removeEventListener('touchend', restoreSelection);
      window.removeEventListener('touchcancel', restoreSelection);
    };

    window.addEventListener('mouseup', restoreSelection);
    window.addEventListener('touchend', restoreSelection);
    window.addEventListener('touchcancel', restoreSelection);
  };

  const onTouchStartResize = (e) => {
    if (disableResize) return;
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    e.stopPropagation();
    isResizing.current = true;
    resizeStartPos.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      width: sizeState.width,
      height: sizeState.height,
      x: pos.x,
      y: pos.y,
      rotation: rotation,
    };

    // Bloquear selección de texto durante el resize (por si hay mouse+touch híbrido)
    document.body.style.userSelect = 'none';
    document.body.style.WebkitUserSelect = 'none';
    document.body.style.MozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';

    const restoreSelection = () => {
      document.body.style.userSelect = '';
      document.body.style.WebkitUserSelect = '';
      document.body.style.MozUserSelect = '';
      document.body.style.msUserSelect = '';
      window.removeEventListener('mouseup', restoreSelection);
      window.removeEventListener('touchend', restoreSelection);
      window.removeEventListener('touchcancel', restoreSelection);
    };

    window.addEventListener('mouseup', restoreSelection);
    window.addEventListener('touchend', restoreSelection);
    window.addEventListener('touchcancel', restoreSelection);
  };

  // Función para verificar si se está haciendo drag
  const isCurrentlyDragging = () => {
    return isDraggingRef.current;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDownDrag}
      onMouseMove={onMouseMoveDrag}
      onTouchStart={onTouchStartDrag}
      onTouchMove={onTouchMoveDrag}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleTouchEnd}

      onContextMenu={onContextMenu}
      style={getContainerStyle({
        pos,
        rotation,
        sizeState,
        isDragging: isDragging.current,
        isActive,
        zIndexOverride,
        style: {
          ...style,
          visibility: ((typeof x !== 'number' || isNaN(x)) || (typeof y !== 'number' || isNaN(y))) ? 'hidden' : (style.visibility || 'visible'),
          backgroundColor: 'var(--circle-item-bg, var(--color-neutral))',
          backdropFilter: 'var(--circle-item-backdrop, none)',
          WebkitBackdropFilter: 'var(--circle-item-backdrop, none)',
          color: 'var(--color-text-primary)',
          border: 'var(--circle-item-border, 1px solid var(--color-neutral-darker))',
          boxShadow: 'var(--circle-item-shadow, none)',
        }
      })}
      data-is-dragging={isCurrentlyDragging()}
    >
      {children}
      {!disableResize && (
        <div
          data-resize-handle="true"
          onMouseDown={onMouseDownResize}
          onTouchStart={onTouchStartResize}
          className="resize-handle-native z-low"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            cursor: 'nwse-resize',
            borderRadius: '2px',
            zIndex: 100,
          }}
        />
      )}
    </div>
  );
}