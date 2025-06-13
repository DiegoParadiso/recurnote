import { useState, useEffect, useRef } from 'react';
import CircleSmall from '../CircleSmall/CircleSmall';
import NotesArea from './NotesArea';
import NoteItem from './NoteItem';
import { DateTime } from 'luxon';
import useWindowDimensions from '../../hooks/useWindowDimensions';

export default function CircleLarge({ showSmall }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const { width } = useWindowDimensions();
  const containerRef = useRef(null);
  const [circleSize, setCircleSize] = useState(680);
  const [droppedItems, setDroppedItems] = useState([]);
  const [rotationAngle, setRotationAngle] = useState(0);
  const prevRotationRef = useRef(rotationAngle);
  const rotationSpeed = 2;

  const isDragging = useRef(false);
  const lastMouseAngle = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const size = containerRef.current.offsetWidth;
      setCircleSize(size);
    }
  }, [width]);

  // 🔁 Ajustar ángulos de los ítems en sentido inverso a la rotación
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
  }, [rotationAngle]);

  useEffect(() => {
    let animationFrameId;
    let isRotating = false;
    let currentKey = null;

const handleKeyDown = (e) => {
  if (e.repeat) return;
  if (['ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown'].includes(e.key)) {
    e.preventDefault(); 
    currentKey = e.key;
    if (!isRotating) {
      isRotating = true;
      rotate();
    }
  }
};

    const handleKeyUp = (e) => {
      if (['ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown'].includes(e.key)) {
        isRotating = false;
        currentKey = null;
        cancelAnimationFrame(animationFrameId);
      }
    };

    const rotate = () => {
      setRotationAngle((prev) => {
        let newAngle = prev;
        if (isRotating) {
          if (currentKey === 'ArrowUp' || currentKey === 'ArrowRight') {
            newAngle = (prev + rotationSpeed) % 360;
          } else if (currentKey === 'ArrowDown' || currentKey === 'ArrowLeft') {
            newAngle = (prev - rotationSpeed + 360) % 360;
          }
        }
        return newAngle;
      });

      if (isRotating) {
        animationFrameId = requestAnimationFrame(rotate);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
function isColliding(x1, y1, w1, h1, x2, y2, w2, h2, margin = 8) {
  return !(
    x1 + w1 / 2 + margin < x2 - w2 / 2 ||
    x1 - w1 / 2 - margin > x2 + w2 / 2 ||
    y1 + h1 / 2 + margin < y2 - h2 / 2 ||
    y1 - h1 / 2 - margin > y2 + h2 / 2
  );
}
  const getAngleFromCenter = (x, y) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return angle;
  };

  const onMouseDown = (e) => {
    if (
      e.target.tagName === 'TEXTAREA' ||
      e.target.tagName === 'INPUT' ||
      e.target.isContentEditable ||
      e.target.closest('.draggable-note')
    ) {
      return;
    }

    e.preventDefault();
    isDragging.current = true;
    lastMouseAngle.current = getAngleFromCenter(e.clientX, e.clientY);
  };

  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const currentAngle = getAngleFromCenter(e.clientX, e.clientY);
    if (lastMouseAngle.current !== null) {
      let diff = currentAngle - lastMouseAngle.current;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      setRotationAngle((prev) => (prev + diff + 360) % 360);
    }
    lastMouseAngle.current = currentAngle;
  };

  const onMouseUp = (e) => {
    e.preventDefault();
    isDragging.current = false;
    lastMouseAngle.current = null;
  };

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
  const mouseX = e.clientX;
  const mouseY = e.clientY;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  let dx = mouseX - centerX;
  let dy = mouseY - centerY;

  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  angle = (angle - rotationAngle + 360) % 360;

  let distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > radius - 50) distance = radius - 50;

  const source = e.dataTransfer.getData('source');
  const label = e.dataTransfer.getData('label') || 'Nota';

  // Función interna para chequear si espacio está libre
  const isPositionFree = (angle, distance, idToIgnore = null) => {
    const angleRad = angle * (Math.PI / 180);
    const x = cx + distance * Math.cos(angleRad);
    const y = cy + distance * Math.sin(angleRad);

    const width = 150;
    const height = 80;

    for (const item of droppedItems) {
      if (idToIgnore !== null && item.id === idToIgnore) continue;

      const itemAngleRad = item.angle * (Math.PI / 180);
      const itemX = cx + item.distance * Math.cos(itemAngleRad);
      const itemY = cy + item.distance * Math.sin(itemAngleRad);

      const itemWidth = item.width || 150;
      const itemHeight = item.height || 80;

      if (isColliding(x, y, width, height, itemX, itemY, itemWidth, itemHeight)) {
        return false;
      }
    }
    return true;
  };

  let finalAngle = angle;
  let finalDistance = distance;
  const stepAngle = 5;
  const maxAttempts = 36;

  if (!isPositionFree(finalAngle, finalDistance)) {
    let found = false;
    for (let i = 1; i <= maxAttempts; i++) {
      let testAngle = (finalAngle + i * stepAngle) % 360;
      if (isPositionFree(testAngle, finalDistance)) {
        finalAngle = testAngle;
        found = true;
        break;
      }
      testAngle = (finalAngle - i * stepAngle + 360) % 360;
      if (isPositionFree(testAngle, finalDistance)) {
        finalAngle = testAngle;
        found = true;
        break;
      }
    }
    if (!found) {
      for (let dist = finalDistance - 10; dist > 20; dist -= 10) {
        if (isPositionFree(finalAngle, dist)) {
          finalDistance = dist;
          found = true;
          break;
        }
      }
    }
    if (!found) {
      // No espacio, cancelar drop
      return;
    }
  }

  if (source === 'sidebar') {
    const newItem = {
      id: Date.now(),
      label,
      angle: finalAngle,
      distance: finalDistance,
      content: '',
      width: 150,
      height: 80,
    };
    setDroppedItems((prev) => [...prev, newItem]);
  } else if (source === 'dropped') {
    const itemId = e.dataTransfer.getData('itemId');
    setDroppedItems((prev) =>
      prev.map((item) =>
        item.id.toString() === itemId
          ? { ...item, angle: finalAngle, distance: finalDistance }
          : item
      )
    );
  }
};
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
