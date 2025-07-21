// components/Circles/CircleLarge/CircleBackgroundText.jsx
import React from 'react';

export default function CircleBackgroundText({ circleSize, radius, displayText }) {
  const cx = circleSize / 2;
  const cy = circleSize / 2;

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
            d={`M ${cx - radius},${cy} A ${radius},${radius} 0 0,1 ${cx + radius},${cy}`}
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
            {displayText.toUpperCase()}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
