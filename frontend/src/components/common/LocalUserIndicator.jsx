import React, { useState, useEffect } from 'react';
import { useItems } from '../../context/ItemsContext';
import { useAuth } from '../../context/AuthContext';
import useIsMobile from '../../hooks/useIsMobile';
import './LocalUserIndicator.css';

export default function LocalUserIndicator({ showAccountIndicator = true }) {
  const { itemsByDate } = useItems();
  const { user, token } = useAuth();
  const isMobile = useIsMobile();
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(prev => !prev);
    }, 1000); // Cambiar cada 1 segundo para un efecto más sutil
    
    return () => clearInterval(interval);
  }, []); // Sin dependencias para que siempre funcione

  if (isMobile || !showAccountIndicator) return null;

  let modeInfo = null;
  let totalItems = 0;
  let maxItems = 0;
  let remainingSlots = 0;
  let isLocalMode = !user || !token;

  if (user && token) {
    // Usuario autenticado
    totalItems = Object.values(itemsByDate).reduce((acc, arr) => acc + (arr?.length || 0), 0);
    
    if (user.is_vip) {
      // Usuario Premium
      modeInfo = {
        mode: 'Modo Premium',
        showCount: false
      };
    } else {
      // Usuario regular
      maxItems = 15;
      remainingSlots = Math.max(0, maxItems - totalItems);
      modeInfo = {
        mode: 'Modo Usuario',
        showCount: true,
        count: `${remainingSlots} Elementos`
      };
    }
  } else {
    // Modo local - usar itemsByDate que ahora incluye items locales
    totalItems = Object.values(itemsByDate).reduce((acc, arr) => acc + (arr?.length || 0), 0);
    maxItems = 5;
    remainingSlots = Math.max(0, maxItems - totalItems);
    modeInfo = {
      mode: 'Modo Local',
      showCount: true,
      count: `${remainingSlots} Elementos`
    };
  }

  if (!modeInfo) return null;

  // Estilos inline para el parpadeo
  const dotStyle = {
    backgroundColor: '#9ca3af', // Mismo color para todos los modos
    opacity: isBlinking ? 0.6 : 1, // Ahora titila en todos los modos
    transform: isBlinking ? 'scale(0.95)' : 'scale(1)',
    transition: 'all 0.4s ease-in-out',
    boxShadow: '0 0 1px rgba(156, 163, 175, 0.2)' // Sombra sutil para todos los modos
  };

  return (
    <div
      className="fixed bottom-4 left-4 z-low px-3 py-2 rounded-lg text-sm font-medium shadow-lg backdrop-blur-sm local-user-indicator"
      style={{
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-border)', // Borde sutil transparente
        transition: 'var(--transition-colors)',
        backdropFilter: 'blur(5px)', // Efecto de cristal
        WebkitBackdropFilter: 'blur(5px)', // Soporte para Safari
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={dotStyle}
        />
        <span>{modeInfo.mode}</span>
        {modeInfo.showCount && (
          <>
            <span style={{ color: 'var(--color-muted)' }}>•</span>
            <span style={{ color: 'var(--color-muted)' }}>
              {modeInfo.count}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
