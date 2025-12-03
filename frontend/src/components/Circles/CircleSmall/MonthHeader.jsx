import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DateTime } from 'luxon';
import i18n from '../../../i18n/index.js';
import '@styles/components/circles/MonthHeader.css';
import { PRIMARY_FONT } from '../../../config/fonts';

export default function MonthHeader({ date, position, onClick, isDragging = false }) {
  const activeLang = i18n.language || 'en';
  const mesNombre = date.setLocale(activeLang).toFormat('LLLL yyyy');

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
    fontFamily: 'Roboto Slab, serif',
    transition: 'opacity 0.3s ease, transform 0.3s ease', // Sin transición para color
    cursor: isDragging ? 'grab' : (onClick ? 'pointer' : 'default'),
    pointerEvents: isDragging ? 'none' : (onClick ? 'auto' : 'none'),
  };

  const positionsStyles = {
    previous: {
      top: '40%',
      opacity: isDragging ? 0.2 : 0.6,
      fontSize: '0.8rem',
      filter: 'grayscale(80%)',
      transform: 'translateX(-50%)',
    },
    next: {
      top: '55%',
      opacity: isDragging ? 0.2 : 0.6,
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
