import React, { useRef, useState, useEffect, useCallback } from 'react';
import { DateTime } from 'luxon';
import UnifiedContainer from '@components/common/UnifiedContainer';
import WithContextMenu from '@components/common/WithContextMenu';
import { useItems } from '@context/ItemsContext';
import { useTranslation } from 'react-i18next';
import useIsMobile from '@hooks/useIsMobile';
import useNoteEditing from './hooks/useNoteEditing';
import useNoteSizing from './hooks/useNoteSizing';
import { computePolarFromXY } from '@utils/helpers/geometry';

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
  const [isDragging, setIsDragging] = useState(false);
  // Edición delegada a hook
  const timeoutRef = useRef(null);
  const wasDraggingRef = useRef(false);
  const touchStartPosRef = useRef(null);
  const touchIsDragRef = useRef(false);
  const { content = '', width = 240, height = 80 } = item;
  const { duplicateItem, updateItem, flushItemUpdate, markItemAsDragging, unmarkItemAsDragging } = useItems();
  const editingGraceUntilRef = useRef(0);
  const dragTimeoutRef = useRef(null);
  // Sizing y edición mediante hooks dedicados
  const { minWidthPx, minHeightPx } = useNoteSizing({ textareaRef, content, width, height, id, onUpdate, t, isMobile });
  const { isEditing, setIsEditing, startEditing, stopEditing, focusEditableTextarea, handleTextareaKeyDown } = useNoteEditing({ textareaRef, isMobile, height, id, content, onUpdate });

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

  // Limpiar timeouts cuando se desmonte el componente
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        unmarkItemAsDragging?.(id);
      }
    };
  }, [id, unmarkItemAsDragging]);

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
      
    }
  };

  const handleContainerDragStart = useCallback(() => {
    onActivate?.();
    
    // Marcar el item como en drag inmediatamente
    markItemAsDragging?.(id);
    
    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Pequeño delay para permitir clicks rápidos
    timeoutRef.current = setTimeout(() => {
      setIsDragging(true);
      wasDraggingRef.current = true;
    }, 100);
  }, [id, onActivate, markItemAsDragging]);

  const handleContainerDragEnd = useCallback(() => {
    // Limpiar timeout si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setIsDragging(false);
    
    // Desmarcar el item como en drag
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    dragTimeoutRef.current = setTimeout(() => {
      unmarkItemAsDragging?.(id);
      dragTimeoutRef.current = null;
    }, 300);
    
    setTimeout(() => {
      wasDraggingRef.current = false;
    }, 200);

    onItemDrop?.(id);
    // Flush de posición/dimensiones al finalizar drag
    flushItemUpdate?.(id);
  }, [id, onItemDrop, flushItemUpdate, unmarkItemAsDragging]);


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
        });
      });
    }
  }, []);

  // Sincronizar altura del contenedor con el contenido cuando cambia el ancho (reflujo del texto)
  useEffect(() => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const desiredContainerHeight = Math.max(scrollHeight + 16, height); // sumar padding vertical del contenedor
    if (desiredContainerHeight !== height) {
      onUpdate?.(id, content, null, { width, height: desiredContainerHeight });
    }
    const availableHeight = desiredContainerHeight - 16;
    textarea.style.height = Math.max(scrollHeight, availableHeight) + 'px';
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
        maxHeight={200}
        dragDisabledUntil={editingGraceUntilRef.current}
        onMove={({ x, y }) => {
          // Calcular el ángulo y distancia desde el centro del círculo SIEMPRE
          const { angle, distance } = computePolarFromXY(x, y, cx, cy);
          // Actualizar la posición del item
          // Firma: (id, newContent, newPolar, maybeSize, newPosition, extra)
          onUpdate?.(id, content, null, { width, height }, { x, y }, { angle, distance, fromDrag: true });
          onItemDrag?.(id, { x, y });
        }}
        onResize={(newSize) => {
          const newWidth = Math.max(minWidthPx, Math.min(newSize.width, 400));
          const newHeight = Math.max(minHeightPx, Math.min(Math.max(newSize.height, 40), 300));
          onUpdate?.(id, content, null, { width: newWidth, height: newHeight });
          onResize?.({ width: newWidth, height: newHeight });
        }}
        onDrag={handleContainerDragStart}
        onDrop={handleContainerDragEnd}
        circleCenter={{ cx, cy }}
        maxRadius={maxRadius}
        isSmallScreen={isSmallScreen}
        fullboardMode={fullboardMode}
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
            onTouchStart={(e) => {
              // En móviles: solo activar edición si NO es un intento de drag
              if (isMobile && !isEditing && !isDragging && !wasDraggingRef.current) {
                // Guardar posición inicial para detectar si es drag o click
                touchStartPosRef.current = {
                  x: e.touches[0].clientX,
                  y: e.touches[0].clientY,
                  time: Date.now()
                };
                touchIsDragRef.current = false;
              }
            }}
            onTouchMove={(e) => {
              if (isMobile && !isEditing) {
                e.preventDefault();
              }
            }}
            onTouchEnd={(e) => {
              if (isMobile && touchStartPosRef.current && !touchIsDragRef.current && !isDragging && !wasDraggingRef.current) {
                const timeSinceStart = Date.now() - touchStartPosRef.current.time;
                if (timeSinceStart < 300) {
                  e.stopPropagation(); // Prevenir que el contenedor lo capture ahora
                  setIsEditing(true);
                  requestAnimationFrame(() => {
                    const el = textareaRef.current;
                    if (el) {
                      el.focus();
                      const len = (el.value || '').length;
                      if (typeof el.setSelectionRange === 'function') {
                        el.setSelectionRange(len, len);
                      }
                    }
                  });
                }
              }
              touchStartPosRef.current = null;
              touchIsDragRef.current = false;
            }}
            onClick={() => {
              // En móviles: asegurar que si el touchStart no funcionó, el click sí lo haga
              if (isMobile && !isEditing && !isDragging && !wasDraggingRef.current) {
                startEditing();
                focusEditableTextarea();
              }
            }}
            onDoubleClick={() => {
              // En desktop: doble click activa edición
              if (isMobile) return;
              
              if (!isDragging && !wasDraggingRef.current) {
                startEditing();
                focusEditableTextarea();
              }
            }}
            onFocus={(e) => {
              // En móvil: si el input recibió focus pero no está en modo edición, activarlo
              if (isMobile && !isEditing) {
                startEditing();
                // Asegurar que el teclado se muestre
                setTimeout(() => {
                  e.target.focus();
                }, 0);
              }
              // En desktop - prevenir focus directo, solo por doble click
              if (!isMobile && !isEditing) {
                e.target.blur();
              }
              // Activar período de gracia para evitar micro-drag al iniciar edición
              editingGraceUntilRef.current = Date.now() + 200;
            }}
            onMouseDown={(e) => {
              // En móviles no delegar drag al contenedor
              if (isMobile) return;
              
              // En desktop: si no está editando, delegar el drag al contenedor
              if (!isEditing) {
                e.preventDefault();
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
              // Forzar flush de cambios de texto al salir de edición
              flushItemUpdate?.(id);
            }}
            onKeyDown={handleTextareaKeyDown}
            placeholder={isMobile ? t('note.placeholderMobile') : t('common.doubleClickToEdit')}
            readOnly={isMobile ? false : !isEditing} // En móvil siempre permitir focus nativo
            inputMode="text"
            enterKeyHint="done"
            style={{
              cursor: isMobile ? 'text' : (isEditing ? 'text' : 'grab'),
              opacity: isMobile ? 1 : (isEditing ? 1 : 0.7),
              pointerEvents: (isMobile && !isEditing) ? 'none' : (isDragging ? 'none' : 'auto'),
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