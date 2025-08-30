import React from 'react';
import logo from '../../assets/logorecurnote.png';
import { Z_INDEX } from '../../utils/constants/zIndex';

export default function EmptyLogo({ circleSize, isSmallScreen }) {
  return (
    <img
      src={logo}
      alt="Logo Marca de Agua"
      style={{
        position: 'absolute',
        top: isSmallScreen ? '30%' : '26%',
        left: isSmallScreen ? -60 : -30,
        width: circleSize,
        height: 'auto',
        opacity: 'var(--logo-opacity)',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: Z_INDEX.base, // Por encima de los patterns (z-index: -1)
        transform: `translate(-20%, -20%) rotate(35deg)`,
        transformOrigin: 'center center',
        filter: `brightness(var(--logo-brightness)) invert(var(--logo-invert))`,
      }}
    />
  );
}
