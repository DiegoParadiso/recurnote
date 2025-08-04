import React, { useState } from 'react';
import { DateTime } from 'luxon';
import MonthHeader from './MonthHeader';
import DaysButtons from './DaysButtons';
import { useSwipeMonthNavigation } from '../../../hooks/useSwipeMonthNavigation';

export default function CircleSmall({
  onDayClick,
  selectedDay,
  setSelectedDay,
  size,
}) {
  // Forzamos tamaño fijo para móviles (ej: 350)
  const circleSize = size ?? 350;

  const [currentDate, setCurrentDate] = useState(DateTime.now());
  const { handleMouseDown, handleMouseUp, handleTouchStart, handleTouchEnd } =
    useSwipeMonthNavigation(setCurrentDate);

  // Variables fijas para mantener diseño antiguo y proporciones perfectas
  const radius = circleSize / 2 - 25;
  const center = circleSize / 2;
  const buttonSize = 27;
  const labelDistanceFromCenter = -22;

  const prevDate = currentDate.minus({ months: 1 });
  const nextDate = currentDate.plus({ months: 1 });

  const containerStyle = {
    position: 'relative',
    width: `${circleSize}px`,
    height: `${circleSize}px`,
    margin: '0 auto',
    zIndex: 20,
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-text-primary)',
    borderRadius: '9999px', // círculo perfecto
    transition: 'background-color 0.3s ease, color 0.3s ease',
  };

  return (
    <div
      className="uppercase font-ibm rounded-full overflow-hidden"
      onWheel={(e) => {
        e.preventDefault();
        const direction = e.deltaY > 0 ? 1 : -1;
        setCurrentDate((prev) => prev.plus({ months: direction }));
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={containerStyle}
    >
      <MonthHeader date={prevDate} position="previous" onClick={() => {
        setCurrentDate(prevDate);
      }} />
      <MonthHeader date={currentDate} position="current" />
      <MonthHeader date={nextDate} position="next" onClick={() => {
        setCurrentDate(nextDate);
      }} />

      <DaysButtons
        currentDate={currentDate}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        onDayClick={onDayClick}
        radius={radius}
        center={center}
        buttonSize={buttonSize}
        labelDistanceFromCenter={labelDistanceFromCenter}
      />
    </div>
  );
}
