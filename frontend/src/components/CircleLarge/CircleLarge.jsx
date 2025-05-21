import { useState, useEffect, useRef } from 'react';
import CircleSmall from '../CircleSmall/CircleSmall';
import NotesArea from './NotesArea';
import { DateTime } from 'luxon';
import useWindowDimensions from '../../hooks/useWindowDimensions';

export default function CircleLarge() {
  const [selectedDay, setSelectedDay] = useState(null);
  const { width } = useWindowDimensions();
  const containerRef = useRef(null);
  const [circleSize, setCircleSize] = useState(680);

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

  // Parámetros para el arco responsivo
  const radius = circleSize / 2 - 40;
  const cx = circleSize / 2;
  const cy = circleSize / 2;
  const arcStartX = cx - radius;
  const arcEndX = cx + radius;

  return (
    <div className="uppercase relative flex flex-col items-center justify-center">
      {/* Texto curvo arriba */}
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
        className="rounded-full border border-gray-700 shadow-md w-[90vw] max-w-[680px] h-[90vw] max-h-[680px] flex items-center justify-center relative"
      >
        {selectedDay && <NotesArea dayInfo={selectedDay} />}
        {!isSmallScreen && (
          <CircleSmall onDayClick={setSelectedDay} isSmallScreen={false} />
        )}
      </div>

      {isSmallScreen && (
        <div className="mt-6">
          <CircleSmall onDayClick={setSelectedDay} isSmallScreen={true} />
        </div>
      )}
    </div>
  );
}
