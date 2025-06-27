import { useEffect, useRef, useState } from 'react';
import ResizableDraggableContainer from './ResizableDraggableContainer';

export default function TaskItem({
  id,
  x,
  y,
  rotation,
  item,
  onMove,
  onResize,
  onUpdate,
  circleSize,
  cx,
  cy,
}) {
  const [tasks, setTasks] = useState(item.content || []);
  const [checks, setChecks] = useState(item.checked || []);
  const [maxSize, setMaxSize] = useState({ width: 200, height: 150 });
  const [currentSize, setCurrentSize] = useState({ width: 200, height: 150 });

  useEffect(() => {
    const dx = x - cx;
    const dy = y - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = circleSize / 2 - 8;
    const remainingDistance = maxRadius - distance;
    const safeSize = Math.max(40, remainingDistance * Math.SQRT1_2 * 2);

    const width = Math.min(224, safeSize);
    const height = Math.min(214, safeSize);

    setMaxSize({ width, height });
    setCurrentSize((prev) => ({
      width: Math.min(prev.width, width),
      height: Math.min(prev.height, height),
    }));
  }, [x, y, cx, cy, circleSize]);

  const handleTaskChange = (index, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = value;
    setTasks(updatedTasks);
    onUpdate?.(id, updatedTasks, checks);
  };

  const handleCheckChange = (index, checked) => {
    const updatedChecks = [...checks];
    updatedChecks[index] = checked;
    setChecks(updatedChecks);
    onUpdate?.(id, tasks, updatedChecks);
  };

  const addTask = () => {
    const newTasks = [...tasks, ''];
    const newChecks = [...checks, false];
    const estimatedHeight = (newTasks.length + 1) * 30;
    const newHeight = Math.min(estimatedHeight, maxSize.height);

    if (newHeight > currentSize.height) {
      const updatedSize = { width: currentSize.width, height: newHeight };
      setCurrentSize(updatedSize);
      onResize?.(updatedSize);
    }

    setTasks(newTasks);
    setChecks(newChecks);
    onUpdate?.(id, newTasks, newChecks);
  };

  return (
    <ResizableDraggableContainer
      x={x}
      y={y}
      rotation={rotation}
      initialWidth={currentSize.width}
      initialHeight={currentSize.height}
      minWidth={120}
      minHeight={100}
      maxWidth={maxSize.width}
      maxHeight={maxSize.height}
      onMove={({ x, y }) => onMove?.(id, x, y)}
      onResize={({ width, height }) => setCurrentSize({ width, height })}
      style={{
        borderRadius: '0.5rem',
        backgroundColor: '#f5f5f5', // equivale a bg-neutral-100
        border: '1px solid rgba(0,0,0,0.05)',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div className="text-black text-[10px] flex flex-col gap-1 overflow-auto" style={{ height: '100%' }}>
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
        >
          +
        </button>
      </div>
    </ResizableDraggableContainer>
  );
}
