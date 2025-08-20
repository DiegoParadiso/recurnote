import React from 'react';
import UnifiedContainer from '../../../common/UnifiedContainer';
import WithContextMenu from '../../../common/WithContextMenu';
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
}) {
  const baseHeight = 30;
  const maxTasks = 4;
  const taskHeight = 30;
  const buttonHeight = 30;
  const visibleTasksCount = Math.min(item.content?.length || 0, maxTasks);

  const computedMinHeight =
    visibleTasksCount >= maxTasks
      ? Math.min(baseHeight + visibleTasksCount * taskHeight, 400)
      : Math.min(baseHeight + visibleTasksCount * taskHeight + buttonHeight, 400);

  const handleTaskChange = (index, value) => {
    const updatedTasks = [...(item.content || [])];
    updatedTasks[index] = value;
    onUpdate?.(id, updatedTasks, item.checked || []);
  };

  const handleCheckChange = (index, checked) => {
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

  return (
    <WithContextMenu
      onDelete={() => onDelete?.(id)}
      extraOptions={[
        { label: 'Duplicar', onClick: () => {} },
        {
          label: "Marcar todas como completadas",
          onClick: () => {
            const allChecked = (item.content || []).map(() => true);
            onUpdate?.(id, item.content || [], allChecked);
          },
        },
      ]}
    >
      <UnifiedContainer
        x={x}
        y={y}
        rotation={rotationEnabled ? rotation : 0}
        width={item.width || 200}
        height={computedMinHeight}
        minWidth={120}
        maxWidth={400}
        minHeight={computedMinHeight}
        maxHeight={computedMinHeight}
        onMove={({ x, y }) => {
          // Calcular el ángulo y distancia desde el centro del círculo
          const dx = x - cx;
          const dy = y - cy;
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Actualizar la posición del item
          onUpdate?.(id, item.content || [], item.checked || [], null, { x, y }, { angle, distance });
          onItemDrag?.(id, { x, y });
        }}
        onResize={(newSize) => {
          const newWidth = Math.min(newSize.width, 400);
          onUpdate?.(id, item.content || [], item.checked || [], { width: newWidth, height: computedMinHeight });
          onResize?.({ width: newWidth, height: computedMinHeight });
        }}
        onDrop={() => {
          onItemDrop?.(id);
        }}
        circleCenter={{ cx, cy }}
        maxRadius={circleSize / 2}
        isSmallScreen={isSmallScreen}
      >
        <div className="taskitem-content">
          {(item.content || []).slice(0, maxTasks).map((task, index) => (
            <div key={index} className="scroll-hidden taskitem-row" style={{ height: taskHeight }}>
              <label
                tabIndex={0}
                className="checkbox-label"
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    handleCheckChange(index, !(item.checked?.[index] || false));
                  }
                }}
              >
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={item.checked?.[index] || false}
                  onChange={(e) => handleCheckChange(index, e.target.checked)}
                />
                <span className={`checkbox-box ${item.checked?.[index] ? 'checked' : ''}`}>
                  <svg viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="checkbox-svg">
                    <path d="M1 5L4 8L11 1" />
                  </svg>
                </span>
              </label>

              <input
                type="text"
                value={task}
                onChange={(e) => handleTaskChange(index, e.target.value)}
                placeholder="Tarea..."
                className="taskitem-input"
              />
            </div>
          ))}

          {(item.content?.length || 0) < maxTasks && (
            <button
              onClick={addTask}
              className="taskitem-addbutton"
              type="button"
            >
              +
            </button>
          )}
        </div>
      </UnifiedContainer>
    </WithContextMenu>
  );
}
