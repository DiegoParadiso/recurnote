import React, { useState, useRef, useEffect } from 'react';
import { DateTime } from 'luxon';
import MonthHeader from '@components/Circles/CircleSmall/MonthHeader';
import DaysButtons from '@components/Circles/CircleSmall/DaysButtons';
import { useSwipeMonthNavigation } from '@hooks/useSwipeMonthNavigation';

export default function CircleSmall({
  onDayClick,
  selectedDay,
  setSelectedDay,
  size,
}) {
  const circleSize = size ?? 350;
  const dragStartRef = useRef(null);
  const timeoutRef = useRef(null);
  const maxDragDistanceRef = useRef(0);
  const containerRef = useRef(null);

  const [currentDate, setCurrentDate] = useState(DateTime.now());
  const [isDragging, setIsDragging] = useState(false);
  const { handleMouseDown, handleMouseUp, handleTouchStart, handleTouchEnd } =
    useSwipeMonthNavigation(setCurrentDate);

  const radius = circleSize / 2 - 25;
  const center = circleSize / 2;

  // buttonSize responsivo 
  // En desktop: botones un poco más grandes
  const isDesktop = window.innerWidth > 768;
  const buttonSize = isDesktop
    ? Math.max(28, Math.min(circleSize * 0.077, 36))
    : Math.max(24, Math.min(circleSize * 0.075, 32));

  const labelDistanceFromCenter = -22;

  const prevDate = currentDate.minus({ months: 1 });
  const nextDate = currentDate.plus({ months: 1 });

  const handleContainerMouseDown = (e) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    maxDragDistanceRef.current = 0;
    setIsDragging(false);

    // Timeout más corto para detectar drag más rápido
    timeoutRef.current = setTimeout(() => {
      setIsDragging(true);
    }, 50);

    handleMouseDown(e);
  };

  const handleContainerTouchStart = (e) => {
    const touch = e.touches[0];
    dragStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    maxDragDistanceRef.current = 0;
    setIsDragging(false);

    // Timeout más corto para detectar drag más rápido
    timeoutRef.current = setTimeout(() => {
      setIsDragging(true);
    }, 50);

    handleTouchStart(e);
  };

  const handleContainerMouseMove = (e) => {
    if (dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > maxDragDistanceRef.current) {
        maxDragDistanceRef.current = distance;
      }

      // Si se movió más de 2px, es un drag
      if (distance > 2) {
        setIsDragging(true);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    }
  };

  const handleContainerTouchMove = (e) => {
    if (dragStartRef.current) {
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.x;
      const dy = touch.clientY - dragStartRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > maxDragDistanceRef.current) {
        maxDragDistanceRef.current = distance;
      }

      // Si se movió más de 2px, es un drag
      if (distance > 2) {
        setIsDragging(true);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    }
  };

  const handleContainerMouseUp = (e) => {
    const wasDragging = isDragging;

    dragStartRef.current = null;

    setIsDragging(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    handleMouseUp(e);
    return wasDragging;
  };



  const handleMonthChange = (newDate) => {
    // Solo cambiar mes si no se está arrastrando
    if (!isDragging) {
      setCurrentDate(newDate);
    }
  };

  const handleDayClick = (day) => {
    // Solo cambiar día si no se está arrastrando
    if (!isDragging) {
      const newSelected = currentDate.set({ day });
      setSelectedDay(newSelected.toObject());
      onDayClick?.(newSelected.toObject());
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClickCapture = (e) => {
      if (maxDragDistanceRef.current > 5) {
        e.stopPropagation();
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };

    container.addEventListener('click', handleClickCapture, { capture: true });

    return () => {
      container.removeEventListener('click', handleClickCapture, { capture: true });
    };
  }, []);

  const containerStyle = {
    position: 'relative',
    width: `${circleSize}px`,
    height: `${circleSize}px`,
    margin: '0 auto',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--circle-border-light)',
    borderRadius: '9999px', // círculo perfecto
    transition: 'none', // Sin transición para cambios de tema
    userSelect: isDragging ? 'none' : 'auto',
    WebkitUserSelect: isDragging ? 'none' : 'auto',
    MozUserSelect: isDragging ? 'none' : 'auto',
    msUserSelect: isDragging ? 'none' : 'auto',
  };

  return (
    <div
      className="uppercase font-ibm rounded-full overflow-hidden z-high"
      onWheel={(e) => {
        e.preventDefault();
        const direction = e.deltaY > 0 ? 1 : -1;
        setCurrentDate((prev) => prev.plus({ months: direction }));
      }}
      onMouseDown={handleContainerMouseDown}
      onMouseMove={handleContainerMouseMove}
      onMouseUp={handleContainerMouseUp}
      onMouseLeave={handleContainerMouseUp}
      onTouchStart={handleContainerTouchStart}
      onTouchMove={handleContainerTouchMove}
      onTouchEnd={handleTouchEnd}
      style={containerStyle}
      ref={containerRef}
    >
      <MonthHeader
        date={prevDate}
        position="previous"
        onClick={() => {
          handleMonthChange(prevDate);
        }}
        isDragging={isDragging}
      />
      <MonthHeader
        date={currentDate}
        position="current"
        isDragging={isDragging}
      />
      <MonthHeader
        date={nextDate}
        position="next"
        onClick={() => {
          handleMonthChange(nextDate);
        }}
        isDragging={isDragging}
      />

      <DaysButtons
        currentDate={currentDate}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        onDayClick={handleDayClick}
        radius={radius}
        center={center}
        buttonSize={buttonSize}
        labelDistanceFromCenter={labelDistanceFromCenter}
        isDragging={isDragging}
      />
    </div>
  );
}
