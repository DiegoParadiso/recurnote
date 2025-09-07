import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import useIsMobile from '../../hooks/useIsMobile';
import '../../styles/components/common/contextmenu.css';

export default function WithContextMenu({ onDelete, children, extraOptions = [], headerContent = null }) {
  const [menuPos, setMenuPos] = useState(null);
  const [portalTarget, setPortalTarget] = useState(null);
  const menuRef = useRef(null);
  const isMobile = useIsMobile();
  
  // Refs para long press
  const longPressTimerRef = useRef(null);
  const longPressThreshold = 800; // 800ms para activar long press
  const touchStartPosRef = useRef(null);
  const hasMovedRef = useRef(false);
  const moveThreshold = 25; // 25px para considerar que se movió (aumentado para no interferir con drag)

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
    
    // Cerrar menú existente y abrir nuevo
    setMenuPos(null);
    setTimeout(() => {
      setMenuPos({ x: menuX, y: menuY });
    }, 0);
  }, [isMobile]);

  // Función para manejar touch start
  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return;
    
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    hasMovedRef.current = false;
    
    // Iniciar timer para long press solo si no se está haciendo drag
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
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  }, [isMobile]);

  // Función para manejar touch end
  const handleTouchEnd = useCallback((e) => {
    if (!isMobile) return;
    
    // Limpiar timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // Limpiar refs
    touchStartPosRef.current = null;
    hasMovedRef.current = false;
  }, [isMobile]);

  const closeMenu = useCallback(() => setMenuPos(null), []);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu();
      }
    };
    const handleScroll = () => closeMenu();
    const handleResize = () => closeMenu();
    const handleContextMenuOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu();
      }
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    window.addEventListener('contextmenu', handleContextMenuOutside);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('contextmenu', handleContextMenuOutside);
    };
  }, [closeMenu]);

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
    onMouseDown: (e) => {
      // Si se inicia un drag/click en el hijo, cerrar el menú para no bloquear el arrastre
      setMenuPos(null);
      if (typeof children.props.onMouseDown === 'function') {
        children.props.onMouseDown(e);
      }
    },
    onContextMenu: !isMobile ? handleContextMenu : undefined,
    onTouchStart: isMobile ? handleTouchStart : undefined,
    onTouchMove: isMobile ? handleTouchMove : undefined,
    onTouchEnd: isMobile ? handleTouchEnd : undefined,
  });

  return (
    <>
      {childrenWithEvents}

      {menuPos && portalTarget &&
        createPortal(
          <div
            ref={menuRef}
            className="context-menu"
            style={{ 
              top: Math.min(menuPos.y + 2, window.innerHeight - 10), 
              left: Math.min(menuPos.x + 2, window.innerWidth - 10) 
            }}
            onContextMenu={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {headerContent && (
              <div className="context-menu-header">
                {headerContent}
              </div>
            )}
            {extraOptions.map((opt, idx) => (
              <div
                key={idx}
                className="context-menu-item"
                onClick={() => {
                  const result = opt.onClick?.();
                  if (!opt.preventClose) {
                    closeMenu();
                  }
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
