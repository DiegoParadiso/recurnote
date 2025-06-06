import { useState, useRef, useEffect } from 'react';
import { DateTime } from 'luxon';
import DayButton from './DayButton';

export default function CircleSmall({ onDayClick, isSmallScreen }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentDate, setCurrentDate] = useState(DateTime.local());
  const startY = useRef(null);

  // Ajustar selectedDate cuando cambia currentDate (mes o año)
  useEffect(() => {
    if (!selectedDate) return;

    const daysInMonth = currentDate.daysInMonth;
    let day = selectedDate.day;

    if (day > daysInMonth) {
      day = daysInMonth;
    }

    const newSelected = currentDate.set({ day });
    setSelectedDate(newSelected);
    onDayClick(newSelected.toObject());
  }, [currentDate]);

  const handleScroll = (e) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? 1 : -1;
    setCurrentDate((prev) => prev.plus({ months: direction }));
  };

  const handleStart = (y) => {
    startY.current = y;
  };

  const handleEnd = (y) => {
    if (startY.current === null) return;
    const deltaY = y - startY.current;

    if (Math.abs(deltaY) > 30) {
      const direction = deltaY > 0 ? 1 : -1;
      setCurrentDate((prev) => prev.plus({ months: direction }));
    }
    startY.current = null;
  };

  const handleMouseDown = (e) => handleStart(e.clientY);
  const handleMouseUp = (e) => handleEnd(e.clientY);
  const handleTouchStart = (e) => handleStart(e.touches[0].clientY);
  const handleTouchEnd = (e) => handleEnd(e.changedTouches[0].clientY);

  const daysInMonth = currentDate.daysInMonth;

  // Configuración dinámica según tamaño de pantalla
  const radius = isSmallScreen ? 150 : 170;
  const center = isSmallScreen ? 175 : 200;
  const buttonSize = isSmallScreen ? 27 : 32;
  const labelDistanceFromCenter = isSmallScreen ? -22 : -35;

  const buttons = Array.from({ length: daysInMonth }, (_, i) => {
    const angle = (2 * Math.PI * i) / daysInMonth;
    const x = center + radius * Math.cos(angle) - buttonSize / 2;
    const y = center + radius * Math.sin(angle) - buttonSize / 2;

    const dayNumber = i + 1;
    const isSelected =
      selectedDate?.day === dayNumber &&
      selectedDate?.month === currentDate.month &&
      selectedDate?.year === currentDate.year;

    return (
      <DayButton
        key={i}
        day={dayNumber}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          transition: 'all 0.5s ease',
        }}
        angle={angle}
        isSelected={isSelected}
        onClick={() => {
          const newSelected = currentDate.set({ day: dayNumber });
          setSelectedDate(newSelected);
          onDayClick(newSelected.toObject());
        }}
        buttonSize={buttonSize}
        labelDistanceFromCenter={labelDistanceFromCenter}
      />
    );
  });

  const prevDate = currentDate.minus({ months: 1 });
  const nextDate = currentDate.plus({ months: 1 });

  const renderMonthText = (date, position, onClick) => {
    const mesNombre = date.setLocale('es').toFormat('LLLL yyyy');
    let style = {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      textAlign: 'center',
      userSelect: 'none',
      fontWeight: 600,
      textTransform: 'uppercase',
      color: '#374151',
      fontSize: '0.85rem',
      transition: 'all 0.3s ease',
      cursor: onClick ? 'pointer' : 'default',
      pointerEvents: onClick ? 'auto' : 'none',
    };
    if (position === 'previous') {
      style = {
        ...style,
        top: '40%',
        opacity: 0.35,
        fontSize: '0.8rem',
        filter: 'grayscale(80%)',
      };
    } else if (position === 'next') {
      style = {
        ...style,
        top: '55%',
        opacity: 0.35,
        fontSize: '0.8rem',
        filter: 'grayscale(80%)',
      };
    } else if (position === 'current') {
      style = {
        ...style,
        top: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 1,
        fontSize: '1.4rem',
        color: '#111827',
        pointerEvents: 'none',
        cursor: 'default',
      };
    }

    return (
      <h2 style={style} onClick={onClick}>
        {mesNombre}
      </h2>
    );
  };

  const containerStyle = isSmallScreen
    ? {
        position: 'relative',
        width: '350px',
        height: '350px',
        margin: '0 auto',
                zIndex: 9999,
      }
    : {
        position: 'relative',
        width: '400px',
        height: '400px',
        marginLeft: 'auto',
        marginRight: 0,
                zIndex: 9999,

      };

  return (
    <div
      className="uppercase font-ibm rounded-full border border-gray-700 shadow-md overflow-hidden bg-neutral-100"
      onWheel={handleScroll}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={containerStyle}
    >
      {renderMonthText(prevDate, 'previous', () => setCurrentDate(prevDate))}
      {renderMonthText(currentDate, 'current', null)}
      {renderMonthText(nextDate, 'next', () => setCurrentDate(nextDate))}

      {buttons}
    </div>
  );
}
