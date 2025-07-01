import { useState } from 'react';
import UnifiedContainer from '../../Shared/UnifiedContainer';

export default function TaskItem({ id, x, y, rotation, item, onMove, onResize, onUpdate, cx, cy, circleSize }) {
  const [tasks, setTasks] = useState(item.content || []);
  const [checks, setChecks] = useState(item.checked || []);
  const [size, setSize] = useState({ width: 200, height: 150 });

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
    setTasks(prev => [...prev, '']);
    setChecks(prev => [...prev, false]);
    onUpdate?.(id, [...tasks, ''], [...checks, false]);
  };

  return (
    <UnifiedContainer
      x={x}
      y={y}
      rotation={rotation}
      width={size.width}
      height={size.height}
      minWidth={120}
      minHeight={100}
      maxWidth={400}
      maxHeight={400}
      onMove={({ x, y }) => onMove?.(id, x, y)}
      onResize={(newSize) => {
        setSize(newSize);
        onResize?.(newSize);
      }}
      circleCenter={{ cx, cy }}
      maxRadius={circleSize / 2}
    >
      <div className="text-black text-[10px] flex flex-col gap-1 overflow-auto" style={{ maxHeight: '100%' }}>
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
