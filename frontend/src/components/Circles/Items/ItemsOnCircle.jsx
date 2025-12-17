import NoteItem from '@components/Circles/Items/NoteItem';
import TaskItem from '@components/Circles/Items/Taskitem';
import ArchiveItem from '@components/Circles/Items/ArchiveItem';
import { limitPositionInsideScreen } from '@utils/helpers/geometry';
import { getItemDimensions } from '@utils/helpers/itemHelpers';

export default function ItemsOnCircle({
  items,
  cx,
  cy,
  rotationAngle,
  onNoteDragStart,
  onNoteUpdate,
  onDeleteItem,
  circleSize,
  maxRadius,
  rotationEnabled = true,
  isSmallScreen,
  onItemDrag,
  onItemDrop,
  activeItemId,
  onItemActivate,
  zOrderMap,
  onErrorToast,
  fullboardMode = false,
  containerWidth = 800,
  containerHeight = 600,
}) {
  return (
    <>
      {items.map((item) => {
        if (!item) return null;

        const label = typeof item.label === 'string' ? item.label : null;
        if (!label) return null;

        // En fullboard mode, usar coordenadas absolutas (x, y) directamente si existen.
        // Si no existen x,y (items antiguos), calcularlos desde angle/distance y limitar una sola vez.
        // En modo normal, calcular desde ángulo y distancia (el clamp en tiempo real lo hace UnifiedContainer).
        let x, y;
        if (isSmallScreen) {
          if (item.mobile_x !== undefined && item.mobile_x !== null && item.mobile_y !== undefined && item.mobile_y !== null) {
            x = parseFloat(item.mobile_x);
            y = parseFloat(item.mobile_y);
          } else {
            // Fallback para mobile si no hay coordenadas guardadas: usar posición del círculo
            // pero adaptada a la pantalla (o simplemente centro)
            const angleInRadians = (item.angle * Math.PI) / 180;
            x = cx + item.distance * Math.cos(angleInRadians);
            y = cy + item.distance * Math.sin(angleInRadians);
          }
        } else if (fullboardMode) {
          if (item.fullboard_x !== undefined && item.fullboard_x !== null && item.fullboard_y !== undefined && item.fullboard_y !== null) {
            // Usar coordenadas específicas de fullboard si existen
            x = parseFloat(item.fullboard_x);
            y = parseFloat(item.fullboard_y);
          } else if (item.x !== undefined && item.y !== undefined) {
            // Fallback: usar x,y si ya fueron calculados/guardados (limitados en tiempo real)
            x = item.x;
            y = item.y;
          } else {
            // Item antiguo: calcular desde angle/distance y limitar una sola vez con dimensiones reales
            const angleInRadians = (item.angle * Math.PI) / 180;
            const viewportCenterX = typeof window !== 'undefined' ? window.innerWidth / 2 : 400;
            const viewportCenterY = typeof window !== 'undefined' ? window.innerHeight / 2 : 300;
            const scaledDistance = Math.min(item.distance, Math.min(viewportCenterX, viewportCenterY) * 0.7);
            const rawX = viewportCenterX + scaledDistance * Math.cos(angleInRadians);
            const rawY = viewportCenterY + scaledDistance * Math.sin(angleInRadians);
            const { width, height } = getItemDimensions(item);
            const limited = limitPositionInsideScreen(rawX, rawY, width, height);
            x = limited.x;
            y = limited.y;
          }
        } else {
          const angleInRadians = (item.angle * Math.PI) / 180;
          x = cx + item.distance * Math.cos(angleInRadians);
          y = cy + item.distance * Math.sin(angleInRadians);
        }

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
                const { fromDrag, ...restExtra } = extra || {};
                const opts = fromDrag !== undefined ? { fromDrag } : {};
                onNoteUpdate(id, newContent, newPolar, maybeSize, newPosition, cx, cy, restExtra, opts);
              }}
              onDelete={() => onDeleteItem(item.id)}
              circleSize={circleSize}
              maxRadius={maxRadius}
              cx={cx}
              cy={cy}
              isSmallScreen={isSmallScreen}
              isActive={activeItemId === item.id}
              onActivate={() => onItemActivate?.(item.id)}
              zIndexOverride={zIndexOverride}
              fullboardMode={fullboardMode}
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
                const { fromDrag, ...restExtra } = extra || {};
                const opts = fromDrag !== undefined ? { fromDrag } : {};
                onNoteUpdate(id, newContent, newPolar, maybeSize, newPosition, cx, cy, restExtra, opts);
              }}
              onDelete={() => onDeleteItem(item.id)}
              circleSize={circleSize}
              maxRadius={maxRadius}
              cx={cx}
              cy={cy}
              isSmallScreen={isSmallScreen}
              isActive={activeItemId === item.id}
              onActivate={() => onItemActivate?.(item.id)}
              zIndexOverride={zIndexOverride}
              fullboardMode={fullboardMode}
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
                const { fromDrag, ...restExtra } = extra || {};
                const opts = fromDrag !== undefined ? { fromDrag } : {};
                onNoteUpdate(id, newContent, newPolar, maybeSize, newPosition, cx, cy, restExtra, opts);
              }}
              onDelete={onDeleteItem}
              onItemDrag={onItemDrag}
              onItemDrop={onItemDrop}
              cx={cx}
              cy={cy}
              circleSize={circleSize}
              maxRadius={maxRadius}
              isSmallScreen={isSmallScreen}
              isActive={activeItemId === item.id}
              onActivate={() => onItemActivate?.(item.id)}
              zIndexOverride={zIndexOverride}
              onErrorToast={onErrorToast}
              fullboardMode={fullboardMode}
            />
          );
        }

        // Otros labels
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
              fontWeight: '600',
              border: '1px solid var(--color-neutral-darker)',
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
