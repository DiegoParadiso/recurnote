import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import WithContextMenu from '@components/common/WithContextMenu';
import { useItems } from '@context/ItemsContext';
import { useTranslation } from 'react-i18next';
import useIsMobile from '@hooks/useIsMobile';
import { getFontFromComputedStyle, measureTextWidth } from '@utils/measureTextWidth';
import { stripMarkdown } from '@utils/markdownConverter';
import { computePolarFromXY } from '@utils/helpers/geometry';
import NoteItemClock from './NoteItemClock';
import NoteItemEditor from './NoteItemEditor';
import NoteItemContainer from './NoteItemContainer';

import '@styles/components/circles/items/NoteItem.css';

export default function NoteItem({
  id,
  x,
  y,
  rotation,
  rotationEnabled = true,
  item,
  onUpdate,
  onResize,
  onDelete,
  circleSize,
  maxRadius,
  cx,
  cy,
  isSmallScreen,
  onItemDrag,
  onItemDrop,
  isActive,
  onActivate,
  fullboardMode = false,
}) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const textareaRef = useRef(null);
  const { content = '', width = 240, height = 80 } = item;
  const { duplicateItem } = useItems();
  const { updateItem, flushItemUpdate } = useItems();
  const [minWidthPx, setMinWidthPx] = useState(120);
  const [minHeightPx, setMinHeightPx] = useState(60);

  const handleDuplicate = async () => {
    try {
      await duplicateItem(id);
    } catch (error) {
      console.error('Error al duplicar item:', error);
    }
  };

  // Horario asignado (opcional) en item.time (HH:MM)
  const assignedTime = item?.time || null;
  const [timeInput, setTimeInput] = useState(assignedTime || (() => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  })());

  // Reloj para countdown dinámico
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000); // actualizar cada 30s
    return () => clearInterval(interval);
  }, []);

  const handleAssignTime = async (value) => {
    try {
      await updateItem(id, { time: value });
    } catch (error) {
      console.error('Error asignando horario:', error);
    }
  };

  const handleClearTime = async () => {
    try {
      await updateItem(id, { time: null });
    } catch (error) {
      console.error('Error quitando horario:', error);
    }
  };

  const MAX_CONTAINER_HEIGHT = 260;

  // Calcular ancho mínimo basado en el placeholder actual y estilos reales
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    // Detectar paddings del contenedor padre (UnifiedContainer)
    let containerPaddingLeft = 8;
    let containerPaddingRight = 8;
    try {
      const dragWrapper = el.closest('[data-drag-container]');
      const containerEl = dragWrapper ? dragWrapper.parentElement : null;
      if (containerEl) {
        const ccs = window.getComputedStyle(containerEl);
        containerPaddingLeft = parseFloat(ccs.paddingLeft || '8') || 8;
        containerPaddingRight = parseFloat(ccs.paddingRight || '8') || 8;
      }
    } catch (_) { }
    const placeholderText = isMobile ? t('note.placeholderMobile') : t('common.doubleClickToEdit');
    try {
      const cs = window.getComputedStyle(el);
      const font = getFontFromComputedStyle(cs);
      const measure = (text) => measureTextWidth(text, font);

      const paddingLeft = parseFloat(cs.paddingLeft || '0');
      const paddingRight = parseFloat(cs.paddingRight || '0');
      const borders = 2;
      const extraSafety = 16; // separa visualmente del handle de 3 puntos y margen interior
      // Medir placeholder
      const placeholderWidth = measure(placeholderText);
      const desiredFromPlaceholder = Math.ceil(
        placeholderWidth + paddingLeft + paddingRight + borders + extraSafety + containerPaddingLeft + containerPaddingRight
      );
      // Medir línea más larga del contenido actual
      const plainContent = stripMarkdown(content || '');
      const lines = plainContent.split('\n');
      let longest = 0;
      for (const line of lines) {
        longest = Math.max(longest, measure(line));
      }
      const desiredFromContent = Math.ceil(
        longest + paddingLeft + paddingRight + borders + extraSafety + containerPaddingLeft + containerPaddingRight
      );
      // Tomar el mayor de ambos
      const desired = Math.max(desiredFromPlaceholder, desiredFromContent);
      const baseMin = 148; // base mínima ajustada considerando paddings y handle
      const maxAllowed = 224; // consistente con maxWidth del contenedor
      const minW = Math.max(baseMin, Math.min(maxAllowed, desired));
      setMinWidthPx(minW);
      // Asegurar que el ancho actual no sea menor al mínimo
      if (width < minW) {
        const deltaW = minW - width;

        const rotRad = ((rotation || 0) * Math.PI) / 180;
        const cos = Math.cos(rotRad);
        const sin = Math.sin(rotRad);

        // Only width changes (deltaH = 0)
        const deltaX = (deltaW / 2) * cos;
        const deltaY = (deltaW / 2) * sin;

        const newX = x + deltaX;
        const newY = y + deltaY;

        let valid = true;
        if (cx !== undefined && cy !== undefined && maxRadius !== undefined) {
          const halfW = minW / 2;
          const halfH = height / 2;
          const corners = [
            { x: newX - halfW, y: newY - halfH },
            { x: newX + halfW, y: newY - halfH },
            { x: newX - halfW, y: newY + halfH },
            { x: newX + halfW, y: newY + halfH }
          ];
          for (const c of corners) {
            if ((c.x - cx) ** 2 + (c.y - cy) ** 2 > maxRadius ** 2) {
              valid = false;
              break;
            }
          }
        }

        if (valid) {
          onUpdate?.(id, content, null, { width: minW, height }, { x: newX, y: newY });
        }
      }
    } catch (_) { }
    // Recalcular si cambia el idioma, el modo móvil o el tamaño de fuente del textarea
  }, [t, isMobile, width, height, id, content, onUpdate]);

  // Calcular altura mínima en función del contenido (SOLO para limitar el resize, NO auto-resize)
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    try {
      // Paddings del contenedor padre (UnifiedContainer)
      let containerPaddingTop = 8;
      let containerPaddingBottom = 8;
      const dragWrapper = el.closest('[data-drag-container]');
      const containerEl = dragWrapper ? dragWrapper.parentElement : null;
      if (containerEl) {
        const ccs = window.getComputedStyle(containerEl);
        containerPaddingTop = parseFloat(ccs.paddingTop || '8') || 8;
        containerPaddingBottom = parseFloat(ccs.paddingBottom || '8') || 8;
      }

      // Medir el contenido real con altura automática temporalmente
      const prevHeight = el.style.height;
      el.style.height = 'auto';
      const scrollHeight = el.scrollHeight; // altura real del contenido

      // Calcular la altura deseada: contenido + paddings del contenedor
      const desiredMinHeight = Math.max(60, Math.ceil(scrollHeight + containerPaddingTop + containerPaddingBottom));

      // Actualizar el minHeight para que el usuario no pueda achicarlo más que el texto
      setMinHeightPx(desiredMinHeight);

      // Restaurar altura
      el.style.height = prevHeight;
    } catch (_) { }
  }, [content, width, height]);


  return (
    <WithContextMenu
      onDelete={() => onDelete?.(id)}
      headerContent={(
        <NoteItemClock
          assignedTime={assignedTime}
          now={now}
          timeInput={timeInput}
          onTimeInputChange={setTimeInput}
          onAssignTime={handleAssignTime}
          onClearTime={handleClearTime}
        />
      )}
      extraOptions={[
        {
          label: assignedTime ? 'note.changeTime' : 'note.assignTime', onClick: async () => {
            if (assignedTime) {
              await handleClearTime();
            } else {
              await handleAssignTime(timeInput);
            }
          }, preventClose: true
        },
        ...(assignedTime ? [{ label: 'note.clearTime', onClick: handleClearTime }] : []),
        { label: 'common.duplicate', onClick: handleDuplicate },
      ]}
    >
      <NoteItemContainer
        id={id}
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={rotation}
        rotationEnabled={rotationEnabled}
        circleCenter={{ cx, cy }}
        maxRadius={maxRadius}
        isSmallScreen={isSmallScreen}
        fullboardMode={fullboardMode}
        isActive={isActive}
        onActivate={() => onActivate?.()}
        onItemDrag={onItemDrag}
        onItemDrop={onItemDrop}
        minWidth={minWidthPx}
        minHeight={minHeightPx}
        maxWidth={320}
        maxHeight={MAX_CONTAINER_HEIGHT}
        onPositionChange={({ x: newX, y: newY, angle, distance }) => {
          // Persistir posición final y geometría una sola vez al soltar
          onUpdate?.(id, content, null, null, { x: newX, y: newY }, { angle, distance, fullboardMode });
          flushItemUpdate?.(id);
        }}
        onSizeChange={({ width: newWidth, height: newHeight, x: newX, y: newY }) => {
          // Check if new width causes height overflow
          // We need to estimate height at newWidth.
          // This is tricky without a ref to the editor's content or a measurement utility.
          // But we have textareaRef!

          let validWidth = newWidth;

          if (textareaRef.current) {
            const el = textareaRef.current;
            // Temporarily set width to measure height
            const prevWidth = el.style.width;
            const prevHeight = el.style.height;
            const prevWhiteSpace = el.style.whiteSpace;

            // We need to measure the inner content height given the new outer width.
            // The outer container width is newWidth.
            // The editor has padding.
            // Let's try to simulate the width on the element.

            // Note: This might cause layout thrashing.
            // But it's on resize, which is already heavy.

            // Calculate inner width available for text
            // We can't easily set width on the element because it's controlled by parent.
            // But we can clone it or use a hidden div.

            // Simpler approach:
            // If we are shrinking width, check scrollHeight.

            if (newWidth < width) {
              el.style.width = `${newWidth}px`;
              el.style.height = 'auto';
              const estimatedHeight = el.scrollHeight;

              // Restore
              el.style.width = prevWidth;
              el.style.height = prevHeight;

              // Calculate overhead (padding/border of parent container)
              // height is outer height.
              // estimatedHeight is inner content height.
              // We need to compare estimatedHeight + overhead vs MAX_CONTAINER_HEIGHT.

              // Overhead approximation:
              // We don't know exact overhead here easily without measuring container.
              // But we know MAX_CONTAINER_HEIGHT is 260.
              // And we know the current height.

              // Let's assume the editor takes full height minus some small padding if any.
              // Actually NoteItemEditor takes 100% height.
              // So estimatedHeight IS the content height.
              // But the container has a max height.

              // If estimatedHeight > MAX_CONTAINER_HEIGHT, then we can't shrink to this width.
              if (estimatedHeight > MAX_CONTAINER_HEIGHT) {
                // Prevent shrink
                validWidth = width; // Keep old width? Or find min width?
                // For now, just block the resize if it violates.
                // Ideally we find the exact width that fits, but that's expensive.
                // Blocking is safer.
              }
            }
          }

          const clampedWidth = Math.max(minWidthPx, Math.min(validWidth, 320));
          const clampedHeight = Math.max(minHeightPx, Math.min(Math.max(newHeight, 60), MAX_CONTAINER_HEIGHT));

          const posUpdate = (newX !== undefined && newY !== undefined) ? { x: newX, y: newY } : null;
          let extra = null;

          if (posUpdate) {
            const { angle, distance } = computePolarFromXY(posUpdate.x, posUpdate.y, cx, cy);
            extra = { angle, distance, fullboardMode };
          }

          onUpdate?.(id, content, null, { width: clampedWidth, height: clampedHeight }, posUpdate, extra);
          onResize?.({ width: clampedWidth, height: clampedHeight });
        }}
        zIndexOverride={item.zIndexOverride}
      >
        {({ isDragging }) => (
          <div
            data-drag-container="true"
            style={{
              userSelect: isDragging ? 'none' : 'auto',
              WebkitUserSelect: isDragging ? 'none' : 'auto',
              MozUserSelect: isDragging ? 'none' : 'auto',
              msUserSelect: isDragging ? 'none' : 'auto',
              width: '100%',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="noteitem-draghandle">
              <div className="noteitem-dot"></div>
              <div className="noteitem-dot"></div>
              <div className="noteitem-dot"></div>
            </div>
            <NoteItemEditor
              id={id}
              content={content}
              width={width}
              height={height}
              onUpdate={onUpdate}
              isDragging={isDragging}
              onHeightChange={(newHeight) => {
                const clamped = Math.max(minHeightPx, Math.min(newHeight, MAX_CONTAINER_HEIGHT));
                if (clamped !== height) {
                  const deltaH = clamped - height;

                  const rotRad = ((rotation || 0) * Math.PI) / 180;
                  const cos = Math.cos(rotRad);
                  const sin = Math.sin(rotRad);

                  // Only height changes (deltaW = 0)
                  // deltaX = (0) * cos - (deltaH/2) * sin
                  // deltaY = (0) * sin + (deltaH/2) * cos
                  const deltaX = -(deltaH / 2) * sin;
                  const deltaY = (deltaH / 2) * cos;

                  const newX = x + deltaX;
                  const newY = y + deltaY;

                  let valid = true;
                  if (cx !== undefined && cy !== undefined && maxRadius !== undefined) {
                    const halfW = width / 2;
                    const halfH = clamped / 2;
                    const corners = [
                      { x: newX - halfW, y: newY - halfH },
                      { x: newX + halfW, y: newY - halfH },
                      { x: newX - halfW, y: newY + halfH },
                      { x: newX + halfW, y: newY + halfH }
                    ];
                    for (const c of corners) {
                      if ((c.x - cx) ** 2 + (c.y - cy) ** 2 > maxRadius ** 2) {
                        valid = false;
                        break;
                      }
                    }
                  }

                  if (valid) {
                    onUpdate?.(id, content, null, { width, height: clamped }, { x: newX, y: newY });
                  }
                }
              }}
              textareaRef={textareaRef}
            />
          </div>
        )}
      </NoteItemContainer>
    </WithContextMenu>
  );
}