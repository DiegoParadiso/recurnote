import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import '../../../styles/components/circles/DayButton.css';

function DayButton({
  day,
  style,
  angle,
  onClick,
  isSelected,
  buttonSize = 32,
  labelDistanceFromCenter = -35,
  isDragging = false,
}) {
  const { textScale } = useTheme();
  const centerOffset = buttonSize / 2;

  const labelX = centerOffset + labelDistanceFromCenter * Math.cos(angle);
  const labelY = centerOffset + labelDistanceFromCenter * Math.sin(angle);

  return (
          <div
        className="day-button"
        style={{
          ...style,
          position: 'absolute',
          width: `${buttonSize}px`,
          height: `${buttonSize}px`,
        }}
      onClick={(e) => {
        if (!isDragging && onClick) {
          onClick();
        }
      }}
    >
      <div
        className={`rounded-full border relative flex items-center justify-center transition duration-200`}
        style={{
          width: `${buttonSize}px`,
          height: `${buttonSize}px`,
          backgroundColor: isSelected
            ? 'var(--daybutton-selected-bg)'
            : 'var(--daybutton-bg)',
          borderColor: isSelected
            ? '#a3a3a3'
            : '#a3a3a3',
          transition: 'background-color 0.3s ease, border-color 0.3s ease',
          cursor: isDragging ? 'grab' : 'pointer',
          opacity: isDragging ? 0.7 : 1,
          pointerEvents: isDragging ? 'none' : 'auto',
        }}
      >
        <span
          className="absolute select-none"
          style={{
            fontSize: (buttonSize / 3.2) * (textScale === 'large' ? 1.2 : 1),
            left: `${labelX}px`,
            top: `${labelY}px`,
            transform: 'translate(-50%, -50%)',
            userSelect: 'none',
            color: isSelected
              ? 'var(--color-text-primary)'
              : 'var(--color-text-primary)',
            transition: 'color 0.3s ease',
          }}
        >
          {day}
        </span>
      </div>
    </div>
  );
}

export default React.memo(DayButton);
