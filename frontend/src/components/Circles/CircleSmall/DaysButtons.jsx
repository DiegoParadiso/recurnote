import React from 'react';
import DayButton from '@components/Circles/CircleSmall/DayButton';

export default function DaysButtons({
  currentDate,
  selectedDay,
  setSelectedDay,
  onDayClick,
  radius,
  center,
  buttonSize,
  labelDistanceFromCenter,
  isDragging = false,
}) {
  const daysInMonth = currentDate.daysInMonth;

  return (
    <>
      {Array.from({ length: daysInMonth }).map((_, i) => {
        const angle = (2 * Math.PI * i) / daysInMonth;
        const x = center + radius * Math.cos(angle) - buttonSize / 2;
        const y = center + radius * Math.sin(angle) - buttonSize / 2;
        const dayNumber = i + 1;

        const isSelected =
          selectedDay?.day === dayNumber &&
          selectedDay?.month === currentDate.month &&
          selectedDay?.year === currentDate.year;

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
              // Solo activar si no se está arrastrando
              if (!isDragging) {
                onDayClick?.(dayNumber);
              }
            }}
            buttonSize={buttonSize}
            labelDistanceFromCenter={labelDistanceFromCenter}
            isDragging={isDragging}
          />
        );
      })}
    </>
  );
}
