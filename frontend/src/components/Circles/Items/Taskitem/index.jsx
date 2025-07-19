import React, { useState } from 'react';
import UnifiedContainer from '../../../common/UnifiedContainer';
import WithContextMenu from '../../../common/WithContextMenu';

export default function TaskItem({
  id,
  x, y, rotation,
  item,
  onMove, onResize,
  onUpdate,
  onDelete,
  cx, cy,
  circleSize
}) {
  const [tasks, setTasks] = useState(item.content || []);
  const [checks, setChecks] = useState(item.checked || []);

  const baseHeight = 30;
  const maxTasks = 4;
  const taskHeight = 30;
  const buttonHeight = 30;
  const visibleTasksCount = Math.min(tasks.length, maxTasks);

  const computedMinHeight =
    visibleTasksCount >= maxTasks
      ? Math.min(baseHeight + visibleTasksCount * taskHeight, 400)
      : Math.min(baseHeight + visibleTasksCount * taskHeight + buttonHeight, 400);

  const handleTaskChange = (index, value) => {
    const updated = [...tasks];
    updated[index] = value;
    setTasks(updated);
    onUpdate?.(id, updated, checks);
  };

  const handleCheckChange = (index, checked) => {
    const updated = [...checks];
    updated[index] = checked;
    setChecks(updated);
    onUpdate?.(id, tasks, updated);
  };

  const addTask = () => {
    if (tasks.length >= maxTasks) return;
    const newTasks = [...tasks, ''];
    const newChecks = [...checks, false];
    setTasks(newTasks);
    setChecks(newChecks);
    onUpdate?.(id, newTasks, newChecks);
  };

  return (
    <WithContextMenu onDelete={() => onDelete?.(id)}>
      <UnifiedContainer
        x={x}
        y={y}
        rotation={rotation}
        width={item.width || 200}
        height={computedMinHeight}
        minWidth={120}
        maxWidth={400}
        minHeight={computedMinHeight}
        maxHeight={computedMinHeight}
        onMove={({ x, y }) => onUpdate?.(id, tasks, checks, null, { x, y })}
        onResize={(newSize) => {
          const newWidth = Math.min(newSize.width, 400);
          onUpdate?.(id, tasks, checks, { width: newWidth, height: computedMinHeight });
          onResize?.({ width: newWidth, height: computedMinHeight });
        }}
        circleCenter={{ cx, cy }}
        maxRadius={circleSize / 2}
      >
        <div
          className="text-black text-[10px] flex flex-col gap-1"
          style={{ flexGrow: 1, overflowY: 'visible', height: 'auto' }}
        >
          {tasks.slice(0, maxTasks).map((task, index) => (
            <div key={index} className="flex items-center gap-2 pt-1 pb-1" style={{ height: taskHeight }}>
              <input
                type="checkbox"
                className="w-[12px] h-[12px] text-neutral-400"
                checked={checks[index] || false}
                onChange={(e) => handleCheckChange(index, e.target.checked)}
              />
              <input
                type="text"
                value={task}
                onChange={(e) => handleTaskChange(index, e.target.value)}
                placeholder="Tarea..."
                className="w-full border-b bg-neutral-100 border-neutral-300 focus:outline-none text-[10px] rounded-sm"
                style={{ padding: '2px 4px' }}
              />
            </div>
          ))}

          {tasks.length < maxTasks && (
            <button
              onClick={addTask}
              className="text-neutral-400 text-[20px] hover:text-neutral-600 text-left"
              type="button"
              style={{ height: buttonHeight, padding: 0, margin: 0, lineHeight: `${buttonHeight}px` }}
            >
              +
            </button>
          )}
        </div>
      </UnifiedContainer>
    </WithContextMenu>
  );
}
