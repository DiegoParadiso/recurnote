import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DateTime } from 'luxon';
import i18n from '../../../i18n/index.js';
import '@styles/components/circles/MonthHeader.css';
import { PRIMARY_FONT } from '../../../config/fonts';

export default function MonthHeader({ date, position, onClick, isDragging = false }) {
  const activeLang = i18n.language || 'en';
  const mesNombre = date.setLocale(activeLang).toFormat('LLLL yyyy');

  let cursorStyle = 'default';
  let pointerEventsStyle = 'none';

  if (isDragging) {
    cursorStyle = 'grab';
    pointerEventsStyle = 'none';
  } else if (onClick) {
    cursorStyle = 'pointer';
    pointerEventsStyle = 'auto';
  }

  const baseStyle = {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    textAlign: 'center',
    userSelect: 'none',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: 'var(--monthheader-color, var(--color-text-primary))',
    fontFamily: 'Roboto Slab, serif',
    transition: 'opacity 0.3s ease, transform 0.3s ease', // Sin transición para color
    cursor: cursorStyle,
    pointerEvents: pointerEventsStyle,
  };

  const positionsStyles = {
    previous: {
      top: '43%',
      opacity: isDragging ? 0.2 : 0.6,
      fontSize: '0.8rem',
      filter: 'grayscale(80%)',
      transform: 'translate(-50%, -50%)',
    },
    next: {
      top: '57.7%',
      opacity: isDragging ? 0.2 : 0.6,
      fontSize: '0.8rem',
      filter: 'grayscale(80%)',
      transform: 'translate(-50%, -50%)',
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
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={(e) => {
        if (!isDragging && onClick) {
          onClick();
        }
      }}
      onKeyDown={(e) => {
        if (!isDragging && onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-live={position === 'current' ? 'polite' : undefined}
    >
      {mesNombre}
    </h2>
  );
}

MonthHeader.propTypes = {
  date: PropTypes.object.isRequired,
  position: PropTypes.oneOf(['previous', 'current', 'next']).isRequired,
  onClick: PropTypes.func,
  isDragging: PropTypes.bool,
};
