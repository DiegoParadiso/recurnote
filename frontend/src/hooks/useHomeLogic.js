import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DateTime } from 'luxon';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';

export function useHomeLogic() {
  const { itemsByDate, addItem } = useItems();
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
  const [errorToast, setErrorToast] = useState('');
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  const combinedItemsByDate = useCallback(() => {
    if (user && token) {
      return itemsByDate || {};
    } else {
      return {}; // No hay localItemsByDate en este hook
    }
  }, [user, token, itemsByDate]);

  // CircleSmall en Desktop - posición y drag global (sobre Home)
  const [smallSize, setSmallSize] = useState(350);
  const [circleSmallPos, setCircleSmallPos] = useState({ x: null, y: null });
  const draggingSmallRef = useRef(false);
  const dragOffsetRef = useRef({ dx: 0, dy: 0 });

  // Calcular tamaño responsivo SOLO para móviles - mantener estabilidad en rango problemático
  useEffect(() => {
    const calculateSmallSize = () => {
      // Solo aplicar lógica responsiva en móviles
      if (window.innerWidth <= 640) {
        if (window.innerWidth <= 480) {
          // Rango problemático (450px-480px): MANTENER TAMAÑO ESTABLE
          // En lugar de reducir, mantener un tamaño que funcione bien
          return 420; // Tamaño fijo para evitar que se toquen los elementos
        } else {
          // Móviles normales: mantener tamaño estándar
          return 350;
        }
      } else {
        // Desktop: mantener tamaño original sin cambios
        return 350;
      }
    };

    const newSize = calculateSmallSize();
    setSmallSize(newSize);

    // Listener para resize de ventana
    const handleResize = () => {
      const newSize = calculateSmallSize();
      setSmallSize(newSize);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const computeDefaultSmallPos = () => {
    // Posicionar CircleSmall pegado al borde derecho del CircleLarge, centrado verticalmente
    const circleEl = document.querySelector('.circle-large-container');
    if (circleEl) {
      const rect = circleEl.getBoundingClientRect();
      // Posicionarlo pegado al borde derecho del CircleLarge
      const x = rect.right - smallSize;
      const y = rect.top + rect.height / 2 - smallSize / 2; // centrado vertical
      return { x: Math.max(0, x), y: Math.max(0, y) };
    }
    
    // Fallback si no encuentra el CircleLarge: lado derecho de la pantalla
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const x = Math.max(0, vw - smallSize - 20); // margen desde la derecha
    const y = Math.max(0, (vh - smallSize) / 2);
    return { x, y };
  };

  // Inicializar desde preferencias o posición por defecto (sólo desktop)
  useEffect(() => {
    if (window.innerWidth <= 640) return;
    
    // Si no hay preferencias guardadas, usar posición por defecto (derecha del CircleLarge)
    const pref = user?.preferences?.ui?.circleSmallPos || user?.preferences?.circle?.smallPosition;
    let initial;
    
    if (pref && typeof pref.x === 'number' && typeof pref.y === 'number') {
      // Usar preferencias guardadas
      initial = { x: pref.x, y: pref.y };
    } else {
      // Usar posición por defecto (derecha del CircleLarge)
      initial = computeDefaultSmallPos();
    }
    
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    initial = {
      x: Math.min(Math.max(0, initial.x), vw - smallSize),
      y: Math.min(Math.max(0, initial.y), vh - smallSize),
    };
    setCircleSmallPos(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.preferences]);

  // Estado para rastrear si el usuario ya movió el CircleSmall manualmente
  const [hasUserMovedCircle, setHasUserMovedCircle] = useState(false);

  // Efecto adicional para reposicionar cuando el CircleLarge esté listo (solo en carga inicial)
  useEffect(() => {
    if (window.innerWidth <= 640) return;
    
    const repositionWhenReady = () => {
      // No reposicionar si el usuario ya lo movió manualmente
      if (hasUserMovedCircle) return;
      
      // Verificar si no hay preferencias guardadas
      const pref = user?.preferences?.ui?.circleSmallPos || user?.preferences?.circle?.smallPosition;
      if (pref && typeof pref.x === 'number' && typeof pref.y === 'number') {
        return; // Hay preferencias, no reposicionar
      }
      
      // Intentar obtener la posición correcta del CircleLarge
      const circleEl = document.querySelector('.circle-large-container');
      if (!circleEl) return; // No está listo aún
      
      const newPos = computeDefaultSmallPos();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const clamped = {
        x: Math.min(Math.max(0, newPos.x), vw - smallSize),
        y: Math.min(Math.max(0, newPos.y), vh - smallSize),
      };
      
      // Solo actualizar si la nueva posición es diferente y válida
      if (clamped.x !== circleSmallPos.x || clamped.y !== circleSmallPos.y) {
        setCircleSmallPos(clamped);
      }
    };

    // Observar cuando aparece el CircleLarge en el DOM (solo una vez)
    let hasRepositioned = false;
    const observer = new MutationObserver(() => {
      if (hasRepositioned) return;
      const circleEl = document.querySelector('.circle-large-container');
      if (circleEl) {
        repositionWhenReady();
        hasRepositioned = true;
        observer.disconnect(); // Dejar de observar una vez encontrado
      }
    });

    // Comenzar a observar el body por cambios en el DOM
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // También intentar con delays como fallback (solo una vez)
    const timeoutId1 = setTimeout(() => {
      if (!hasRepositioned) {
        repositionWhenReady();
        hasRepositioned = true;
      }
    }, 100);
    
    const timeoutId2 = setTimeout(() => {
      if (!hasRepositioned) {
        repositionWhenReady();
        hasRepositioned = true;
      }
    }, 500);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
    };
  }, [smallSize, user?.preferences, hasUserMovedCircle]); // Removido circleSmallPos de dependencies

  // Manejar resize de ventana para mantener CircleSmall dentro de los límites (sin reposicionar automáticamente)
  useEffect(() => {
    if (window.innerWidth <= 640) return;
    
    const handleResize = () => {
      // Solo ajustar si está fuera de los límites, NO reposicionar automáticamente
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



  const onCircleSmallMouseDown = useCallback((e) => {
    if (window.innerWidth <= 640) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    
    // Usar la posición actual del estado
    const currentPos = circleSmallPos;
    if (currentPos.x == null || currentPos.y == null) return;
    
    dragOffsetRef.current = {
      dx: startX - currentPos.x,
      dy: startY - currentPos.y,
    };
    draggingSmallRef.current = true;

    const onMove = (ev) => {
      ev.preventDefault();
      if (!draggingSmallRef.current) return;
      
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rawX = ev.clientX - dragOffsetRef.current.dx;
      const rawY = ev.clientY - dragOffsetRef.current.dy;
      
      // Calcular nueva posición con límites
      const x = Math.min(Math.max(0, rawX), vw - smallSize);
      const y = Math.min(Math.max(0, rawY), vh - smallSize);
      
      // Actualizar posición en tiempo real
      setCircleSmallPos({ x, y });
    };

    const onUp = (ev) => {
      ev.preventDefault();
      if (!draggingSmallRef.current) return;
      draggingSmallRef.current = false;
      
      // Marcar que el usuario movió el círculo manualmente
      setHasUserMovedCircle(true);
      
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [circleSmallPos]);

  const onCircleSmallDoubleClick = useCallback(() => {
    if (window.innerWidth <= 640) return;
    const def = computeDefaultSmallPos();
    setCircleSmallPos(def);
    setHasUserMovedCircle(false); // Reset del flag para permitir auto-reposicionamiento futuro
  }, []);

  // Función para resetear a la posición original (usada por el menú contextual)
  const resetCircleSmallToDefault = useCallback(() => {
    if (window.innerWidth <= 640) return;
    const def = computeDefaultSmallPos();
    setCircleSmallPos(def);
    setHasUserMovedCircle(false); // Reset del flag para permitir auto-reposicionamiento futuro
  }, []);



  const recenterCircleSmall = useCallback(() => {
    if (window.innerWidth <= 640) return;
    
    // Usar posición por defecto
    const pos = computeDefaultSmallPos();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const clamped = {
      x: Math.min(Math.max(0, pos.x), vw - smallSize),
      y: Math.min(Math.max(0, pos.y), vh - smallSize),
    };
    setCircleSmallPos(clamped);
    setHasUserMovedCircle(false); // Reset del flag para permitir auto-reposicionamiento futuro
  }, [smallSize, computeDefaultSmallPos]);

  const [displayOptions, setDisplayOptions] = useState({
    year: true,
    month: true,
    week: false,
    weekday: true,
    day: true,
    time: false,
    timeZone: 'America/Argentina/Buenos_Aires',
    timeFormat: '24h',
    showAccountIndicator: true,
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
      setErrorToast('Error al guardar las preferencias de UI');
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

  const handleSelectItem = useCallback(async (item, dateKey) => {
    if (!dateKey) {
      setToast('Seleccioná un día primero');
      return;
    }

    const angle = Math.random() * 360;
    const distance = 120;
    const rad = (angle * Math.PI) / 180;

    const newItem = {
      label: item.label,
      angle,
      distance,
      x: distance * Math.cos(rad),
      y: distance * Math.sin(rad),
      content: item.label === 'Tarea' ? [''] : '',
      ...(item.label === 'Tarea' && { checked: [false] }),
      width: item.label === 'Tarea' ? 200 : 100,
      height: item.label === 'Tarea' ? 150 : 100,
    };

    try {
      await addItem({
        date: dateKey,
        rotation: 0,
        rotation_enabled: true,
        ...newItem,
      });
    } catch (e) {
      setToast(e?.message || 'No se pudo crear el item');
    }
  }, [addItem, setToast]);

  useEffect(() => {
    // No hay toast local, por lo que no se necesita este efecto
  }, []);

  const memoizedCombinedItemsByDate = useMemo(() => {
    if (user && token) {
      return itemsByDate || {};
    } else {
      return {}; // No hay localItemsByDate en este hook
    }
  }, [user, token, itemsByDate]);

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
    itemsByDate: memoizedCombinedItemsByDate,
    addItem,
    toast,
    setToast,
    circleSmallPos,
    smallSize,
    onCircleSmallMouseDown,
    onCircleSmallDoubleClick,
    resetCircleSmallToDefault,
    recenterCircleSmall,
    errorToast,
    setErrorToast,
  };
}
