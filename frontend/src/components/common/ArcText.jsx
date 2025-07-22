export default function ArcText({ circleSize, radius, cx, cy, text }) {
  const arcStartX = cx - radius;
  const arcEndX = cx + radius;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: circleSize,
        height: circleSize,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <svg viewBox={`0 0 ${circleSize} ${circleSize}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <path
            id="dayPath"
            d={`M ${arcStartX},${cy} A ${radius},${radius} 0 0,1 ${arcEndX},${cy}`}
            fill="none"
          />
        </defs>
        <text
          fill="#1f2937"
          fontFamily="IBM Plex Mono, monospace"
          fontSize={circleSize * 0.03}
          letterSpacing="2"
          fontWeight="600"
        >
          <textPath href="#dayPath" startOffset="50%" textAnchor="middle">
            {text.toUpperCase()}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
