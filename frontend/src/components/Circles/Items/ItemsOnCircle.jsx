import NoteItem from '../Items/NoteItem';
import TaskItem from '../Items/Taskitem';
import ArchiveItem from '../Items/ArchiveItem/ArchiveItem';
export default function ItemsOnCircle({
  items,
  cx,
  cy,
  rotationAngle,
  onNoteDragStart,
  onNoteUpdate,
  onDeleteItem,
  circleSize,
}) {
  return (
    <>
      {items.map((item) => {
        if (item.label === 'Evento') return null; // ← Oculta "Evento"

        const angleInRadians = (item.angle * Math.PI) / 180;
        const x = cx + item.distance * Math.cos(angleInRadians);
        const y = cy + item.distance * Math.sin(angleInRadians);

        // Render Tarea
        if (item.label === 'Tarea') {
          return (
            <TaskItem
              key={item.id}
              id={item.id}
              x={x}
              y={y}
              rotation={-rotationAngle}
              item={item}
              onDragStart={onNoteDragStart}
              onUpdate={onNoteUpdate}
              onDelete={() => onDeleteItem(item.id)}
              circleSize={circleSize}
              cx={cx}
              cy={cy}
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
              rotation={-rotationAngle}
              item={item}
              onDragStart={onNoteDragStart}
              onUpdate={onNoteUpdate}
              onDelete={() => onDeleteItem(item.id)}
              circleSize={circleSize}
              cx={cx}
              cy={cy}
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
              rotation={-rotationAngle}
              item={item}
              onUpdate={onNoteUpdate}
              onDelete={onDeleteItem}
              cx={cx}
              cy={cy}
              circleSize={circleSize}
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
              transform: `rotate(${-rotationAngle}deg)`,
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