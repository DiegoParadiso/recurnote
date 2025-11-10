import React, { useState, useRef, useEffect } from 'react';
import UnifiedContainer from '@components/common/UnifiedContainer';
import WithContextMenu from '@components/common/WithContextMenu';
import { useItems } from '@context/ItemsContext';
import { useTranslation } from 'react-i18next';
import useIsMobile from '@hooks/useIsMobile';
import useTaskDrag from './hooks/useTaskDrag';
import useTaskEditing from './hooks/useTaskEditing';
import useTaskSizing from './hooks/useTaskSizing';
import TaskRow from './TaskRow';
import { computePolarFromXY } from '@utils/helpers/geometry';

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
  const baseHeight = 10; 
  const maxTasks = 4;
  const taskHeight = 36; 
  const buttonHeight = 30;
  const visibleTasksCount = Math.min(item.content?.length || 0, maxTasks);
  const {
    isDragging,
    wasDraggingRef,
    handleContainerDragStart,
    handleContainerDragEnd,
  } = useTaskDrag({ id, onActivate, onItemDrop });
  const [editingInputs, setEditingInputs] = useState(new Set());
  const inputRefsRef = useRef({});
  const touchStartPosRef = useRef(null);
  const touchIsDragRef = useRef(false);
  // Sizing calculado vía hook dedicado
  const shouldShowButton = (item.content?.length || 0) < maxTasks && editingInputs.size > 0;
  const computedMinHeight =
    visibleTasksCount >= maxTasks || !shouldShowButton
      ? Math.min(baseHeight + visibleTasksCount * taskHeight, 400)
      : Math.min(baseHeight + visibleTasksCount * taskHeight + buttonHeight, 400);

  const { minWidthPx } = useTaskSizing({
    isMobile,
    t,
    inputRefsRef,
    item,
    id,
    onUpdate,
    computedMinHeight,
  });

  const {
    editingInputs: editingInputsHook,
    setEditingInputs: setEditingInputsHook,
    startEditing: startEditingHook,
    stopEditing: stopEditingHook,
    handleInputKeyDown: handleInputKeyDownHook,
    focusEditableInput: focusEditableInputHook,
  } = useTaskEditing({ isMobile, inputRefsRef });

  // Mantener referencias originales delegando en el hook
  useEffect(() => {
    setEditingInputs(editingInputsHook);
  }, [editingInputsHook]);

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
  const stopEditing = (index) => stopEditingHook(index);

  const handleInputKeyDown = (e, index) => handleInputKeyDownHook(e, index);

  // Ancho mínimo ahora es responsabilidad de useTaskSizing

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
        dragDisabledUntil={editingGraceUntilRef.current}
        onMove={({ x, y }) => {
          // Calcular el ángulo y distancia desde el centro del círculo SIEMPRE
          const { angle, distance } = computePolarFromXY(x, y, cx, cy);
          // Actualizar la posición del item
          // Firma: (id, newContent, newPolar, maybeSize, newPosition, extra)
          onUpdate?.(id, item.content || [], item.checked || [], null, { x, y }, { angle, distance, fromDrag: true });
          onItemDrag?.(id, { x, y });
        }}
        onResize={(newSize) => {
          const clampedWidth = Math.max(minWidthPx, Math.min(newSize.width, 400));
          const clampedHeight = computedMinHeight; // altura fija por filas visibles
          onUpdate?.(id, item.content || [], item.checked || [], { width: clampedWidth, height: clampedHeight });
          onResize?.({ width: clampedWidth, height: clampedHeight });
        }}
        onDrag={handleContainerDragStart}
        onDrop={(...args) => {
          handleContainerDragEnd(...args);
          flushItemUpdate?.(id);
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
              onInputFocus={() => { editingGraceUntilRef.current = Date.now() + 200; }}
              onInputBlur={() => { flushItemUpdate?.(id); }}
            />
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

export default React.memo(TaskItem);
