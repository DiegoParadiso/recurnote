// components/Circles/CircleLarge/CircleLarge.jsx
import { useState, useEffect, useRef } from 'react';
import CircleSmall from '../CircleSmall/CircleSmall';
import NotesArea from './NotesArea';
import ItemsOnCircle from '../Items/ItemsOnCircle';
import CircleBackgroundText from './CircleBackgroundText';
import EmptyLogo from './EmptyLogo';
import { DateTime } from 'luxon';
import useHandleDrop from '../../../hooks/useDropHandler';
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import useRotationControls from '../../../hooks/useRotationControls';
import formatDateKey from '../../../utils/formatDateKey';
import { useItems } from '../../../context/ItemsContext';
import BottomToast from '../../common/BottomToast';

export default function CircleLarge({ showSmall, selectedDay, setSelectedDay }) {
  const { itemsByDate, setItemsByDate } = useItems();
  const { width } = useWindowDimensions();
  const containerRef = useRef(null);
  const [circleSize, setCircleSize] = useState(680);
  const [rotationAngle, setRotationAngle] = useState(0);
  const rotationSpeed = 2;
  const [toastMessage, setToastMessage] = useState('');

  const {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    prevRotationRef,
  } = useRotationControls({ containerRef, rotationAngle, setRotationAngle, rotationSpeed });

  useEffect(() => {
    if (containerRef.current) {
      setCircleSize(containerRef.current.offsetWidth);
    }
  }, [width]);

  useEffect(() => {
    const delta = (rotationAngle - prevRotationRef.current + 360) % 360;
    if (delta !== 0 && selectedDay) {
      const dateKey = formatDateKey(selectedDay);
      setItemsByDate((prev) => ({
        ...prev,
        [dateKey]: (prev[dateKey] || []).map((item) => ({
          ...item,
          angle: (item.angle + delta) % 360,
        })),
      }));
    }
    prevRotationRef.current = rotationAngle;
  }, [rotationAngle]);

  const selectedDate = selectedDay
    ? DateTime.fromObject({
        day: selectedDay.day,
        month: selectedDay.month,
        year: selectedDay.year,
      })
    : null;

  const displayText = selectedDate
    ? selectedDate.setLocale('es').toFormat('cccc d, yyyy')
    : 'Bienvenido';

  const isSmallScreen = width <= 640;
  const radius = circleSize / 2 - 40;
  const cx = circleSize / 2;
  const cy = circleSize / 2;

  const handleDrop = useHandleDrop({
    containerRef,
    itemsByDate,
    setItemsByDate,
    selectedDay,
    rotationAngle,
    radius,
    cx,
    cy,
    onInvalidDrop: () => setToastMessage('Para agregar un ítem, primero selecciona un día en el calendario'),
  });

  const handleNoteDragStart = (e, itemId) => {
    e.dataTransfer.setData('source', 'dropped');
    e.dataTransfer.setData('itemId', itemId.toString());
  };

  const handleNoteUpdate = (id, newContent, newPolar, maybeSize, newPosition) => {
    const dateKey = selectedDay ? formatDateKey(selectedDay) : null;
    if (!dateKey) return;

    setItemsByDate((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item };

        if (Array.isArray(newContent)) updated.checked = newPolar;
        if (newContent !== undefined) updated.content = newContent;
        if (maybeSize?.width && maybeSize?.height) {
          updated.width = maybeSize.width;
          updated.height = maybeSize.height;
        }
        if (newPolar) {
          updated.angle = newPolar.angle ?? item.angle;
          updated.distance = newPolar.distance ?? item.distance;
        }
        if (newPosition) {
          const dx = newPosition.x - cx;
          const dy = newPosition.y - cy;
          const radians = (-rotationAngle * Math.PI) / 180;
          const rotatedX = dx * Math.cos(radians) - dy * Math.sin(radians);
          const rotatedY = dx * Math.sin(radians) + dy * Math.cos(radians);
          const angle = (Math.atan2(rotatedY, rotatedX) * 180) / Math.PI;
          updated.angle = (angle + rotationAngle + 360) % 360;
          updated.distance = Math.sqrt(rotatedX ** 2 + rotatedY ** 2);
        }
        return updated;
      }),
    }));
  };

  const handleDeleteItem = (id) => {
    const dateKey = selectedDay ? formatDateKey(selectedDay) : null;
    if (!dateKey) return;

    setItemsByDate((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].filter((item) => item.id !== id),
    }));
  };

  const itemsForSelectedDay = selectedDay ? itemsByDate[formatDateKey(selectedDay)] || [] : [];

  return (
    <div
      className="relative select-none uppercase"
      style={{
        width: '100%',
        height: circleSize,
        maxWidth: 680,
        margin: '0 auto',
      }}
    >
      {!isSmallScreen && showSmall && (
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2"
          style={{ zIndex: 9999 }}
        >
          <CircleSmall onDayClick={setSelectedDay} isSmallScreen={false} selectedDay={selectedDay} />
        </div>
      )}

      <CircleBackgroundText
        circleSize={circleSize}
        radius={radius}
        displayText={displayText}
      />

      <div
        ref={containerRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className="rounded-full border border-gray-700 shadow-md flex items-center justify-center overflow-hidden"
        style={{
          width: circleSize,
          height: circleSize,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          transform: `rotate(${rotationAngle}deg)`,
        }}
      >
        {!selectedDay && <EmptyLogo circleSize={circleSize} />}

        {selectedDay && (
          <div style={{ transform: `rotate(${-rotationAngle}deg)` }}>
            <NotesArea dayInfo={selectedDay} />
          </div>
        )}

        <ItemsOnCircle
          items={itemsForSelectedDay}
          cx={cx}
          cy={cy}
          rotationAngle={rotationAngle}
          onNoteDragStart={handleNoteDragStart}
          onNoteUpdate={handleNoteUpdate}
          onDeleteItem={handleDeleteItem}
          circleSize={circleSize}
        />
      </div>

      <BottomToast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
}
