import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import '@styles/components/common/contextmenu.css';
import { useTranslation } from 'react-i18next';

export default function CircleSmallWithContextMenu({ 
  children, 
  onResetPosition, 
  onHide,
  onContextMenu: externalOnContextMenu 
}) {
  const { t } = useTranslation();
  const [menuPos, setMenuPos] = useState(null);
  const [portalTarget, setPortalTarget] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    // Si hay un manejador externo, lo ejecutamos primero
    if (externalOnContextMenu) {
      externalOnContextMenu(e);
    }

    // Primero cierro el menú
    setMenuPos(null);
    // Después abro el nuevo en el próximo ciclo de eventos
    setTimeout(() => {
      setMenuPos({ x: e.clientX, y: e.clientY });
    }, 0);
  }, [externalOnContextMenu]);

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

    window.addEventListener('click', handleClick);
    window.addEventListener('contextmenu', handleContextMenuOutside);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('contextmenu', handleContextMenuOutside);
    };
  }, [closeMenu]);

  return (
    <>
      {children && React.cloneElement(children, { onContextMenu: handleContextMenu })}

      {menuPos && portalTarget &&
        createPortal(
          <div
            ref={menuRef}
            className="context-menu"
            style={{ top: menuPos.y + 2, left: menuPos.x + 2 }}
            onContextMenu={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="context-menu-item"
              onClick={() => {
                onResetPosition?.();
                closeMenu();
              }}
            >
              {t('context.resetPosition')}
            </div>
            <div
              className="context-menu-item"
              onClick={() => {
                onHide?.();
                closeMenu();
              }}
            >
              {t('context.hide')}
            </div>
          </div>,
          portalTarget
        )}
    </>
  );
}
