export default function DayButton({ day, style, angle }) {
  const labelDistanceFromCenter = -35; // Más cerca del centro
  const labelX = 16 + labelDistanceFromCenter * Math.cos(angle);
  const labelY = 16 + labelDistanceFromCenter * Math.sin(angle);

  return (
    <div style={{ ...style, position: 'absolute' }}>
      {/* Botón circular */}
      <div className="w-8 h-8 rounded-full border-2 bg-gray-100 shadow-sm relative flex items-center justify-center cursor-pointer hover:bg-black transition duration-200">
        {/* Número más cerca del centro, horizontal, sin rotar */}
        <span
          className="absolute text-[10px] font-medium"
          style={{
            left: `${labelX}px`,
            top: `${labelY}px`,
            transform: `translate(-50%, -50%)`,
            transformOrigin: 'center',
          }}
        >
          {day}
        </span>
      </div>
    </div>
  );
}
