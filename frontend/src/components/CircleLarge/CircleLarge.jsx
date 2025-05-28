// src/components/CircleLarge/CircleLarge.jsx
import { useState, useEffect, useRef } from 'react';
import CircleSmall from '../CircleSmall/CircleSmall';
import NotesArea from './NotesArea';
import { DateTime } from 'luxon';
import useWindowDimensions from '../../hooks/useWindowDimensions';

export default function CircleLarge({ showSmall }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const { width } = useWindowDimensions();
  const containerRef = useRef(null);
  const [circleSize, setCircleSize] = useState(680);
  const [droppedItems, setDroppedItems] = useState([]);

  useEffect(() => {
    if (containerRef.current) {
      const size = containerRef.current.offsetWidth;
      setCircleSize(size);
    }
  }, [width]);

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

  const handleDrop = (e) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const clampedX = Math.max(0, Math.min(offsetX, rect.width - 50));
    const clampedY = Math.max(0, Math.min(offsetY, rect.height - 50));
    const source = e.dataTransfer.getData('source');

    if (source === 'sidebar') {
      const label = e.dataTransfer.getData('text/plain');
      const newItem = { id: Date.now(), label, x: clampedX, y: clampedY };
      setDroppedItems((prev) => [...prev, newItem]);
    } else if (source === 'dropped') {
      const itemId = e.dataTransfer.getData('itemId');
      setDroppedItems((prev) =>
        prev.map((item) =>
          item.id.toString() === itemId ? { ...item, x: clampedX, y: clampedY } : item
        )
      );
    }
  };

  const getItemStyle = (label) => {
    if (label.includes('Nota')) return 'border-blue-400 text-blue-600';
    if (label.includes('Evento')) return 'border-pink-400 text-pink-600';
    if (label.includes('Tarea')) return 'border-green-400 text-green-600';
    if (label.includes('Idea')) return 'border-yellow-400 text-yellow-600';
    if (label.includes('Archivo')) return 'border-purple-400 text-purple-600';
    if (label.includes('Recordatorio')) return 'border-red-400 text-red-600';
    return 'border-gray-400 text-gray-600';
  };

  return (
    <div className="uppercase relative flex flex-col items-center justify-center">
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${circleSize} ${circleSize}`}
        preserveAspectRatio="xMidYMid meet"
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

      <div
        ref={containerRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="rounded-full border border-gray-700 shadow-md w-[90vw] max-w-[680px] h-[90vw] max-h-[680px] flex items-center justify-center relative overflow-hidden"
      >
        {selectedDay && <NotesArea dayInfo={selectedDay} />}
        {!isSmallScreen && showSmall && (
          <CircleSmall onDayClick={setSelectedDay} isSmallScreen={false} />
        )}

        {/* Objetos soltados con estilo minimalista */}
        {droppedItems.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('source', 'dropped');
              e.dataTransfer.setData('itemId', item.id.toString());
            }}
            style={{
              position: 'absolute',
              left: item.x,
              top: item.y,
            }}
            className={`w-[48px] h-[48px] rounded-full bg-white/70 backdrop-blur-sm 
              flex items-center justify-center shadow-sm hover:scale-105 transition-transform 
              cursor-grab active:cursor-grabbing ${getItemStyle(item.label)}`}
            title={item.label}
          >
            {item.label.split(' ')[0]}
          </div>
        ))}
      </div>

      {isSmallScreen && showSmall && (
        <div className="mt-6">
          <CircleSmall onDayClick={setSelectedDay} isSmallScreen={true} />
        </div>
      )}
    </div>
  );
}
