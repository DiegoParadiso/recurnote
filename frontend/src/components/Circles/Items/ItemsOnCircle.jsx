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
        if (!item) return null;

        const label = typeof item.label === 'string' ? item.label : '';
        const angleInRadians = (item.angle * Math.PI) / 180;
        const x = cx + item.distance * Math.cos(angleInRadians);
        const y = cy + item.distance * Math.sin(angleInRadians);

        const rotation = rotationEnabled && !isSmallScreen ? -rotationAngle : 0;

        // Placeholder for pending items (awaiting server id)
        if (item._pending) {
          return (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                width: 14,
                height: 14,
                borderRadius: '9999px',
                backgroundColor: 'var(--color-text-secondary)',
                opacity: 0.4,
              }}
              title="Guardando..."
            />
          );
        }

        // Guard: if label missing, render generic chip
        if (!label) {
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
              title="Item"
            >
              Item
            </div>
          );
        }

        // Render Tarea
        if (label === 'Tarea') {
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
        if (label.toLowerCase().includes('nota')) {
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
        if (label === 'Archivo') {
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
            title={label || 'Item'}
          >
            {label || 'Item'}
          </div>
        );
      })}
    </>
  );
}
