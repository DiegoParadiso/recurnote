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

export default function CircleLarge({ showSmall, selectedDay, setSelectedDay, onItemDrag, onItemDrop }) {
  // Contexto global con items organizados por fecha
  const { itemsByDate, setItemsByDate } = useItems();

  const { width } = useWindowDimensions();
  const containerRef = useRef(null);
  const [circleSize, setCircleSize] = useState(680);
  const [rotationAngle, setRotationAngle] = useState(0);
  const rotationSpeed = 2;
  const [toastMessage, setToastMessage] = useState('');

  // Control de rotación con mouse
  const { onMouseDown, onMouseMove, onMouseUp, prevRotationRef } = useRotationControls({
    containerRef,
    rotationAngle,
    setRotationAngle,
    rotationSpeed,
  });

  // Ajustar tamaño según ancho de ventana (responsive)
  useEffect(() => {
    if (width <= 640) {
      setCircleSize(Math.min(width - 40, 360));
    } else {
      setCircleSize(680);
    }
  }, [width]);

  // Cuando rota el círculo, actualizo el ángulo de los items del día seleccionado en contexto
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
  }, [rotationAngle, selectedDay, setItemsByDate, prevRotationRef]);

  // Fecha seleccionada como objeto DateTime para mostrar texto legible
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

  // Hook para manejar drag & drop sobre el círculo
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

  // Eventos drag para los items
  const handleNoteDragStart = (e, itemId) => {
    e.dataTransfer.setData('source', 'dropped');
    e.dataTransfer.setData('itemId', itemId.toString());
  };

  // Actualizar item (contenido, posición polar, tamaño, etc)
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

  // Borrar item por id
  const handleDeleteItem = (id) => {
    const dateKey = selectedDay ? formatDateKey(selectedDay) : null;
    if (!dateKey) return;

    setItemsByDate((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].filter((item) => item.id !== id),
    }));
  };

  // Items para el día seleccionado (pueden ser [] si no hay)
  const itemsForSelectedDay = selectedDay ? itemsByDate[formatDateKey(selectedDay)] || [] : [];

  return (
    <div
      className="relative select-none uppercase"
      style={{
        width: '100%',
        height: isSmallScreen ? '100dvh' : circleSize,
        margin: '0 auto',
      }}
    >
      {/* CircleSmall solo en desktop cuando showSmall */}
      {!isSmallScreen && showSmall && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2" style={{ zIndex: 10 }}>
          <CircleSmall
            onDayClick={setSelectedDay}
            isSmallScreen={false}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
          />
        </div>
      )}

      {/* CircleSmall móvil */}
      {isSmallScreen && showSmall && (
        <div
          className="fixed z-[10] flex items-center justify-center"
          style={{
            backgroundColor: 'var(--color-bg)',
            borderRadius: '50%',
            width: circleSize,
            height: circleSize,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <CircleSmall
            onDayClick={setSelectedDay}
            isSmallScreen={true}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            size={circleSize}
          />
        </div>
      )}

      <CircleBackgroundText
        circleSize={circleSize}
        radius={radius}
        displayText={displayText}
        isSmallScreen={isSmallScreen}
      />

      <div
        ref={containerRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className={
          isSmallScreen
            ? 'absolute inset-0 flex items-center justify-center z-[1]'
            : 'rounded-full border flex items-center justify-center overflow-hidden'
        }
        style={{
          width: isSmallScreen ? '100%' : circleSize,
          height: isSmallScreen ? '100dvh' : circleSize,
          margin: isSmallScreen ? undefined : '0 auto',
          transform: isSmallScreen ? 'none' : `rotate(${rotationAngle}deg)`,
          borderColor: isSmallScreen ? 'transparent' : 'var(--color-border)',
          borderStyle: isSmallScreen ? 'none' : 'solid',
        }}
      >
        {!selectedDay && !isSmallScreen && <EmptyLogo circleSize={circleSize} />}

        {selectedDay && (
          <div style={{ transform: isSmallScreen ? 'none' : `rotate(${-rotationAngle}deg)` }}>
            <NotesArea dayInfo={selectedDay} />
          </div>
        )}

        <ItemsOnCircle
          items={itemsForSelectedDay}
          cx={cx}
          cy={cy}
          rotationAngle={rotationAngle}
          onItemDrag={onItemDrag}
          onItemDrop={onItemDrop}
          onNoteDragStart={handleNoteDragStart}
          onNoteUpdate={handleNoteUpdate}
          onDeleteItem={handleDeleteItem}
          circleSize={circleSize}
          isSmallScreen={isSmallScreen}
        />
      </div>

      <BottomToast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
}
