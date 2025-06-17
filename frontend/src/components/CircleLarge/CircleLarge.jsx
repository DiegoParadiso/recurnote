import { useState, useEffect, useRef } from 'react'; 
import CircleSmall from '../CircleSmall/CircleSmall';
import NotesArea from './NotesArea';
import NoteItem from './NoteItem';
import { DateTime } from 'luxon';
import useHandleDrop from './useDropHandler';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import useRotationControls from './useRotationControls';

export default function CircleLarge({ showSmall }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const { width } = useWindowDimensions();
  const containerRef = useRef(null);
  const [circleSize, setCircleSize] = useState(680);
  const [droppedItems, setDroppedItems] = useState([]);
  const [rotationAngle, setRotationAngle] = useState(0);
  const rotationSpeed = 2;

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

  // Ajustar ángulos de los ítems inversamente a la rotación
  useEffect(() => {
    const delta = (rotationAngle - prevRotationRef.current + 360) % 360;
    if (delta !== 0) {
      setDroppedItems((prevItems) =>
        prevItems.map((item) => ({
          ...item,
          angle: (item.angle + delta) % 360,
        }))
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

  const handleNoteUpdate = (id, newContent, newPolar) => {
    setDroppedItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        let updated = { ...item, content: newContent };
        if (newPolar) {
          updated.angle = newPolar.angle;
          updated.distance = newPolar.distance;
        }
        return updated;
      })
    );
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none uppercase">
      {/* Texto circular fijo */}
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
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

      {/* Círculo rotante */}
      <div
        ref={containerRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className="rounded-full border border-gray-700 shadow-md w-[90vw] max-w-[680px] h-[90vw] max-h-[680px] flex items-center justify-center relative overflow-hidden"
        style={{ transform: `rotate(${rotationAngle}deg)` }}
      >
        {selectedDay && (
          <div style={{ transform: `rotate(${-rotationAngle}deg)` }}>
            <NotesArea dayInfo={selectedDay} />
          </div>
        )}
        {droppedItems.map((item) => {
          const angleInRadians = item.angle * (Math.PI / 180);
          const x = cx + item.distance * Math.cos(angleInRadians);
          const y = cy + item.distance * Math.sin(angleInRadians);

          const style = {
            position: 'absolute',
            left: x,
            top: y,
            cursor: 'grab',
            transform: `rotate(${-rotationAngle}deg)`,
            transformOrigin: 'center',
          };

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
              style={style}
              className={`px-3 py-1 rounded-full text-xs font-semibold border bg-white/80 backdrop-blur ${getItemStyle(item.label)}`}
              title={item.label}
            >
              {item.label}
            </div>
          );
        })}
      </div>

      {!isSmallScreen && showSmall && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <CircleSmall onDayClick={setSelectedDay} isSmallScreen={false} />
        </div>
      )}
    </div>
  );
}
