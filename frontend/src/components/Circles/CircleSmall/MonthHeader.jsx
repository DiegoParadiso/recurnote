import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DateTime } from 'luxon';
import '../../../styles/components/circles/MonthHeader.css';

export default function MonthHeader({ date, position, onClick, isDragging = false }) {
  const mesNombre = date.setLocale('es').toFormat('LLLL yyyy');

  const baseStyle = {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    textAlign: 'center',
    userSelect: 'none',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: 'var(--color-text-primary)',
    transition: 'all 0.3s ease',
    cursor: isDragging ? 'grab' : (onClick ? 'pointer' : 'default'),
    pointerEvents: isDragging ? 'none' : (onClick ? 'auto' : 'none'),
  };

  const positionsStyles = {
    previous: {
      top: '40%',
      opacity: isDragging ? 0.2 : 0.35,
      fontSize: '0.8rem',
      filter: 'grayscale(80%)',
      transform: 'translateX(-50%)',
    },
    next: {
      top: '55%',
      opacity: isDragging ? 0.2 : 0.35,
      fontSize: '0.8rem',
      filter: 'grayscale(80%)',
      transform: 'translateX(-50%)',
    },
    current: {
      top: '50%',
      opacity: isDragging ? 0.7 : 1,
      fontSize: '1.4rem',
      color: 'var(--color-text-primary)',
      pointerEvents: 'none',
      cursor: 'default',
      transform: 'translate(-50%, -50%)',
    },
  };

  const style = {
    ...baseStyle,
    ...(positionsStyles[position] || {}),
  };

  return (
    <h2 
      className={`month-header ${position}`}
      style={style} 
      onClick={(e) => {
        if (!isDragging && onClick) {
          onClick();
        }
      }}
      aria-live={position === 'current' ? 'polite' : undefined}
    >
      {mesNombre}
    </h2>
  );
}
