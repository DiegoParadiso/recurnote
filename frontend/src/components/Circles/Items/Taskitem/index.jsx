import React from 'react';
import UnifiedContainer from '../../../common/UnifiedContainer';
import WithContextMenu from '../../../common/WithContextMenu';

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
      {
        label: "Duplicar",
        onClick: () => {
          console.log("Duplicar tarea:", id);
          // Aquí podrías clonar el item
        },
      },
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
        onUpdate?.(id, item.content || [], item.checked || [], null, { x, y });
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
        <div
          className="text-[10px] flex flex-col gap-1"
          style={{
            flexGrow: 1,
            overflowY: 'visible',
            height: 'auto',
            color: 'var(--color-text-primary)',
          }}
        >
          {(item.content || []).slice(0, maxTasks).map((task, index) => (
            <div
              key={index}
              className="flex items-center gap-2 pt-1 pb-1"
              style={{ height: taskHeight }}
            >
              <label
                tabIndex={0}
                className="checkbox-label relative inline-flex items-center cursor-pointer select-none"
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
                  <svg viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M1 5L4 8L11 1"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </label>

              <input
                type="text"
                value={task}
                onChange={(e) => handleTaskChange(index, e.target.value)}
                placeholder="Tarea..."
                className="w-full border-b focus:outline-none text-[10px] rounded-sm"
                style={{
                  padding: '2px 4px',
                  backgroundColor: 'var(--color-neutral)',
                  borderColor: 'var(--color-text-secondary)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
          ))}

          {(item.content?.length || 0) < maxTasks && (
            <button
              onClick={addTask}
              className="text-[20px] text-left"
              type="button"
              style={{
                height: buttonHeight,
                padding: 0,
                margin: 0,
                lineHeight: `${buttonHeight}px`,
                color: 'var(--color-text-secondary)',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = 'var(--color-text-primary)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = 'var(--color-text-secondary)')
              }
            >
              +
            </button>
          )}
        </div>
      </UnifiedContainer>
    </WithContextMenu>
  );
}
