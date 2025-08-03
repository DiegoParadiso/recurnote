import { DateTime } from 'luxon';
import MonthHeader from './MonthHeader';
import DaysButtons from './DaysButtons';
import { useCircleSmallDates } from '../../../hooks/useCircleSmallDates';
import { useSwipeMonthNavigation } from '../../../hooks/useSwipeMonthNavigation';

export default function CircleSmall({ onDayClick, isSmallScreen, selectedDay, size }) {
  const circleSize = size ?? (isSmallScreen ? 350 : 400);

  const { selectedDate, setSelectedDate, currentDate, setCurrentDate } = useCircleSmallDates(selectedDay, onDayClick);
  const { handleMouseDown, handleMouseUp, handleTouchStart, handleTouchEnd } = useSwipeMonthNavigation(setCurrentDate);

  const radius = circleSize / 2 - (isSmallScreen ? 25 : 30);
  const center = circleSize / 2;
  const buttonSize = isSmallScreen ? 27 : 32;
  const labelDistanceFromCenter = isSmallScreen ? -22 : -35;

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
      <MonthHeader date={prevDate} position="previous" onClick={() => setCurrentDate(prevDate)} />
      <MonthHeader date={currentDate} position="current" />
      <MonthHeader date={nextDate} position="next" onClick={() => setCurrentDate(nextDate)} />

      <DaysButtons
        currentDate={currentDate}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onDayClick={onDayClick}
        radius={radius}
        center={center}
        buttonSize={buttonSize}
        labelDistanceFromCenter={labelDistanceFromCenter}
      />
    </div>
  );
}
