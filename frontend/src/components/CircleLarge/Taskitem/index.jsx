import { useState } from 'react';
import UnifiedContainer from '../../common/UnifiedContainer';

export default function TaskItem({
  id,
  x, y, rotation,
  item,
  onMove, onResize,
  onUpdate,
  cx, cy,
  circleSize
}) {
  // Estado local para las tareas (strings) y sus checkboxes (booleanos)
  const [tasks, setTasks] = useState(item.content || []);
  const [checks, setChecks] = useState(item.checked || []);

  // Constantes para la altura del contenedor y máximo de tareas visibles
  const baseHeight = 30;      // espacio fijo para padding arriba y abajo
  const maxTasks = 4;         // máximo número de tareas permitidas/visibles
  const taskHeight = 30;      // altura asignada a cada tarea individual
  const buttonHeight = 30;    // altura del botón "+" para agregar tarea

  // Cantidad visible de tareas, limitada al máximo permitido
  const visibleTasksCount = Math.min(tasks.length, maxTasks);

  // Cálculo de la altura del contenedor:
  // Si llegó al máximo, no mostramos el botón y calculamos solo con tareas + base
  // Si no, sumamos espacio para tareas + botón + base
  const computedMinHeight =
    visibleTasksCount >= maxTasks
      ? Math.min(baseHeight + visibleTasksCount * taskHeight, 400)
      : Math.min(baseHeight + visibleTasksCount * taskHeight + buttonHeight, 400);

  // Actualiza el texto de la tarea en la posición 'index'
  const handleTaskChange = (index, value) => {
    const updated = [...tasks];
    updated[index] = value;
    setTasks(updated);
    onUpdate?.(id, updated, checks); // informa cambio al padre
  };

  // Actualiza el estado del checkbox para la tarea en 'index'
  const handleCheckChange = (index, checked) => {
    const updated = [...checks];
    updated[index] = checked;
    setChecks(updated);
    onUpdate?.(id, tasks, updated); // informa cambio al padre
  };

  // Agrega una nueva tarea vacía con checkbox desmarcado
  const addTask = () => {
    if (tasks.length >= maxTasks) return; // prevenir agregar si ya está al límite
    const newTasks = [...tasks, ''];
    const newChecks = [...checks, false];
    setTasks(newTasks);
    setChecks(newChecks);
    onUpdate?.(id, newTasks, newChecks); // informa cambio al padre
  };

  return (
    <UnifiedContainer
      x={x}
      y={y}
      rotation={rotation}
      width={item.width || 200}
      height={computedMinHeight}         // altura fija según tareas + botón
      minWidth={120}
      maxWidth={400}
      minHeight={computedMinHeight}      // bloquea altura para que no cambie
      maxHeight={computedMinHeight}
      onMove={({ x, y }) => {
        onUpdate?.(id, tasks, checks, null, { x, y }); // actualiza posición
      }}
      onResize={(newSize) => {
        const newWidth = Math.min(newSize.width, 400);
        onUpdate?.(id, tasks, checks, {
          width: newWidth,
          height: computedMinHeight  // forzamos altura al redimensionar
        });
        onResize?.({
          width: newWidth,
          height: computedMinHeight
        });
      }}
      circleCenter={{ cx, cy }}
      maxRadius={circleSize / 2}
    >
      {/* Contenedor principal de las tareas */}
      <div
        className="text-black text-[10px] flex flex-col gap-1"
        style={{
          flexGrow: 1,
          overflowY: 'visible', // permitir expandirse sin scroll
          height: 'auto',
        }}
      >
        {/* Renderiza solo las tareas visibles (hasta maxTasks) */}
        {tasks.slice(0, maxTasks).map((task, index) => (
          <div
            key={index}
            className="flex items-center gap-2 pt-1 pb-1"
            style={{ height: taskHeight }}
          >
            {/* Checkbox para marcar tarea como completada */}
            <input
              type="checkbox"
              className="w-[12px] h-[12px] text-neutral-400"
              checked={checks[index] || false}
              onChange={(e) => handleCheckChange(index, e.target.checked)}
            />
            {/* Input de texto para editar la tarea */}
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

        {/* Botón "+" para agregar nueva tarea solo si no se alcanzó el límite */}
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
  );
}
