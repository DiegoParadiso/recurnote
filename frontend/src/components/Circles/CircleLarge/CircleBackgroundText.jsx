import React from 'react';
import useWindowDimensions from '../../../hooks/useWindowDimensions'; 

export default function CircleBackgroundText({ circleSize, radius, displayText }) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width <= 640;

  const cx = circleSize / 2;
  const cy = circleSize / 2;

  if (isSmallScreen) {
    // Texto recto centrado en móviles
    return (
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 'var(--z-mid-low)',
          color: 'var(--color-text-primary)',
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: circleSize * 0.025,
          letterSpacing: 1.5,
          fontWeight: 600,
          textAlign: 'center',
          width: '80%',
        }}
      >
        {displayText.toUpperCase()}
      </div>
    );
  }

  // Texto arqueado en pantallas grandes
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: circleSize,
        height: circleSize,
        pointerEvents: 'none',
        zIndex: 'var(--z-mid-low)',
        color: 'var(--color-text-primary)',
      }}
    >
      <svg
        viewBox={`0 0 ${circleSize} ${circleSize}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <path
            id="dayPath"
            d={`M ${cx - radius},${cy} A ${radius},${radius} 0 0,1 ${cx + radius},${cy}`}
            fill="none"
          />
        </defs>
        <text
          fill="currentColor"
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
