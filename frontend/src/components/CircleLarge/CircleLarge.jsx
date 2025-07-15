import { useState, useEffect, useRef } from 'react'; 
import CircleSmall from '../CircleSmall/CircleSmall';
import NotesArea from './NotesArea';
import NoteItem from './NoteItem/index';
import TaskItem  from './Taskitem/index';
import { DateTime } from 'luxon';
import useHandleDrop from '../../hooks/useDropHandler';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import useRotationControls from '../../hooks/useRotationControls';

export default function CircleLarge({ showSmall }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const { width } = useWindowDimensions();
  const containerRef = useRef(null);
  const [circleSize, setCircleSize] = useState(680);
  const [droppedItems, setDroppedItems] = useState([]);
  const [rotationAngle, setRotationAngle] = useState(0);
  const rotationSpeed = 2;

  const handleDeleteItem = (id) => {
    setDroppedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    prevRotationRef,
  } = useRotationControls({ containerRef, rotationAngle, setRotationAngle, rotationSpeed });

  useEffect(() => {
    if (containerRef.current) {
      const size = containerRef.current.offsetWidth;
      setCircleSize(size);
    }
  }, [width]);

  useEffect(() => {
    const delta = (rotationAngle - prevRotationRef.current + 360) % 360;
    if (delta !== 0) {
      setDroppedItems((prev) =>
        prev.map((it) => ({ ...it, angle: (it.angle + delta) % 360 }))
      );
    }
    prevRotationRef.current = rotationAngle;
  }, [rotationAngle, prevRotationRef]);

  const displayText = selectedDay
    ? DateTime.fromObject({
        day: selectedDay.day,
        month: selectedDay.month,
        year: selectedDay.year,
      })
        .setLocale('es')
        .toFormat('cccc d, yyyy')
    : 'Bienvenido';

  const isSmallScreen = width <= 640;
  const radius = circleSize / 2 - 40;
  const cx = circleSize / 2;
  const cy = circleSize / 2;
  const arcStartX = cx - radius;
  const arcEndX = cx + radius;

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = useHandleDrop({
    containerRef,
    droppedItems,
    setDroppedItems,
    rotationAngle,
    radius,
    cx,
    cy,
  });
  
const handleNoteDragStart = (e, itemId) => {
  e.dataTransfer.setData('source', 'dropped');
  e.dataTransfer.setData('itemId', itemId.toString());
};

  const handleNoteUpdate = (id, newContent, newPolar, maybeSize, newPosition) => {
    setDroppedItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item };

        if (typeof newContent === 'string') {
          updated.content = newContent;
        }
        if (maybeSize?.width && maybeSize?.height) {
          updated.width = maybeSize.width;
          updated.height = maybeSize.height;
        }
        if (newPolar) {
          updated.angle = newPolar.angle ?? item.angle;
          updated.distance = newPolar.distance ?? item.distance;
        }
        if (newPosition) {
          const dx = newPosition.x - cx;
          const dy = newPosition.y - cy;
          
          const radians = (-rotationAngle * Math.PI) / 180;
          const rotatedX = dx * Math.cos(radians) - dy * Math.sin(radians);
          const rotatedY = dx * Math.sin(radians) + dy * Math.cos(radians);
          const angle = (Math.atan2(rotatedY, rotatedX) * 180) / Math.PI;
          
          updated.angle = (angle + rotationAngle + 360) % 360;

          updated.distance = Math.sqrt(rotatedX ** 2 + rotatedY ** 2);
        }
        return updated;
      })
    );
  };

  return (
    <div className="relative select-none uppercase" style={{ width: '100%', height: circleSize, maxWidth: 680, margin: '0 auto' }}>
      
      {/* CircleSmall (arriba de todo) */}
      {!isSmallScreen && showSmall && (
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2"
          style={{ zIndex: 9999, position: 'absolute' }}
        >
          <CircleSmall onDayClick={setSelectedDay} isSmallScreen={false} />
        </div>
      )}

      {/* Texto SVG (displayText) con z-index medio */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: circleSize,
          height: circleSize,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <svg
          viewBox={`0 0 ${circleSize} ${circleSize}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ transform: `rotate(0deg)` }}
        >
          <defs>
            <path
              id="dayPath"
              d={`M ${arcStartX},${cy} A ${radius},${radius} 0 0,1 ${arcEndX},${cy}`}
              fill="none"
            />
          </defs>
          <text
            fill="#1f2937"
            fontFamily="IBM Plex Mono, monospace"
            fontSize={circleSize * 0.03}
            letterSpacing="2"
            fontWeight="600"
          >
            <textPath href="#dayPath" startOffset="50%" textAnchor="middle">
              {displayText.toUpperCase()}
            </textPath>
          </text>
        </svg>
      </div>

      {/* Círculo rotante + NoteItem (debajo de todo) */}
      <div
        ref={containerRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className="rounded-full border border-gray-700 shadow-md flex items-center justify-center overflow-hidden"
        style={{
          width: circleSize,
          height: circleSize,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          transform: `rotate(${rotationAngle}deg)`,
        }}
      >
        {selectedDay && (
          <div style={{ transform: `rotate(${-rotationAngle}deg)` }}>
            <NotesArea dayInfo={selectedDay} />
          </div>
        )}

        {droppedItems.map((item) => {
        const angleInRadians = (item.angle * Math.PI) / 180;
const x = cx + item.distance * Math.cos(angleInRadians);
const y = cy + item.distance * Math.sin(angleInRadians);

        if (item.label === 'Tarea') {
          return (
            <TaskItem
              key={item.id}
              id={item.id}
              x={x}
              y={y}
              rotation={-rotationAngle}
              item={item}
              onDragStart={handleNoteDragStart}
              onUpdate={handleNoteUpdate}
              onDelete={() => handleDeleteItem(item.id)}
              circleSize={circleSize}
              cx={cx}
              cy={cy}
            />
          );
        }

        if (item.label.toLowerCase().includes('nota')) {
          return (
            <NoteItem
              key={item.id}
              id={item.id}
              x={x}
              y={y}
              rotation={-rotationAngle}
              item={item}
              onDragStart={handleNoteDragStart}
              onUpdate={handleNoteUpdate}
              circleSize={circleSize}
              cx={cx}
              cy={cy}
              onDelete={() => handleDeleteItem(item.id)}
            />
          );
        }

        return (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('source', 'dropped');
              e.dataTransfer.setData('itemId', item.id.toString());
            }}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              cursor: 'grab',
              transform: `rotate(${-rotationAngle}deg)`,
              transformOrigin: 'center',
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold border bg-white/80 backdrop-blur ${getItemStyle(item.label)}`}
            title={item.label}
          >
            {item.label}
          </div>
        );
      })}
      </div>
    </div>
  );
}
