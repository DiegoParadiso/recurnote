import { useState } from 'react';
import UnifiedContainer from '../../Shared/UnifiedContainer';

export default function TaskItem({
  id, x, y, rotation, item, onMove, onResize, onUpdate, cx, cy, circleSize,
}) {
  const [tasks, setTasks] = useState(item.content || []);
  const [checks, setChecks] = useState(item.checked || []);
  const [resizedManually, setResizedManually] = useState(false);

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
    const newTasks = [...tasks, ''];
    const newChecks = [...checks, false];
    setTasks(newTasks);
    setChecks(newChecks);
    onUpdate?.(id, newTasks, newChecks);

    if (!resizedManually) {
      const newHeight = Math.min(100 + newTasks.length * 30, 400);
      // Informamos el nuevo height al padre para actualizar el item
      onUpdate?.(id, newTasks, newChecks, { height: newHeight });
    }
  };

  return (
    <UnifiedContainer
      x={x}
      y={y}
      rotation={rotation}
      width={item.width || 200}
      height={item.height || 100}
      minWidth={120}
      minHeight={100}
      maxWidth={400}
      maxHeight={400}
      onMove={({ x, y }) => onMove?.(id, x, y)}
      onResize={(newSize) => {
        setResizedManually(true);
        onUpdate?.(id, tasks, checks, newSize);
        onResize?.(newSize);
      }}
      circleCenter={{ cx, cy }}
      maxRadius={circleSize / 2}
    >
      <div className="text-black text-[10px] flex flex-col gap-1 overflow-auto" style={{ flexGrow: 1, overflowY: 'auto' }}>
        {tasks.map((task, index) => (
          <div key={index} className="flex items-center gap-2 pt-1 pb-1">
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
        <button
          onClick={addTask}
          className="text-neutral-400 text-[20px] hover:text-neutral-600 text-left"
          type="button"
        >
          +
        </button>
      </div>
    </UnifiedContainer>
  );
}
