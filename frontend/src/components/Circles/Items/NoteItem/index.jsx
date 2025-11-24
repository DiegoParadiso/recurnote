import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import WithContextMenu from '@components/common/WithContextMenu';
import { useItems } from '@context/ItemsContext';
import { useTranslation } from 'react-i18next';
import useIsMobile from '@hooks/useIsMobile';
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
    } catch (_) {}
    const placeholderText = isMobile ? t('note.placeholderMobile') : t('common.doubleClickToEdit');
    try {
      const cs = window.getComputedStyle(el);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const font = cs.font || `${cs.fontStyle} ${cs.fontVariant} ${cs.fontWeight} ${cs.fontSize} / ${cs.lineHeight} ${cs.fontFamily}`;
      if (ctx) ctx.font = font;
      const measure = (text) => ctx ? ctx.measureText(text).width : Math.max(100, (text || '').length * 6);
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
      const lines = (content || '').split('\n');
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
        onUpdate?.(id, content, null, { width: minW, height });
      }
    } catch (_) {}
    // Recalcular si cambia el idioma, el modo móvil o el tamaño de fuente del textarea
  }, [t, isMobile, width, height, id, content, onUpdate]);

  // Calcular altura mínima en función del contenido y ajustar el contenedor
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
      setMinHeightPx(desiredMinHeight);

      // SIEMPRE actualizar la altura del contenedor para que coincida con el contenido
      // Esto debe hacerse de forma síncrona para evitar cortes
      if (height !== desiredMinHeight) {
        onUpdate?.(id, content, null, { width, height: desiredMinHeight });
      }

      // Ajustar el textarea: usar min-height basado en el contenido para que nunca se corte
      el.style.minHeight = `${scrollHeight}px`;
      el.style.height = '100%'; // Ocupar todo el contenedor disponible
    } catch (_) {}
  }, [content, width, height, id, onUpdate]);

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
        { label: assignedTime ? 'note.changeTime' : 'note.assignTime', onClick: async () => {
          if (assignedTime) {
            await handleClearTime();
          } else {
            await handleAssignTime(timeInput);
          }
        }, preventClose: true },
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
          onUpdate?.(id, content, null, null, { x: newX, y: newY }, { angle, distance });
          flushItemUpdate?.(id);
        }}
        onSizeChange={({ width: newWidth, height: newHeight }) => {
          const clampedWidth = Math.max(minWidthPx, Math.min(newWidth, 320));
          const clampedHeight = Math.max(minHeightPx, Math.min(Math.max(newHeight, 60), MAX_CONTAINER_HEIGHT));
          onUpdate?.(id, content, null, { width: clampedWidth, height: clampedHeight });
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
                  onUpdate?.(id, content, null, { width, height: clamped });
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