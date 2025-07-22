import React from 'react';
import logo from '../../../assets/logorecurnote.png';

export default function EmptyLogo({ circleSize }) {
  return (
    <img
      src={logo}
      alt="Logo Marca de Agua"
      style={{
        position: 'absolute',
        top: '26%',
        left: -30,
        width: circleSize * 0.5,
        height: 'auto',
        opacity: 'var(--logo-opacity)',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 0,
        transform: `translate(-20%, -20%) rotate(35deg)`,
        transformOrigin: 'center center',
        filter: `brightness(var(--logo-brightness)) invert(var(--logo-invert))`,
      }}
    />
  );
}
