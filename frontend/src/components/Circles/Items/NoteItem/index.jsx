import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { DateTime } from 'luxon';
import UnifiedContainer from '../../../common/UnifiedContainer';
import WithContextMenu from '../../../common/WithContextMenu';
import { useItems } from '../../../../context/ItemsContext';
import { useTranslation } from 'react-i18next';

import '../../../../styles/components/circles/items/NoteItem.css';

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
  cx,
  cy,
  isSmallScreen,
  onItemDrag,
  onItemDrop,
  isActive,
  onActivate,
}) {
  const { t } = useTranslation();
  const textareaRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const timeoutRef = useRef(null);
  const wasDraggingRef = useRef(false);
  const { content = '', width = 240, height = 80 } = item;
  
  // Detectar si es móvil
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const { duplicateItem } = useItems();
  const { updateItem } = useItems();
  const [minWidthPx, setMinWidthPx] = useState(120);
  const [minHeightPx, setMinHeightPx] = useState(40);

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

  const getCountdownLabel = () => {
    if (!assignedTime) return '';
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const [hh, mm] = (assignedTime || '00:00').split(':').map(v => parseInt(v, 10));
    // Contar respecto de HOY en la zona local (evita desfasajes por item.date)
    const nowTz = DateTime.fromJSDate(now).setZone(tz);
    const baseToday = nowTz.startOf('day');
    const target = baseToday.set({ hour: hh || 0, minute: mm || 0, second: 0, millisecond: 0 });
    const diff = target.diff(nowTz, ['hours', 'minutes']).toObject();
    // Determinar signo manualmente para redondeo correcto
    const totalMin = Math.round(target.diff(nowTz, 'minutes').as('minutes'));
    const sign = totalMin >= 0 ? 1 : -1;
    const absMin = Math.abs(totalMin);
    const hours = Math.floor(absMin / 60);
    const minutes = absMin % 60;
    if (sign > 0) {
      if (hours > 0) {
        return minutes > 0 ? t('note.countdown.in_h_m', { h: hours, m: minutes }) : t('note.countdown.in_h', { h: hours });
      }
      return t('note.countdown.in_m', { m: minutes });
    } else {
      if (hours > 0) {
        return minutes > 0 ? t('note.countdown.ago_h_m', { h: hours, m: minutes }) : t('note.countdown.ago_h', { h: hours });
      }
      return t('note.countdown.ago_m', { m: minutes });
    }
  };

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

  const computedMinHeight = height;

  const handleTextChange = (e) => {
    // No cambiar texto si se está arrastrando
    if (isDragging || wasDraggingRef.current) {
      return;
    }
    onUpdate(id, e.target.value);
    
    // Solo ajustar altura del textarea si está en modo edición
    if (textareaRef.current && isEditing) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const availableHeight = height - 16; // Altura disponible menos padding del contenedor (8+8)
      
      if (scrollHeight > availableHeight) {
        textarea.style.height = scrollHeight + 'px';
      } else {
        textarea.style.height = availableHeight + 'px';
      }
      
      textarea.style.overflowY = 'hidden';
    }
  };

  const handleContainerDragStart = () => {
    onActivate?.();
    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Pequeño delay para permitir clicks rápidos
    timeoutRef.current = setTimeout(() => {
      setIsDragging(true);
      wasDraggingRef.current = true;
    }, 100);
  };

  const handleContainerDragEnd = () => {
    // Limpiar timeout si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setIsDragging(false);
    
    // Mantener wasDragging por un breve momento para evitar activaciones
    setTimeout(() => {
      wasDraggingRef.current = false;
    }, 200);
  };

  // Funciones para manejar edición
  const startEditing = () => {
    setIsEditing(true);
    // Ajustar altura del textarea al iniciar edición
    setTimeout(() => {
      if (textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = scrollHeight + 'px';
        textarea.style.overflowY = 'hidden';
      }
    }, 0);
  };

  const stopEditing = () => {
    setIsEditing(false);
    
    // Usar toda la altura disponible del contenedor
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      requestAnimationFrame(() => {
        const availableHeight = height - 16;
        textarea.style.height = availableHeight + 'px';
        textarea.style.overflowY = 'hidden';
      });
    }
  };

  const handleTextareaKeyDown = (e) => {
    // Permitir salto de línea con Ctrl/Cmd+Enter sin salir de edición
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const el = e.target;
      const start = el.selectionStart ?? content.length;
      const end = el.selectionEnd ?? content.length;
      const newValue = (content || '').slice(0, start) + '\n' + (content || '').slice(end);
      onUpdate(id, newValue);
      // Restaurar caret después de actualizar el estado controlado
      setTimeout(() => {
        try {
          el.selectionStart = el.selectionEnd = start + 1;
        } catch (_) {}
      }, 0);
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Cambiar estado inmediatamente para bloquear visualmente
      stopEditing();
      e.target.blur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      // Cambiar estado inmediatamente para bloquear visualmente
      stopEditing();
      e.target.blur();
    }
  };

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

  // Calcular altura mínima en función del contenido y el ancho disponible
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    try {
      // Asegurar medición real del contenido
      const prevHeight = el.style.height;
      el.style.height = 'auto';

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

      const scrollHeight = el.scrollHeight; // incluye padding del textarea
      const desiredMinHeight = Math.max(40, Math.ceil(scrollHeight + containerPaddingTop + containerPaddingBottom));
      setMinHeightPx(desiredMinHeight);

      // Si el alto actual es menor, ajustarlo inmediatamente
      if (height < desiredMinHeight) {
        onUpdate?.(id, content, null, { width, height: desiredMinHeight });
      }

      // Restaurar altura controlada (se recalculará por otros efectos)
      el.style.height = prevHeight;
    } catch (_) {}
  }, [content, width, height, id, onUpdate]);

  // Desenfocar textarea cuando se detecta drag
  useEffect(() => {
    if (isDragging && textareaRef.current && document.activeElement === textareaRef.current) {
      textareaRef.current.blur();
      setIsEditing(false);
    }
  }, [isDragging]);

  // Ajustar altura del textarea cuando el contenido cambia
  useEffect(() => {
    if (textareaRef.current && isEditing) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      
      // Actualizar el contenedor para que coincida con el contenido
      const newContainerHeight = Math.max(scrollHeight + 8, height);
      if (newContainerHeight !== height) {
        // Usar setTimeout para asegurar que el DOM se actualice
        setTimeout(() => {
          onUpdate?.(id, content, null, { width, height: newContainerHeight });
        }, 0);
      }
      
      textarea.style.height = scrollHeight + 'px';
      textarea.style.overflowY = 'hidden';
    }
  }, [content, isEditing, height, id, onUpdate, width]);

  // Efecto adicional para sincronizar el textarea con el contenedor actualizado
  useEffect(() => {
    if (textareaRef.current && isEditing) {
      const textarea = textareaRef.current;
      // Asegurar que el textarea ocupe toda la altura disponible del contenedor
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const availableHeight = height - 16; // Altura del contenedor menos padding del contenedor (8+8)
      const finalHeight = Math.max(scrollHeight, availableHeight);
      textarea.style.height = finalHeight + 'px';
    }
  }, [height, isEditing]);

  // Efecto para asegurar que el textarea use toda la altura disponible cuando no está en edición
  useEffect(() => {
    if (textareaRef.current && !isEditing) {
      const textarea = textareaRef.current;
      const availableHeight = height - 16; // Altura disponible menos padding del contenedor (8+8)
      textarea.style.height = availableHeight + 'px';
      textarea.style.overflowY = 'hidden';
    }
  }, [height, isEditing]);

  // Efecto específico para manejar cambios de dimensiones del contenedor
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      // Usar requestAnimationFrame para asegurar que el DOM se actualice
      requestAnimationFrame(() => {
        const availableHeight = height - 16; // Altura disponible menos padding del contenedor (8+8)
        textarea.style.height = availableHeight + 'px';
        textarea.style.overflowY = 'hidden';
      });
    }
  }, [width, height]);

  // Efecto para sincronización inicial del textarea
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      // Usar requestAnimationFrame para asegurar que el DOM esté listo
      requestAnimationFrame(() => {
        const availableHeight = height - 16; // Altura disponible menos padding del contenedor (8+8)
        textarea.style.height = availableHeight + 'px';
        textarea.style.overflowY = 'hidden';
      });
    }
  }, [height]);

  // Efecto para sincronización al montar el componente
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      // Doble requestAnimationFrame para asegurar sincronización completa
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const availableHeight = height - 16; // Altura disponible menos padding del contenedor (8+8)
          textarea.style.height = availableHeight + 'px';
          textarea.style.overflowY = 'hidden';
        });
      });
    }
  }, []);

  // Sincronizar altura del contenedor con el contenido cuando cambia el ancho (reflujo del texto)
  useEffect(() => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    // Medir contenido real
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const desiredContainerHeight = Math.max(scrollHeight + 16, height); // sumar padding vertical del contenedor
    if (desiredContainerHeight !== height) {
      // Ajustar la altura del item para evitar scroll interno
      onUpdate?.(id, content, null, { width, height: desiredContainerHeight });
    }
    // Volver a fijar altura del textarea para ocupar el espacio disponible
    const availableHeight = desiredContainerHeight - 16;
    textarea.style.height = Math.max(scrollHeight, availableHeight) + 'px';
    textarea.style.overflowY = 'hidden';
  }, [width]);



  // Limpiar timeouts cuando se desmonte el componente
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <WithContextMenu
      onDelete={() => onDelete?.(id)}
      headerContent={(
        <>
          <span className="clock" aria-live={assignedTime ? 'polite' : undefined}>
            {assignedTime
              ? getCountdownLabel()
              : now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!assignedTime && (
            <input
              type="time"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              aria-label={t('note.assignTimeAria')}
            />
          )}
        </>
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
      <UnifiedContainer
        x={x}
        y={y}
        rotation={rotationEnabled ? rotation : 0}
        width={width}
        height={height}
        minWidth={minWidthPx}
        minHeight={minHeightPx}
        maxWidth={224}
        maxHeight={800}
        style={{ overflow: 'hidden' }}
        onMove={({ x, y }) => {
          // Calcular el ángulo y distancia desde el centro del círculo SIEMPRE
          const dx = x - cx;
          const dy = y - cy;
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Actualizar la posición del item
          onUpdate?.(id, content, null, null, { x, y }, { angle, distance });
          onItemDrag?.(id, { x, y });
        }}
        onResize={(newSize) => {
          const newWidth = Math.max(minWidthPx, Math.min(newSize.width, 400));
          const newHeight = Math.max(minHeightPx, Math.min(Math.max(newSize.height, 40), 800));
          onUpdate?.(id, content, null, { width: newWidth, height: newHeight });
          onResize?.({ width: newWidth, height: newHeight });
        }}
        onDrag={handleContainerDragStart}
        onDrop={handleContainerDragEnd}
        circleCenter={{ cx, cy }}
        maxRadius={circleSize / 2}
        isSmallScreen={isSmallScreen}
        isActive={isActive}
        onActivate={() => onActivate?.()}
        zIndexOverride={item.zIndexOverride}
      >
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
        <textarea
          ref={textareaRef}
          className="noteitem-textarea"
          value={content}
          onChange={handleTextChange}
          onDoubleClick={(e) => {
            // En móviles no usar doble click
            if (isMobile) return;
            
            // Solo permitir edición con doble click si no se está arrastrando
            if (!isDragging && !wasDraggingRef.current) {
              startEditing();
              // Forzar focus después de activar edición
              setTimeout(() => {
                e.target.focus();
              }, 0);
            }
          }}
          onFocus={(e) => {
            // En móviles comportamiento normal
            if (isMobile) {
              startEditing();
              return;
            }
            
            // En desktop - prevenir focus directo, solo por doble click
            if (!isEditing) {
              e.target.blur();
            }
          }}
          onMouseDown={(e) => {
            // En móviles no delegar drag
            if (isMobile) return;
            
            // Si no está en edición, delegar el drag al contenedor padre
            if (!isEditing) {
              e.preventDefault();
              // Buscar el contenedor de drag y simular mousedown ahí
              const dragContainer = e.target.closest('[data-drag-container]');
              if (dragContainer) {
                const mouseEvent = new MouseEvent('mousedown', {
                  bubbles: true,
                  cancelable: true,
                  clientX: e.clientX,
                  clientY: e.clientY,
                  button: e.button
                });
                dragContainer.dispatchEvent(mouseEvent);
              }
            }
          }}
          onBlur={() => {
            stopEditing();
          }}
          onKeyDown={handleTextareaKeyDown}
          placeholder={isMobile ? t('note.placeholderMobile') : t('common.doubleClickToEdit')}
          readOnly={!isEditing}
          style={{
            cursor: isMobile ? 'text' : (isEditing ? 'text' : 'grab'),
            opacity: isMobile ? 1 : (isEditing ? 1 : 0.7),
            pointerEvents: isDragging ? 'none' : 'auto',
            backgroundColor: isEditing ? 'var(--color-bg-secondary)' : 'transparent',
            border: isEditing ? '1px solid var(--color-primary)' : '1px solid transparent',
            resize: isEditing ? 'none' : 'none',
          }}
        />
        </div>
      </UnifiedContainer>
    </WithContextMenu>
  );
}
