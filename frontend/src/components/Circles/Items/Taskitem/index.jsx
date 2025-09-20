import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import UnifiedContainer from '../../../common/UnifiedContainer';
import WithContextMenu from '../../../common/WithContextMenu';
import { useItems } from '../../../../context/ItemsContext';
import { useTranslation } from 'react-i18next';

import '../../../../styles/components/circles/items/TaskItem.css';

export default function TaskItem({
  id,
  x,
  y,
  rotation,
  rotationEnabled = true,
  item,
  onMove,
  onResize,
  onUpdate,
  onDelete,
  cx,
  cy,
  circleSize,
  isSmallScreen,
  onItemDrag,
  onItemDrop,
  isActive,
  onActivate,
}) {
  const { t } = useTranslation();
  const baseHeight = 10; // padding mínimo del contenedor (4px arriba + 4px abajo)
  const maxTasks = 4;
  const taskHeight = 36; // altura con padding de filas (6px arriba + 6px abajo + contenido)
  const buttonHeight = 30;
  const visibleTasksCount = Math.min(item.content?.length || 0, maxTasks);
  const [isDragging, setIsDragging] = useState(false);
  const [editingInputs, setEditingInputs] = useState(new Set());
  const timeoutRef = useRef(null);
  const wasDraggingRef = useRef(false);
  const inputRefsRef = useRef({});
  const [minWidthPx, setMinWidthPx] = useState(140);
  
  // Detectar si es móvil
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  // Calcular altura dinámica basada en si se muestra el botón "+"
  const shouldShowButton = (item.content?.length || 0) < maxTasks && editingInputs.size > 0;
  const computedMinHeight =
    visibleTasksCount >= maxTasks || !shouldShowButton
      ? Math.min(baseHeight + visibleTasksCount * taskHeight, 400)
      : Math.min(baseHeight + visibleTasksCount * taskHeight + buttonHeight, 400);

  const { duplicateItem } = useItems();

  const handleDuplicate = async () => {
    try {
      await duplicateItem(id);
    } catch (error) {
      console.error('Error al duplicar item:', error);
    }
  };

  const handleTaskChange = (index, value) => {
    // No cambiar el texto si acabamos de hacer drag
    if (wasDraggingRef.current || isDragging) {
      return;
    }
    
    const updatedTasks = [...(item.content || [])];
    updatedTasks[index] = value;
    onUpdate?.(id, updatedTasks, item.checked || []);
  };

  const deleteLastTask = () => {
    const currentTasks = [...(item.content || [])];
    const currentChecks = [...(item.checked || [])];
    if (currentTasks.length === 0) return;
    currentTasks.pop();
    if (currentChecks.length > 0) currentChecks.pop();
    onUpdate?.(id, currentTasks, currentChecks);
  };

  const handleCheckChange = (index, checked) => {
    // No cambiar el checkbox si acabamos de hacer drag
    if (wasDraggingRef.current || isDragging) {
      return;
    }
    
    const updatedChecks = [...(item.checked || [])];
    updatedChecks[index] = checked;
    onUpdate?.(id, item.content || [], updatedChecks);
  };

  const addTask = () => {
    if ((item.content?.length || 0) >= maxTasks) return;
    const newTasks = [...(item.content || []), ''];
    const newChecks = [...(item.checked || []), false];
    onUpdate?.(id, newTasks, newChecks);
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
    
    // Reset drag state inmediatamente al terminar
    setIsDragging(false);
    
    // Mantener wasDragging por un breve momento para evitar activaciones
    setTimeout(() => {
      wasDraggingRef.current = false;
    }, 200);
  };

  // Funciones para manejar edición de inputs
  const startEditing = (index) => {
    setEditingInputs(prev => new Set([...prev, index]));
  };

  const stopEditing = (index) => {
    setEditingInputs(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleInputKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Cambiar estado inmediatamente Y hacer blur
      stopEditing(index);
      e.target.blur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      // Cambiar estado inmediatamente Y hacer blur
      stopEditing(index);
      e.target.blur();
    }
  };

  // Calcular ancho mínimo en función del placeholder y del contenido más largo
  useLayoutEffect(() => {
    try {
      // Obtener un input de referencia (el primero visible o crear uno virtual)
      let refInput = null;
      for (const ref of Object.values(inputRefsRef.current)) {
        if (ref) { refInput = ref; break; }
      }

      // Si no hay ningún input aún montado, crear uno temporal para medir estilos
      let tempInput = null;
      if (!refInput) {
        tempInput = document.createElement('input');
        document.body.appendChild(tempInput);
        refInput = tempInput;
      }

      const cs = window.getComputedStyle(refInput);
      // Paddings del UnifiedContainer
      let containerPaddingLeft = 8;
      let containerPaddingRight = 8;
      const dragContainer = document.querySelector('[data-drag-container]');
      const containerEl = dragContainer ? dragContainer.parentElement : null;
      if (containerEl) {
        const ccs = window.getComputedStyle(containerEl);
        containerPaddingLeft = parseFloat(ccs.paddingLeft || '8') || 8;
        containerPaddingRight = parseFloat(ccs.paddingRight || '8') || 8;
      }

      // Preparar canvas con la tipografía efectiva del input
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const font = cs.font || `${cs.fontStyle} ${cs.fontVariant} ${cs.fontWeight} ${cs.fontSize} / ${cs.lineHeight} ${cs.fontFamily}`;
      if (ctx) ctx.font = font;
      const measure = (text) => ctx ? ctx.measureText(text || '').width : Math.max(100, (text || '').length * 6);

      const placeholderText = isMobile ? t('task.placeholderMobile') : t('common.doubleClickToEdit');
      const tasks = (item.content || []).length > 0 ? (item.content || []) : [placeholderText];
      let longest = 0;
      for (const tsk of tasks) {
        longest = Math.max(longest, measure(tsk || placeholderText));
      }

      const paddingLeft = parseFloat(cs.paddingLeft || '0');
      const paddingRight = parseFloat(cs.paddingRight || '0');
      const checkboxAndGaps = 14 /* checkbox */ + 8 /* gap */ + 2 /* minor adj */;
      const borders = 2;
      const extraSafety = 16;
      const desired = Math.ceil(
        longest + paddingLeft + paddingRight + checkboxAndGaps + borders + extraSafety + containerPaddingLeft + containerPaddingRight
      );
      const baseMin = 148;
      const maxAllowed = 400; // permite algo más ancho en tareas
      const minW = Math.max(baseMin, Math.min(maxAllowed, desired));
      setMinWidthPx(minW);

      // Ajustar inmediatamente si el width guardado es menor
      if ((item.width || 200) < minW) {
        onUpdate?.(id, item.content || [], item.checked || [], { width: minW, height: computedMinHeight });
      }

      if (tempInput) {
        document.body.removeChild(tempInput);
      }
    } catch (_) {}
  }, [item.content, item.width, computedMinHeight, id, isMobile, onUpdate, t]);

  // Limpiar inputs cuando se detecta drag desde UnifiedContainer
  useEffect(() => {
    if (isDragging) {
      // Desenfocar todos los inputs cuando se inicia drag
      Object.values(inputRefsRef.current).forEach(input => {
        if (input && document.activeElement === input) {
          input.blur();
        }
      });
      // Limpiar estado de edición durante drag
      setEditingInputs(new Set());
    }
  }, [isDragging]);



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
      extraOptions={[
        { label: 'common.duplicate', onClick: handleDuplicate },
        {
          label: 'task.markAllCompleted',
          onClick: () => {
            const allChecked = (item.content || []).map(() => true);
            onUpdate?.(id, item.content || [], allChecked);
          },
        },
        ...((item.content?.length || 0) > 1 ? [{ label: 'task.deleteLast', onClick: deleteLastTask }] : []),
      ]}
    >
      <UnifiedContainer
        x={x}
        y={y}
        rotation={rotationEnabled ? rotation : 0}
        width={Math.max(item.width || 200, minWidthPx)}
        height={computedMinHeight}
        minWidth={minWidthPx}
        maxWidth={400}
        minHeight={computedMinHeight}
        maxHeight={computedMinHeight}
        onMove={({ x, y }) => {
          // Calcular el ángulo y distancia desde el centro del círculo SIEMPRE
          const dx = x - cx;
          const dy = y - cy;
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Actualizar la posición del item
          onUpdate?.(id, item.content || [], item.checked || [], null, { x, y }, { angle, distance });
          onItemDrag?.(id, { x, y });
        }}
        onResize={(newSize) => {
          const clampedWidth = Math.max(minWidthPx, Math.min(newSize.width, 400));
          const clampedHeight = computedMinHeight; // altura fija por filas visibles
          onUpdate?.(id, item.content || [], item.checked || [], { width: clampedWidth, height: clampedHeight });
          onResize?.({ width: clampedWidth, height: clampedHeight });
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
          className="taskitem-content"
          data-drag-container="true"
          style={{
            userSelect: isDragging ? 'none' : 'auto',
            WebkitUserSelect: isDragging ? 'none' : 'auto',
            MozUserSelect: isDragging ? 'none' : 'auto',
            msUserSelect: isDragging ? 'none' : 'auto',
          }}
        >
          {(item.content || []).slice(0, maxTasks).map((task, index) => (
            <div key={index} className="scroll-hidden taskitem-row" style={{ height: taskHeight }}>
              <label
                tabIndex={0}
                className="checkbox-label"
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    // Solo cambiar si no se está arrastrando
                    if (!isDragging && !wasDraggingRef.current) {
                      handleCheckChange(index, !(item.checked?.[index] || false));
                    }
                  }
                }}
              >
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={item.checked?.[index] || false}
                  onChange={(e) => handleCheckChange(index, e.target.checked)}
                  disabled={isDragging}
                />
                <span className={`checkbox-box ${item.checked?.[index] ? 'checked' : ''}`}>
                  <svg viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="checkbox-svg">
                    <path d="M1 5L4 8L11 1" />
                  </svg>
                </span>
              </label>

              <input
                ref={(el) => {
                  if (el) {
                    inputRefsRef.current[index] = el;
                  }
                }}
                type="text"
                value={task}
                onChange={(e) => handleTaskChange(index, e.target.value)}
                onDoubleClick={(e) => {
                  // En móviles no usar doble click
                  if (isMobile) return;
                  
                  // Solo permitir edición con doble click si no se está arrastrando
                  if (!isDragging && !wasDraggingRef.current) {
                    startEditing(index);
                    // Forzar focus después de activar edición
                    setTimeout(() => {
                      e.target.focus();
                    }, 0);
                  }
                }}
                onFocus={(e) => {
                  // En móviles comportamiento normal
                  if (isMobile) {
                    startEditing(index);
                    return;
                  }
                  
                  // En desktop - prevenir focus directo, solo por doble click
                  if (!editingInputs.has(index)) {
                    e.target.blur();
                  }
                }}
                onMouseDown={(e) => {
                  // En móviles no delegar drag
                  if (isMobile) return;
                  
                  // Si no está en edición, delegar el drag al contenedor padre
                  if (!editingInputs.has(index)) {
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
                  stopEditing(index);
                }}
                onKeyDown={(e) => handleInputKeyDown(e, index)}
                placeholder={isMobile ? t('task.placeholderMobile') : t('common.doubleClickToEdit')}  
                className="taskitem-input"
                readOnly={!editingInputs.has(index)}
                style={{
                  cursor: isMobile ? 'text' : (editingInputs.has(index) ? 'text' : 'grab'),
                  opacity: isMobile ? 1 : (editingInputs.has(index) ? 1 : 0.7),
                  pointerEvents: isDragging ? 'none' : 'auto',
                  backgroundColor: editingInputs.has(index) ? 'var(--color-bg-secondary)' : 'transparent',
                  border: editingInputs.has(index) ? '1px solid var(--color-primary)' : '1px solid transparent',
                }}
              />
            </div>
          ))}

          {shouldShowButton && (
            <button
              onClick={(e) => {
                // Solo agregar tarea si no se está arrastrando
                if (!isDragging && !wasDraggingRef.current) {
                  addTask();
                }
              }}
              className="taskitem-addbutton"
              type="button"
              style={{
                cursor: isDragging ? 'grab' : 'pointer',
                opacity: isDragging ? 0.7 : 1,
              }}
            >
              +
            </button>
          )}
        </div>
      </UnifiedContainer>
    </WithContextMenu>
  );
}
