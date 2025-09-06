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
  onItemDrop,
  activeItemId,
  onItemActivate,
  zOrderMap
}) {
  return (
    <>
      {items.map((item) => {
        if (!item) return null;

        const label = typeof item.label === 'string' ? item.label : null;
        if (!label) return null;

        const angleInRadians = (item.angle * Math.PI) / 180;
        const x = cx + item.distance * Math.cos(angleInRadians);
        const y = cy + item.distance * Math.sin(angleInRadians);

        const rotation = rotationEnabled && !isSmallScreen ? -rotationAngle : 0;
        const zIndexOverride = zOrderMap && typeof zOrderMap[item.id] === 'number' ? zOrderMap[item.id] : undefined;

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
              onUpdate={(...args) => {
                const [id, newContent, newPolar, maybeSize, newPosition, extra] = args;
                onNoteUpdate(id, newContent, newPolar, maybeSize, newPosition, cx, cy, extra);
              }}
              onDelete={() => onDeleteItem(item.id)}
              circleSize={circleSize}
              cx={cx}
              cy={cy}
              isSmallScreen={isSmallScreen}
              isActive={activeItemId === item.id}
              onActivate={() => onItemActivate?.(item.id)}
              zIndexOverride={zIndexOverride}
            />
          );
        }

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
              onUpdate={(...args) => {
                const [id, newContent, newPolar, maybeSize, newPosition, extra] = args;
                onNoteUpdate(id, newContent, newPolar, maybeSize, newPosition, cx, cy, extra);
              }}
              onDelete={() => onDeleteItem(item.id)}
              circleSize={circleSize}
              cx={cx}
              cy={cy}
              isSmallScreen={isSmallScreen}
              isActive={activeItemId === item.id}
              onActivate={() => onItemActivate?.(item.id)}
              zIndexOverride={zIndexOverride}
            />
          );
        }

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
              onUpdate={(...args) => {
                const [id, newContent, newPolar, maybeSize, newPosition, extra] = args;
                onNoteUpdate(id, newContent, newPolar, maybeSize, newPosition, cx, cy, extra);
              }}
              onDelete={onDeleteItem}
              onItemDrag={onItemDrag}
              onItemDrop={onItemDrop}
              cx={cx}
              cy={cy}
              circleSize={circleSize}
              isSmallScreen={isSmallScreen}
              isActive={activeItemId === item.id}
              onActivate={() => onItemActivate?.(item.id)}
              zIndexOverride={zIndexOverride}
            />
          );
        }

        // Otros labels: chip genérico con el texto del label
        return (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => onNoteDragStart(e, item.id)}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              zIndex: typeof zOrderMap?.[item.id] === 'number' ? zOrderMap[item.id] : (activeItemId === item.id ? 'var(--z-floating)' : 'var(--z-mid)'),
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
            title={label}
            onMouseDown={() => onItemActivate?.(item.id)}
          >
            {label}
          </div>
        );
      })}
    </>
  );
}
