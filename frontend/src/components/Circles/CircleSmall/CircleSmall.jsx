import { useState, useRef, useEffect } from 'react';
import { DateTime } from 'luxon';
import DayButton from './DayButton';
import MonthHeader from './MonthHeader';

export default function CircleSmall({ onDayClick, isSmallScreen, selectedDay, size }) {
  // Tamaño del círculo (fijo o según prop)
  const circleSize = size ?? (isSmallScreen ? 350 : 400);

  const [selectedDate, setSelectedDate] = useState(null);
  const [currentDate, setCurrentDate] = useState(DateTime.local());
  const startY = useRef(null);

  useEffect(() => {
    if (selectedDay) {
      const newSelected = DateTime.fromObject(selectedDay);
      if (
        !selectedDate ||
        selectedDate.day !== newSelected.day ||
        selectedDate.month !== newSelected.month ||
        selectedDate.year !== newSelected.year
      ) {
        setSelectedDate(newSelected);
        setCurrentDate(newSelected.startOf('month'));
      }
    }
  }, [selectedDay]);

  useEffect(() => {
    if (
      selectedDate &&
      (selectedDate.month !== currentDate.month || selectedDate.year !== currentDate.year)
    ) {
      setSelectedDate(null);
      onDayClick(null); // actualiza estado global en Home y CircleLarge
    }
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

  // Cálculos dinámicos conservando proporciones originales
  const radius = circleSize / 2 - (isSmallScreen ? 25 : 30); // margen para que quepa el botón
  const center = circleSize / 2;
  const buttonSize = isSmallScreen ? 27 : 32; // tamaños fijos igual que en el primer código
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

  const containerStyle = {
    position: 'relative',
    width: `${circleSize}px`,
    height: `${circleSize}px`,
    margin: isSmallScreen ? '0 auto' : '0 0 0 auto',
    zIndex: 20,
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-text-primary)',
    borderRadius: '9999px',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  };

  return (
    <div
      className="uppercase font-ibm rounded-full overflow-hidden"
      onWheel={handleScroll}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={containerStyle}
    >
      <MonthHeader date={prevDate} position="previous" onClick={() => setCurrentDate(prevDate)} />
      <MonthHeader date={currentDate} position="current" />
      <MonthHeader date={nextDate} position="next" onClick={() => setCurrentDate(nextDate)} />

      {buttons}
    </div>
  );
}
