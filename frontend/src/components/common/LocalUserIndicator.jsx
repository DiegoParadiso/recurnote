import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useItems } from '@context/ItemsContext';
import { useAuth } from '@context/AuthContext';
import useIsMobile from '@hooks/useIsMobile';
import '@components/common/LocalUserIndicator.css';

export default function LocalUserIndicator({ showAccountIndicator = true }) {
  const { t } = useTranslation();
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
        mode: t('account.modePremium'),
        showCount: false
      };
    } else {
      // Usuario regular
      maxItems = 15;
      remainingSlots = Math.max(0, maxItems - totalItems);
      modeInfo = {
        mode: t('account.modeUser'),
        showCount: true,
        count: t('account.remaining', { count: remainingSlots })
      };
    }
  } else {
    totalItems = Object.values(itemsByDate).reduce((acc, arr) => acc + (arr?.length || 0), 0);
    maxItems = 5;
    remainingSlots = Math.max(0, maxItems - totalItems);
    modeInfo = {
      mode: t('account.modeLocal'),
      showCount: true,
      count: t('account.remaining', { count: remainingSlots })
    };
  }

  if (!modeInfo) return null;

  // Estilos inline para el parpadeo
  const dotStyle = {
    backgroundColor: '#9ca3af',
    opacity: isBlinking ? 0.6 : 1,
    transform: isBlinking ? 'scale(0.95)' : 'scale(1)',
    transition: 'all 0.4s ease-in-out'
  };

  return (
    <div
      className="fixed bottom-4 left-4 z-low px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm local-user-indicator"
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
