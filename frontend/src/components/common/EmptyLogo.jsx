import React from 'react';
import logo from '../../assets/logorecurnote.png';

export default function EmptyLogo({ circleSize, isSmallScreen, isFullboardMode = false }) {
  const fullboardStyles = isFullboardMode
    ? {
        top: '70%',
        left: '50%',
        width: 'min(55vw, 55vh)', 
        transform: 'translate(-200%, -50%) rotate(45deg)'
      }
    : {
        top: isSmallScreen ? '30%' : '26%',
        left: isSmallScreen ? -60 : -30,
        width: circleSize,
        transform: 'translate(-20%, -20%) rotate(35deg)'
      };

  return (
    <img
      src={logo}
      alt="Logo Marca de Agua"
      style={{
        position: 'absolute',
        ...fullboardStyles,
        height: 'auto',
        opacity: 'var(--logo-opacity)',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 'var(--z-base)',
        transformOrigin: 'center center',
        filter: `brightness(var(--logo-brightness)) invert(var(--logo-invert)) contrast(var(--logo-contrast))`,
        mixBlendMode: 'var(--logo-blend)'
      }}
    />
  );
}
