export default function DayButton({
  day,
  style,
  angle,
  onClick,
  isSelected,
  buttonSize = 32,
  labelDistanceFromCenter = -35,
}) {
  const centerOffset = buttonSize / 2;

  const labelX = centerOffset + labelDistanceFromCenter * Math.cos(angle);
  const labelY = centerOffset + labelDistanceFromCenter * Math.sin(angle);

  return (
    <div
      style={{
        ...style,
        position: 'absolute',
        width: `${buttonSize}px`,
        height: `${buttonSize}px`,
      }}
      onClick={onClick}
    >
      <div
        className={`rounded-full border-2 relative flex items-center justify-center cursor-pointer transition duration-200`}
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
        }}
      >
        <span
          className="absolute font-medium select-none"
          style={{
            fontSize: buttonSize / 3.2,
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
