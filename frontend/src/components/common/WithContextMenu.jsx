import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import useIsMobile from '../../hooks/useIsMobile';
import '../../styles/components/common/contextmenu.css';

export default function WithContextMenu({ onDelete, children, extraOptions = [] }) {
  const [menuPos, setMenuPos] = useState(null);
  const [portalTarget, setPortalTarget] = useState(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const menuRef = useRef(null);
  const isMobile = useIsMobile();
  
  // Refs para long press
  const longPressTimerRef = useRef(null);
  const longPressThreshold = 500; // 500ms para activar long press
  const touchStartPosRef = useRef(null);
  const isLongPressActiveRef = useRef(false);
  const hasMovedRef = useRef(false);
  const moveThreshold = 10; // 10px para considerar que se movió

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    // Primero cierro el menú
    setMenuPos(null);
    // Después abro el nuevo en el próximo ciclo de eventos
    setTimeout(() => {
      setMenuPos({ x: e.clientX, y: e.clientY });
    }, 0);
  }, []);

  // Función para manejar long press en móviles
  const handleLongPress = useCallback((e) => {
    if (!isMobile) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Obtener posición del touch
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Calcular posición absoluta para el menú
    let menuX = touch.clientX;
    let menuY = touch.clientY;
    
    // Ajustar posición para que el menú sea siempre visible en móviles
    if (isMobile) {
      const menuWidth = 200; // Ancho aproximado del menú
      const menuHeight = 150; // Alto aproximado del menú
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Ajustar posición X para que no se salga de la pantalla
      if (menuX + menuWidth > windowWidth) {
        menuX = windowWidth - menuWidth - 10;
      }
      if (menuX < 10) {
        menuX = 10;
      }
      
      // Ajustar posición Y para que no se salga de la pantalla
      if (menuY + menuHeight > windowHeight) {
        menuY = windowHeight - menuHeight - 10;
      }
      if (menuY < 10) {
        menuY = 10;
      }
    }
    
    // Notificar al UnifiedContainer que estamos en modo long press
    if (e.currentTarget.setLongPressMode) {
      e.currentTarget.setLongPressMode(true);
    }
    
    // Cerrar menú existente y abrir nuevo
    setMenuPos(null);
    setTimeout(() => {
      setMenuPos({ x: menuX, y: menuY });
    }, 0);
    
    isLongPressActiveRef.current = true;
  }, [isMobile]);

  // Función para manejar touch start
  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return;
    
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    hasMovedRef.current = false;
    isLongPressActiveRef.current = false;
    
    // Mostrar indicador visual de long press
    setIsLongPressing(true);
    
    // Iniciar timer para long press
    longPressTimerRef.current = setTimeout(() => {
      if (!hasMovedRef.current) {
        handleLongPress(e);
      }
    }, longPressThreshold);
  }, [isMobile, handleLongPress]);

  // Función para manejar touch move
  const handleTouchMove = useCallback((e) => {
    if (!isMobile || !touchStartPosRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPosRef.current.y);
    
    // Si se movió más del umbral, cancelar long press
    if (deltaX > moveThreshold || deltaY > moveThreshold) {
      hasMovedRef.current = true;
      setIsLongPressing(false);
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      
      // Notificar al UnifiedContainer que no estamos en modo long press
      if (e.currentTarget.setLongPressMode) {
        e.currentTarget.setLongPressMode(false);
      }
    }
  }, [isMobile]);

  // Función para manejar touch end
  const handleTouchEnd = useCallback((e) => {
    if (!isMobile) return;
    
    // Ocultar indicador visual
    setIsLongPressing(false);
    
    // Limpiar timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // Limpiar refs
    touchStartPosRef.current = null;
    hasMovedRef.current = false;
    
    // Notificar al UnifiedContainer que no estamos en modo long press
    if (e.currentTarget.setLongPressMode) {
      e.currentTarget.setLongPressMode(false);
    }
  }, [isMobile]);

  const closeMenu = useCallback(() => setMenuPos(null), []);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu();
      }
    };
    const handleContextMenuOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu();
      }
    };
    
    // Para móviles, también cerrar con touch
    const handleTouchStartOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu();
      }
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('contextmenu', handleContextMenuOutside);
    
    // Agregar listener de touch para móviles
    if (isMobile) {
      window.addEventListener('touchstart', handleTouchStartOutside, { passive: true });
    }

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('contextmenu', handleContextMenuOutside);
      if (isMobile) {
        window.removeEventListener('touchstart', handleTouchStartOutside);
      }
    };
  }, [closeMenu, isMobile]);

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Clonar children con los eventos apropiados
  const childrenWithEvents = React.cloneElement(children, {
    onContextMenu: !isMobile ? handleContextMenu : undefined,
    onTouchStart: isMobile ? handleTouchStart : undefined,
    onTouchMove: isMobile ? handleTouchMove : undefined,
    onTouchEnd: isMobile ? handleTouchEnd : undefined,
  });

  return (
    <>
      {childrenWithEvents}

      {/* Indicador visual de long press en móviles */}
      {isMobile && isLongPressing && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            zIndex: 'var(--z-toast)',
            pointerEvents: 'none',
            animation: 'fadeInOut 0.5s ease-in-out',
          }}
        >
          Mantén presionado...
        </div>
      )}

      {menuPos && portalTarget &&
        createPortal(
          <div
            ref={menuRef}
            className="context-menu"
            style={{ top: menuPos.y + 2, left: menuPos.x + 2 }}
            onContextMenu={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {extraOptions.map((opt, idx) => (
              <div
                key={idx}
                className="context-menu-item"
                onClick={() => {
                  opt.onClick?.();
                  closeMenu();
                }}
              >
                {opt.label}
              </div>
            ))}
            {onDelete && (
              <div
                className="context-menu-item context-menu-item-danger"
                onClick={() => {
                  onDelete();
                  closeMenu();
                }}
              >
                Eliminar
              </div>
            )}
          </div>,
          portalTarget
        )}
    </>
  );
}
