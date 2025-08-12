import { useState, useEffect, useRef, useCallback } from 'react';
import { DateTime } from 'luxon';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';

export function useHomeLogic() {
  const { itemsByDate, setItemsByDate, addItem } = useItems();
  const { user, token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [isRightSidebarPinned, setIsRightSidebarPinned] = useState(false);
  const [isLeftSidebarPinned, setIsLeftSidebarPinned] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [toast, setToast] = useState('');
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  // CircleSmall en Desktop - posición y drag global (sobre Home)
  const smallSize = 350;
  const [circleSmallPos, setCircleSmallPos] = useState({ x: null, y: null });
  const draggingSmallRef = useRef(false);
  const dragOffsetRef = useRef({ dx: 0, dy: 0 });

  const computeDefaultSmallPos = () => {
    // Intentar posicionarlo dentro del círculo de CircleLarge (centro derecha)
    const circleEl = document.getElementById('circle-large-container');
    if (circleEl) {
      const rect = circleEl.getBoundingClientRect();
      const borderInset = 4; // mantenerlo dentro del borde del círculo grande
      const x = rect.left + rect.width - smallSize - borderInset; // bien pegado al borde derecho
      const y = rect.top + rect.height / 2 - smallSize / 2; // centrado vertical
      return { x: Math.max(0, x), y: Math.max(0, y) };
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const x = Math.max(0, vw - smallSize - 16);
    const y = Math.max(0, (vh - smallSize) / 2);
    return { x, y };
  };

  // Inicializar desde preferencias o posición por defecto (sólo desktop)
  useEffect(() => {
    if (window.innerWidth <= 640) return;
    const pref = user?.preferences?.ui?.circleSmallPos || user?.preferences?.circle?.smallPosition;
    let initial = pref && typeof pref.x === 'number' && typeof pref.y === 'number' ? { x: pref.x, y: pref.y } : computeDefaultSmallPos();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    initial = {
      x: Math.min(Math.max(0, initial.x), vw - smallSize),
      y: Math.min(Math.max(0, initial.y), vh - smallSize),
    };
    setCircleSmallPos(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.preferences]);

  // Manejar resize de ventana para mantener CircleSmall dentro de los límites
  useEffect(() => {
    if (window.innerWidth <= 640) return;
    
    const handleResize = () => {
      if (circleSmallPos.x != null && circleSmallPos.y != null) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const clamped = {
          x: Math.min(Math.max(0, circleSmallPos.x), vw - smallSize),
          y: Math.min(Math.max(0, circleSmallPos.y), vh - smallSize),
        };
        if (clamped.x !== circleSmallPos.x || clamped.y !== circleSmallPos.y) {
          setCircleSmallPos(clamped);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [circleSmallPos.x, circleSmallPos.y, smallSize]);

  const persistCircleSmallPos = async (pos) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/auth/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ preferences: { ui: { circleSmallPos: pos } } }),
      });
    } catch {}
  };

  const onCircleSmallMouseDown = useCallback((e) => {
    if (window.innerWidth <= 640) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    dragOffsetRef.current = {
      dx: startX - (circleSmallPos.x ?? 0),
      dy: startY - (circleSmallPos.y ?? 0),
    };
    draggingSmallRef.current = true;

    const onMove = (ev) => {
      ev.preventDefault();
      if (!draggingSmallRef.current) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rawX = ev.clientX - dragOffsetRef.current.dx;
      const rawY = ev.clientY - dragOffsetRef.current.dy;
      const x = Math.min(Math.max(0, rawX), vw - smallSize);
      const y = Math.min(Math.max(0, rawY), vh - smallSize);
      setCircleSmallPos({ x, y });
    };

    const onUp = (ev) => {
      ev.preventDefault();
      if (!draggingSmallRef.current) return;
      draggingSmallRef.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (circleSmallPos.x != null && circleSmallPos.y != null) persistCircleSmallPos(circleSmallPos);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [circleSmallPos.x, circleSmallPos.y]);

  const onCircleSmallDoubleClick = useCallback(() => {
    if (window.innerWidth <= 640) return;
    const def = computeDefaultSmallPos();
    setCircleSmallPos(def);
    persistCircleSmallPos(def);
  }, []);

  const recenterCircleSmall = useCallback(() => {
    if (window.innerWidth <= 640) return;
    const pos = computeDefaultSmallPos();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const clamped = {
      x: Math.min(Math.max(0, pos.x), vw - smallSize),
      y: Math.min(Math.max(0, pos.y), vh - smallSize),
    };
    setCircleSmallPos(clamped);
  }, []);

  const [displayOptions, setDisplayOptions] = useState({
    year: true,
    month: true,
    week: false,
    weekday: true,
    day: true,
    time: false,
    timeZone: 'America/Argentina/Buenos_Aires',
    timeFormat: '24h'
  });

  // Sincronizar displayOptions con las preferencias del usuario
  useEffect(() => {
    if (user?.preferences?.displayOptions) {
      setDisplayOptions(prev => ({ ...prev, ...user.preferences.displayOptions }));
    }
  }, [user?.preferences?.displayOptions]);

  // Sincronizar estados de UI con las preferencias del usuario (solo al cargar)
  useEffect(() => {
    if (user?.preferences?.ui && !preferencesLoaded) {
      const ui = user.preferences.ui;
      if (ui.leftSidebarPinned !== undefined) {
        setIsLeftSidebarPinned(ui.leftSidebarPinned);
      }
      if (ui.rightSidebarPinned !== undefined) {
        setIsRightSidebarPinned(ui.rightSidebarPinned);
      }
      setPreferencesLoaded(true);
    }
  }, [user?.preferences?.ui, preferencesLoaded]);

  // Función para guardar preferencias de UI
  const saveUIPreferences = async (uiChanges) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/auth/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          preferences: { 
            ui: { 
              ...(user?.preferences?.ui || {}), 
              ...uiChanges 
            } 
          } 
        }),
      });
    } catch (error) {
      console.error('Error saving UI preferences:', error);
    }
  };

  // Wrappers para los setters que también guardan las preferencias
  const setLeftSidebarPinnedWithSave = (value) => {
    setIsLeftSidebarPinned(value);
    saveUIPreferences({ leftSidebarPinned: value });
  };

  const setRightSidebarPinnedWithSave = (value) => {
    setIsRightSidebarPinned(value);
    saveUIPreferences({ rightSidebarPinned: value });
  };

  function isOverTrashZone(pos) {
    if (!pos) return false;
    // Coordenadas que coinciden con DragTrashZone (left: 25, top: 5)
    const trashX = 0; // DragTrashZone está en left: 25, pero transform: translateX(-50%) lo centra
    const trashY = 5;
    const trashWidth = 50; // DragTrashZone width: 50
    const trashHeight = 50; // DragTrashZone height: 50

    const isOver = (
      pos.x >= trashX &&
      pos.x <= trashX + trashWidth &&
      pos.y >= trashY &&
      pos.y <= trashY + trashHeight
    );

    return isOver;
  }

  useEffect(() => {
    setIsOverTrash(isOverTrashZone(draggedItem));
  }, [draggedItem]);

  // Resetear draggedItem si no hay un item siendo arrastrado
  useEffect(() => {
    if (draggedItem) {
      // Si draggedItem existe, verificar si realmente hay un drag activo
      // Esto se puede hacer escuchando eventos globales de mouse/touch
      const handleGlobalMouseUp = () => {
        // Pequeño delay para asegurar que el onDrop se procese primero
        setTimeout(() => {
          setDraggedItem(null);
          setIsOverTrash(false);
        }, 100);
      };

      const handleGlobalTouchEnd = () => {
        setTimeout(() => {
          setDraggedItem(null);
          setIsOverTrash(false);
        }, 100);
      };

      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchend', handleGlobalTouchEnd);

      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('touchend', handleGlobalTouchEnd);
      };
    }
  }, [draggedItem]);

  async function handleSelectItem(item, dateKey) {
    if (!dateKey) {
      setToast('Seleccioná un día primero');
      return;
    }

    const angle = Math.random() * 360;
    const distance = 120;
    const rad = (angle * Math.PI) / 180;
    const x = distance * Math.cos(rad);
    const y = distance * Math.sin(rad);

    const newItem = {
      label: item.label,
      angle,
      distance,
      content: item.label === 'Tarea' ? [''] : '',
      ...(item.label === 'Tarea' && { checked: [false] }),
      width: item.label === 'Tarea' ? 200 : 100,
      height: item.label === 'Tarea' ? 150 : 100,
    };

    try {
      // Límite en UI para cuentas no VIP: 15 items totales
      if (!user?.is_vip) {
        const totalCount = Object.values(itemsByDate).reduce((acc, arr) => acc + (arr?.length || 0), 0);
        if (totalCount >= 15) {
          setToast('Haz alcanzado el límite de 15 items para cuentas gratuitas.');
          return;
        }
      }
      await addItem({
        date: dateKey,
        x,
        y,
        rotation: 0,
        rotation_enabled: true,
        ...newItem,
      });
    } catch (e) {
      setToast(e?.message || 'No se pudo crear el item');
    }
  }

  return {
    showRightSidebar,
    setShowRightSidebar,
    showLeftSidebar,
    setShowLeftSidebar,
    showConfig,
    setShowConfig,
    isRightSidebarPinned,
    setIsRightSidebarPinned: setRightSidebarPinnedWithSave,
    isLeftSidebarPinned,
    setIsLeftSidebarPinned: setLeftSidebarPinnedWithSave,
    draggedItem,
    setDraggedItem,
    isOverTrash,
    setIsOverTrash,
    displayOptions,
    setDisplayOptions,
    handleSelectItem,
    itemsByDate,
    setItemsByDate,
    toast,
    setToast,
    circleSmallPos,
    smallSize,
    onCircleSmallMouseDown,
    onCircleSmallDoubleClick,
    recenterCircleSmall,
  };
}
