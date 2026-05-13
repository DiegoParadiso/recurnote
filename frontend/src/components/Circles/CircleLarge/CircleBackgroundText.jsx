import React from 'react';
import PropTypes from 'prop-types';
import useWindowDimensions from '@hooks/useWindowDimensions';
import { PRIMARY_FONT } from '../../../config/fonts';

export default function CircleBackgroundText({ circleSize, radius, displayText, fullboardMode = false }) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width <= 640;

  const cx = circleSize / 2;
  const cy = circleSize / 2;

  const getSmallScreenStyle = (isFullboard, size) => {
    const baseStyle = {
      position: 'absolute',
      left: '50%',
      pointerEvents: 'none',
      color: 'var(--color-text-primary)',
      fontFamily: 'Roboto Slab, serif',
      fontWeight: 600,
      textAlign: 'center',
    };

    if (isFullboard) {
      return {
        ...baseStyle,
        top: '0',
        transform: 'translateX(-50%)',
        zIndex: 'var(--z-fullboard)',
        fontSize: '1.5rem',
        letterSpacing: 2,
        width: 'auto',
        paddingTop: '2rem',
        whiteSpace: 'nowrap',
      };
    }

    return {
      ...baseStyle,
      top: '5%',
      transform: 'translate(-50%, 0)',
      zIndex: 'var(--z-mid-low)',
      fontSize: size * 0.03,
      letterSpacing: 1.5,
      width: '80%',
      paddingTop: '1rem',
      whiteSpace: 'normal',
    };
  };

  if (isSmallScreen || fullboardMode) {
    // Texto recto centrado en móviles y fullboard mode
    return (
      <div style={getSmallScreenStyle(fullboardMode, circleSize)}>
        {displayText.toUpperCase()}
      </div>
    );
  }

  // Texto arqueado en pantallas grandes
  const textRadius = radius - 30;

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
            d={`M ${cx - textRadius},${cy} A ${textRadius},${textRadius} 0 0,1 ${cx + textRadius},${cy}`}
            fill="none"
          />
        </defs>
        <text
          fill="currentColor"
          fontFamily="Roboto Slab, serif"
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

CircleBackgroundText.propTypes = {
  circleSize: PropTypes.number.isRequired,
  radius: PropTypes.number.isRequired,
  displayText: PropTypes.string.isRequired,
  fullboardMode: PropTypes.bool,
};
