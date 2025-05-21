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
        className={`rounded-full border-2 shadow-sm relative flex items-center justify-center cursor-pointer transition duration-200 ${
          isSelected ? 'bg-black border-black' : 'bg-gray-100 border-gray-300 hover:bg-black'
        }`}
        style={{
          width: `${buttonSize}px`,
          height: `${buttonSize}px`,
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
          }}
        >
          {day}
        </span>
      </div>
    </div>
  );
}