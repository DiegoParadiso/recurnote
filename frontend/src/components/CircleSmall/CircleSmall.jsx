
import { useState, useRef } from 'react';
import { DateTime } from 'luxon';
import DayButton from './DayButton';

export default function CircleSmall() {
  const [currentDate, setCurrentDate] = useState(DateTime.local());
  const startY = useRef(null);

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
  const radius = 170;
  const center = 200;

  const buttons = Array.from({ length: daysInMonth }, (_, i) => {
    const angle = (2 * Math.PI * i) / daysInMonth;
    const x = center + radius * Math.cos(angle) - 16;
    const y = center + radius * Math.sin(angle) - 16;

    return (
      <DayButton
        key={i}
        day={i + 1}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          transition: 'all 0.5s ease',
        }}
        angle={angle}
      />
    );
  });

  // Fechas prev, actual y siguiente
  const prevDate = currentDate.minus({ months: 1 });
  const nextDate = currentDate.plus({ months: 1 });

  // Función para renderizar solo el texto mes/año con estilos
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
    color: '#374151', // gris oscuro
    fontSize: '0.85rem', // tamaño base
    transition: 'all 0.3s ease',
    cursor: onClick ? 'pointer' : 'default', // cursor pointer si tiene onClick
    pointerEvents: onClick ? 'auto' : 'none',
  };
if (position === 'previous') {
  style = {
    ...style,
    top: '40%', // más cerca del centro que antes (mejor alineado visualmente)
    opacity: 0.35,
    fontSize: '0.8rem',
    filter: 'grayscale(80%)',
  };
} else if (position === 'next') {
  style = {
    ...style,
    top: '55%', // simétrico con el anterior
    opacity: 0.35,
    fontSize: '0.8rem',
    filter: 'grayscale(80%)',
  };
} else if (position === 'current') {
  style = {
    ...style,
    top: '50%',
    transform: 'translate(-50%, -50%)', // centrado perfecto
    opacity: 1,
    fontSize: '1.4rem', // mejor visibilidad
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

return (
  <div
    className="uppercase font-ibm absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-gray-700 shadow-md overflow-hidden"
    onWheel={handleScroll}
    onMouseDown={handleMouseDown}
    onMouseUp={handleMouseUp}
    onTouchStart={handleTouchStart}
    onTouchEnd={handleTouchEnd}
  >
    {/* Mes anterior clickeable */}
    {renderMonthText(prevDate, 'previous', () => setCurrentDate(prevDate))}
    {/* Mes actual no clickeable */}
    {renderMonthText(currentDate, 'current', null)}
    {/* Mes siguiente clickeable */}
    {renderMonthText(nextDate, 'next', () => setCurrentDate(nextDate))}

    {/* Botones solo del mes actual */}
    {buttons}
  </div>
);
}
