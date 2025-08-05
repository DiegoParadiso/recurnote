import NoteItem from '../Items/NoteItem';
import TaskItem from '../Items/Taskitem';
import ArchiveItem from './ArchiveItem';

export default function ItemsOnCircle({
  items,
  cx,
  cy,
  rotationAngle,
  onNoteDragStart,
  onNoteUpdate,
  onDeleteItem,
  circleSize,
  rotationEnabled = true,
  isSmallScreen,
  onItemDrag,
  onItemDrop
}) {
  return (
    <>
      {items.map((item) => {
        if (item.label === 'Evento') return null; // ← Oculta "Evento"

        const angleInRadians = (item.angle * Math.PI) / 180;
        const x = cx + item.distance * Math.cos(angleInRadians);
        const y = cy + item.distance * Math.sin(angleInRadians);

        // Calculamos rotación solo si está habilitada
        const rotation = rotationEnabled && !isSmallScreen ? -rotationAngle : 0;

        // Render Tarea
        if (item.label === 'Tarea') {
          return (
            <TaskItem
              key={item.id}
              id={item.id}
              x={x}
              y={y}
              rotation={rotation}
              rotationEnabled={rotationEnabled && !isSmallScreen}
              item={item}
              onDragStart={onNoteDragStart}
              onItemDrag={onItemDrag}
              onItemDrop={onItemDrop}
              onUpdate={onNoteUpdate}
              onDelete={() => onDeleteItem(item.id)}
              circleSize={circleSize}
              cx={cx}
              cy={cy}
              isSmallScreen={isSmallScreen}
            />
          );
        }

        // Render Nota
        if (item.label.toLowerCase().includes('nota')) {
          return (
            <NoteItem
              key={item.id}
              id={item.id}
              x={x}
              y={y}
              rotation={rotation}
              rotationEnabled={rotationEnabled}
              item={item}
              onDragStart={onNoteDragStart}
              onItemDrag={onItemDrag}
              onItemDrop={onItemDrop}
              onUpdate={onNoteUpdate}
              onDelete={() => onDeleteItem(item.id)}
              circleSize={circleSize}
              cx={cx}
              cy={cy}
              isSmallScreen={isSmallScreen}
            />
          );
        }

        // Render Archivo
        if (item.label === 'Archivo') {
          return (
            <ArchiveItem
              key={item.id}
              id={item.id}
              x={x}
              y={y}
              rotation={rotation}
              rotationEnabled={rotationEnabled}  
              item={item}
              onUpdate={onNoteUpdate}
              onDelete={onDeleteItem}
              onItemDrag={onItemDrag}
              onItemDrop={onItemDrop}
              cx={cx}
              cy={cy}
              circleSize={circleSize}
              isSmallScreen={isSmallScreen}
            />
          );
        }

        // Fallback genérico
        return (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => onNoteDragStart(e, item.id)}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              cursor: 'grab',
              transform: `rotate(${rotation}deg)`,
              transformOrigin: 'center',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600',
              border: '1px solid var(--color-text-secondary)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text-primary)',
              backdropFilter: 'blur(4px)',
              userSelect: 'none',
            }}
            title={item.label}
          >
            {item.label}
          </div>
        );
      })}
    </>
  );
}
