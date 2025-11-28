import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import UnifiedContainer from '@components/common/UnifiedContainer';
import WithContextMenu from '@components/common/WithContextMenu';
import { useItems } from '@context/ItemsContext';
import { useTranslation } from 'react-i18next';
import useIsMobile from '@hooks/useIsMobile';

import useItemDrag from '../hooks/useItemDrag';
import useTaskEditing from './hooks/useTaskEditing';
import useTaskSizing from './hooks/useTaskSizing';
import TaskRow from './TaskRow';
import { computePolarFromXY } from '@utils/helpers/geometry';
import { lockBodyScroll, unlockBodyScroll } from '@utils/scrollLock';

import '@styles/components/circles/items/TaskItem.css';

function TaskItem({
  id,
  x,
  y,
  rotation,
  rotationEnabled = true,
  item,
  onResize,
  onUpdate,
  onDelete,
  cx,
  cy,
  maxRadius,
  isSmallScreen,
  onItemDrag,
  onItemDrop,
  isActive,
  onActivate,
  fullboardMode = false,
}) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const baseHeight = 26;
  const maxTasks = 4;
  const taskHeight = 36;
  const buttonHeight = 30;
  const visibleTasksCount = Math.min(item.content?.length || 0, maxTasks);
  const {
    isDragging,
    wasDraggingRef,
    handleContainerDragStart,
    handleContainerDragEnd,
  } = useItemDrag({ id, onActivate, onItemDrop });
  // Removed local editingInputs state to avoid sync issues
  const inputRefsRef = useRef({});
  const touchStartPosRef = useRef(null);
  const touchIsDragRef = useRef(false);
  const lastPosRef = useRef({ x, y });
  const frozenHeightRef = useRef(null);
  const previousIsDraggingRef = useRef(false);
  // Ref para trackear si estamos haciendo drag "activamente" (desde el evento onDrag)
  // Esto es necesario porque isDragging tiene un delay de 100ms, y si hay updates de props
  // en ese intervalo, el useEffect de sincronización podría sobreescribir lastPosRef
  const isDragActiveRef = useRef(false);

  const {
    editingInputs, // Use directly
    setEditingInputs, // Use directly
    startEditing: startEditingHook,
    stopEditing: stopEditingHook,
    handleInputKeyDown: handleInputKeyDownHook,
    focusEditableInput: focusEditableInputHook,
  } = useTaskEditing({ isMobile, inputRefsRef });

  const calculatedMinHeight =
    visibleTasksCount >= maxTasks || editingInputs.size === 0
      ? Math.min(baseHeight + visibleTasksCount * taskHeight, 400)
      : Math.min(baseHeight + visibleTasksCount * taskHeight + buttonHeight, 400);

  // Congelar la altura cuando comienza el drag, usar altura congelada durante el drag
  // Capturar la altura justo cuando isDragging cambia de false a true
  if (isDragging && !previousIsDraggingRef.current) {
    // Justo cuando comienza el drag, congelar la altura actual
    frozenHeightRef.current = calculatedMinHeight;
  } else if (!isDragging && previousIsDraggingRef.current) {
    // Justo cuando termina el drag, descongelar la altura
    frozenHeightRef.current = null;
  }
  previousIsDraggingRef.current = isDragging;

  const computedMinHeight = isDragging && frozenHeightRef.current !== null
    ? frozenHeightRef.current
    : calculatedMinHeight;

  // Estado local para Y para evitar saltos visuales antes de que onUpdate propague el cambio
  const [localY, setLocalY] = useState(y);
  // Estado local para X para evitar saltos visuales (snap-back) al hacer drop
  const [localX, setLocalX] = useState(x);

  // Sincronizar localY con props.y, pero solo si no estamos en medio de una compensación local
  // Usamos un ref para evitar loops o sobreescrituras incorrectas
  const isCompensatingRef = useRef(false);

  useLayoutEffect(() => {
    if (!isCompensatingRef.current) {
      setLocalY(y);
    }
    isCompensatingRef.current = false;
  }, [y]);

  // Sincronizar localX con props.x
  useLayoutEffect(() => {
    setLocalX(x);
  }, [x]);

  // Compensar la posición Y cuando cambia la altura para mantener el borde superior fijo
  const prevHeightRef = useRef(computedMinHeight);

  useLayoutEffect(() => {
    if (prevHeightRef.current !== computedMinHeight) {
      const delta = computedMinHeight - prevHeightRef.current;
      if (delta !== 0) {
        // Si la altura cambia, ajustar Y localmente de inmediato
        const currentX = localX;
        const newY = localY + delta / 2;

        isCompensatingRef.current = true;
        setLocalY(newY);
        lastPosRef.current = { x: currentX, y: newY };

        // Y persistir el cambio
        onUpdate?.(id, item.content || [], item.checked || [], null, { x: currentX, y: newY });
      }
      prevHeightRef.current = computedMinHeight;
    }
  }, [computedMinHeight, localY, localX, x, id, onUpdate, item.content, item.checked]);

  // Sincronizar lastPosRef con la posición actual (incluyendo compensación local)
  // para asegurar que si se hace drop sin mover (click) o drag inmediato, se use la posición correcta
  // IMPORTANTE: No sincronizar si hay un drag activo (incluso si isDragging aún es false por el delay)
  useEffect(() => {
    if (!isDragging && !isDragActiveRef.current) {
      lastPosRef.current = { x: localX, y: localY };
    }
  }, [localX, localY, isDragging]);

  const { minWidthPx } = useTaskSizing({
    isMobile,
    t,
    inputRefsRef,
    item,
    id,
    onUpdate,
    computedMinHeight,
  });



  // Grace period para evitar que el item se encoja inmediatamente al hacer blur (mousedown para drag)
  const [recentlyEditing, setRecentlyEditing] = useState(false);
  const recentlyEditingTimeoutRef = useRef(null);
  const isEnterPressedRef = useRef(false);

  // Limpiar grace period si comienza un drag para evitar saltos al soltar
  useEffect(() => {
    if (isDragging) {
      setRecentlyEditing(false);
      if (recentlyEditingTimeoutRef.current) {
        clearTimeout(recentlyEditingTimeoutRef.current);
      }
    }
  }, [isDragging]);

  const stopEditing = (index, force = false) => {
    stopEditingHook(index);

    // Si ya no quedan inputs en edición, limpiar el estado inmediatamente
    if (editingInputs.size <= 1) {
      setEditingInputs(new Set());
    }

    // Si se presionó Enter o se fuerza, no aplicar grace period (queremos cierre inmediato)
    if (force || isEnterPressedRef.current) {
      setRecentlyEditing(false);
      // Force clear editing inputs if it's an Enter press to ensure immediate UI update
      setEditingInputs(new Set());

      if (recentlyEditingTimeoutRef.current) clearTimeout(recentlyEditingTimeoutRef.current);
      // Retrasar el reset para asegurar que si hay llamadas consecutivas (ej: blur)
      // también vean el flag en true
      setTimeout(() => {
        isEnterPressedRef.current = false;
      }, 300);
      return;
    }

    setRecentlyEditing(true);
    if (recentlyEditingTimeoutRef.current) clearTimeout(recentlyEditingTimeoutRef.current);
    recentlyEditingTimeoutRef.current = setTimeout(() => {
      setRecentlyEditing(false);
    }, 300);
  };



  // Sizing calculado vía hook dedicado
  // Mostrar botón si: hay espacio, Y (se está editando O se editó recientemente) Y NO se está arrastrando
  const shouldShowButton = (item.content?.length || 0) < maxTasks && (editingInputs.size > 0 || recentlyEditing) && !isDragging;

  const { duplicateItem, flushItemUpdate } = useItems();
  const editingGraceUntilRef = useRef(0);

  const handleDuplicate = async () => {
    try {
      await duplicateItem(id);
    } catch (error) {
      console.error('Error al duplicar item:', error);
    }
  };

  const focusEditableInput = (index) => focusEditableInputHook(index);

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



  // Funciones para manejar edición de inputs
  const startEditing = (index) => startEditingHook(index);

  const handleInputKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      isEnterPressedRef.current = true;
      stopEditing(index, true);
      e.target.blur();
      return;
    }
    handleInputKeyDownHook(e, index);
  };



  // Ancho mínimo ahora es responsabilidad de useTaskSizing

  // Desenfocar inputs y congelar altura cuando se detecta drag desde UnifiedContainer
  // NO limpiar el estado de edición aquí para mantener la altura consistente
  useEffect(() => {
    if (isDragging) {
      // Congelar la altura actual cuando comienza el drag (solo una vez)
      if (frozenHeightRef.current === null) {
        frozenHeightRef.current = calculatedMinHeight;
      }
      // Solo desenfocar todos los inputs cuando se inicia drag
      // Mantener el estado de edición para que la altura no cambie
      Object.values(inputRefsRef.current).forEach(input => {
        if (input && document.activeElement === input) {
          input.blur();
        }
      });
    } else {
      // Cuando termina el drag, descongelar la altura
      frozenHeightRef.current = null;
    }
  }, [isDragging]); // Solo depender de isDragging, no de calculatedMinHeight





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
        x={localX}
        y={localY}
        rotation={rotationEnabled ? rotation : 0}
        width={Math.max(item.width || 200, minWidthPx)}
        height={computedMinHeight}
        minWidth={minWidthPx}
        maxWidth={400}
        minHeight={computedMinHeight}
        maxHeight={computedMinHeight}
        dragDisabledUntil={editingGraceUntilRef.current}
        onMove={({ x, y }) => {
          isDragActiveRef.current = true;
          // Solo desenfocar inputs si están en foco, pero mantener el estado de edición
          Object.values(inputRefsRef.current).forEach(input => {
            if (input && document.activeElement === input) {
              input.blur();
            }
          });
          // Guardar la última posición conocida durante el drag
          lastPosRef.current = { x, y };
          // Notificar al padre para lógica de UI en vivo (sin persistir todavía)
          onItemDrag?.(id, { x, y });
        }}
        onResize={(newSize) => {
          const clampedWidth = Math.max(minWidthPx, Math.min(newSize.width, 400));
          const clampedHeight = computedMinHeight; // altura fija por filas visibles
          onUpdate?.(id, item.content || [], item.checked || [], { width: clampedWidth, height: clampedHeight });
          onResize?.({ width: clampedWidth, height: clampedHeight });
        }}
        onDrag={(e) => {
          isDragActiveRef.current = true;
          handleContainerDragStart(e);
        }}
        onDrop={(...args) => {
          isDragActiveRef.current = false;
          handleContainerDragEnd(...args);
          // Usar la última posición conocida para persistir una sola vez al soltar
          const finalPos = lastPosRef.current || { x: localX, y: localY };

          // Actualización optimista de la posición local para evitar snap-back
          setLocalX(finalPos.x);
          setLocalY(finalPos.y);

          const { angle, distance } = computePolarFromXY(finalPos.x, finalPos.y, cx, cy);
          // Firma: (id, newContent, newPolar, maybeSize, newPosition, extra)
          onUpdate?.(id, item.content || [], item.checked || [], null, { x: finalPos.x, y: finalPos.y }, { angle, distance });
          flushItemUpdate?.(id);
          // Limpiar estado de edición al hacer drop
          setEditingInputs(new Set());
        }}
        circleCenter={{ cx, cy }}
        maxRadius={maxRadius}
        isSmallScreen={isSmallScreen}
        fullboardMode={fullboardMode}
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
            <TaskRow
              key={index}
              index={index}
              task={task}
              checked={item.checked?.[index] || false}
              inputRefsRef={inputRefsRef}
              isMobile={isMobile}
              isDragging={isDragging}
              wasDraggingRef={wasDraggingRef}
              editingInputs={editingInputs}
              setEditingInputs={setEditingInputs}
              handleTaskChange={handleTaskChange}
              handleCheckChange={handleCheckChange}
              startEditing={startEditing}
              stopEditing={stopEditing}
              handleInputKeyDown={handleInputKeyDown}
              focusEditableInput={focusEditableInput}
              touchStartPosRef={touchStartPosRef}
              touchIsDragRef={touchIsDragRef}
              taskHeight={taskHeight}
              placeholder={isMobile ? t('task.placeholderMobile') : t('common.doubleClickToEdit')}
              onInputFocus={() => {
                editingGraceUntilRef.current = Date.now() + 200;
                lockBodyScroll();
              }}
              onInputBlur={() => {
                flushItemUpdate?.(id);
                unlockBodyScroll();
              }}
              onTouchStart={(e) => {
                if (!editingInputs.has(index) && !isDragging && !wasDraggingRef.current) {
                  const dragContainer = e.target.closest('[data-drag-container]');
                  if (dragContainer) {
                    dragContainer.dispatchEvent(new TouchEvent('touchstart', {
                      bubbles: true,
                      cancelable: true,
                      touches: e.touches,
                      targetTouches: e.targetTouches,
                      changedTouches: e.changedTouches
                    }));
                  }
                  e.preventDefault(); // Bloquear scroll también aquí
                }
              }}
            />
          ))}

          {shouldShowButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Agregar tarea
                const newContent = [...(item.content || []), ''];
                const newChecked = [...(item.checked || []), false];
                const newIndex = newContent.length - 1;
                onUpdate?.(id, newContent, newChecked);

                // Iniciar edición del nuevo item
                startEditingHook(newIndex);
                focusEditableInputHook(newIndex);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
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

export default React.memo(TaskItem);
