import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import i18n from '../i18n/index.js';
import { DateTime } from 'luxon';
import { useItems } from '@context/ItemsContext';
import { useAuth } from '@context/AuthContext';
import { usePreferences } from './usePreferences';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useHomeLogic() {
  const { itemsByDate, addItem } = useItems();
  const { user, token } = useAuth();

  // Use centralized preference management
  const { preferences, updatePreference, updatePreferences } = usePreferences();

  // Extract displayOptions for backward compatibility (memoized to prevent unnecessary re-renders)
  const displayOptions = useMemo(() => preferences.displayOptions || {
    year: true,
    month: true,
    week: false,
    weekday: true,
    day: true,
    time: false,
    timeZone: 'America/Argentina/Buenos_Aires',
    timeFormat: '24h',
    showAccountIndicator: false,
    language: 'auto',
    fullboardMode: false,
  }, [preferences.displayOptions]);

  // Keep ref to latest displayOptions for setDisplayOptions
  const displayOptionsRef = useRef(displayOptions);
  useEffect(() => {
    displayOptionsRef.current = displayOptions;
  }, [displayOptions]);

  // Wrapper to update displayOptions via preference manager (stable reference)
  const setDisplayOptions = useCallback((updater) => {
    if (typeof updater === 'function') {
      // Handle functional updates
      const newDisplayOptions = updater(displayOptionsRef.current);
      updatePreferences({ displayOptions: newDisplayOptions });
    } else {
      // Handle direct updates
      updatePreferences({ displayOptions: updater });
    }
  }, [updatePreferences]);

  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [isRightSidebarPinned, setIsRightSidebarPinned] = useState(false);
  const [isLeftSidebarPinned, setIsLeftSidebarPinned] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [toast, setToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  const combinedItemsByDate = useMemo(() => {
    if (user && token) {
      return itemsByDate || {};
    }
    return {};
  }, [user, token, itemsByDate]);

  // CircleSmall en Desktop - posición y drag global (sobre Home)
  const [smallSize, setSmallSize] = useState(350);
  const [circleSmallPos, setCircleSmallPos] = useState({ x: null, y: null });
  const draggingSmallRef = useRef(false);
  const dragOffsetRef = useRef({ dx: 0, dy: 0 });

  // Posición y drag del sidebar izquierdo (desktop)
  const [leftSidebarPos, setLeftSidebarPos] = useState({ x: 12, y: Math.max(0, (window.innerHeight - 450) / 2) });
  const draggingLeftSidebarRef = useRef(false);
  const leftSidebarDragOffsetRef = useRef({ dx: 0, dy: 0 });
  const [hasUserMovedLeftSidebar, setHasUserMovedLeftSidebar] = useState(false);

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
    let pref = user?.preferences?.ui?.circleSmallPos || user?.preferences?.circle?.smallPosition;

    // Si no hay usuario, buscar en localStorage
    if (!user && !pref) {
      const localPrefs = localStorage.getItem('localUIPreferences');
      if (localPrefs) {
        const localUI = JSON.parse(localPrefs);
        pref = localUI.circleSmallPos;
      }
    }

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

    // No reposicionar si está en fullboard mode (se gestiona desde Home.jsx)
    if (displayOptions?.fullboardMode) return;

    const repositionWhenReady = () => {
      // No reposicionar si el usuario ya lo movió manualmente
      if (hasUserMovedCircle) return;

      // Verificar si no hay preferencias guardadas
      let pref = user?.preferences?.ui?.circleSmallPos || user?.preferences?.circle?.smallPosition;

      // Si no hay usuario, buscar en localStorage
      if (!user && !pref) {
        const localPrefs = localStorage.getItem('localUIPreferences');
        if (localPrefs) {
          const localUI = JSON.parse(localPrefs);
          pref = localUI.circleSmallPos;
        }
      }

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
  }, [smallSize, user?.preferences, hasUserMovedCircle, displayOptions?.fullboardMode]);

  // Manejar resize de ventana para mantener CircleSmall dentro de los límites (sin reposicionar automáticamente)
  useEffect(() => {
    if (window.innerWidth <= 640) return;
    if (displayOptions?.fullboardMode) return;

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
  }, [circleSmallPos.x, circleSmallPos.y, smallSize, displayOptions?.fullboardMode]);



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

      // Guardar la posición final en localStorage si no hay usuario
      if (!token) {
        const currentLocalPrefs = JSON.parse(localStorage.getItem('localUIPreferences') || '{}');
        const updatedPrefs = {
          ...currentLocalPrefs,
          circleSmallPos: { x: circleSmallPos.x, y: circleSmallPos.y }
        };
        localStorage.setItem('localUIPreferences', JSON.stringify(updatedPrefs));
      }

      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [circleSmallPos]);

  // Handlers para arrastrar el sidebar izquierdo en desktop
  const startLeftSidebarDrag = useCallback((e, initialPos) => {
    if (window.innerWidth <= 640) return;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const startX = e ? e.clientX : 0;
    const startY = e ? e.clientY : 0;

    // Obtener posición visual actual del panel para evitar "salto"
    // Medir el panel visible exactamente donde está
    const panelEl = document.querySelector('.curved-sidebar-panel');
    let currentLeft = leftSidebarPos.x ?? 12;
    let currentTop = leftSidebarPos.y ?? Math.max(0, (window.innerHeight - 450) / 2);
    if (panelEl) {
      const rect = panelEl.getBoundingClientRect();
      // Para fixed, rect ya está en coordenadas del viewport. No sumar scroll.
      currentLeft = rect.left;
      currentTop = rect.top;
    }

    const basePos = initialPos || { x: currentLeft, y: currentTop };
    // Primero posicionar el wrapper en la posición actual real
    setLeftSidebarPos({ x: basePos.x, y: basePos.y });
    // Luego fijar el sidebar (después de medir) para evitar saltos
    setIsLeftSidebarPinned(true);

    // Ajuste fino: usar el rect del elemento como base y el mouse como referencia para que no salte
    leftSidebarDragOffsetRef.current = {
      dx: startX - basePos.x,
      dy: startY - basePos.y,
    };
    draggingLeftSidebarRef.current = true;

    const onMove = (ev) => {
      ev.preventDefault();
      if (!draggingLeftSidebarRef.current) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rawX = ev.clientX - leftSidebarDragOffsetRef.current.dx;
      const rawY = ev.clientY - leftSidebarDragOffsetRef.current.dy;
      const panelWidth = 220;
      const panelHeight = 450;
      const x = Math.min(Math.max(0, rawX), vw - panelWidth);
      // Permitir llegar más arriba: margen superior 0
      const y = Math.min(Math.max(0, rawY), vh - panelHeight);
      setLeftSidebarPos({ x, y });
    };

    const onUp = (ev) => {
      ev.preventDefault();
      if (!draggingLeftSidebarRef.current) return;
      draggingLeftSidebarRef.current = false;
      setHasUserMovedLeftSidebar(true);
      if (!token) {
        const currentLocalPrefs = JSON.parse(localStorage.getItem('localUIPreferences') || '{}');
        const updatedPrefs = {
          ...currentLocalPrefs,
          leftSidebarPos: { x: leftSidebarPos.x, y: leftSidebarPos.y },
        };
        localStorage.setItem('localUIPreferences', JSON.stringify(updatedPrefs));
      }

      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [leftSidebarPos, setIsLeftSidebarPinned, token]);

  const onLeftSidebarMouseDown = useCallback((e) => startLeftSidebarDrag(e, leftSidebarPos), [startLeftSidebarDrag, leftSidebarPos]);

  const onCircleSmallDoubleClick = useCallback(() => {
    if (window.innerWidth <= 640) return;

    let resetPos;

    // Si está en fullboard mode, usar posición centrada
    if (displayOptions?.fullboardMode) {
      const centerX = window.innerWidth / 2 - smallSize / 2;
      const posY = 120;
      resetPos = { x: centerX, y: posY };
    } else {
      // Modo normal, usar posición por defecto
      resetPos = computeDefaultSmallPos();
    }

    setCircleSmallPos(resetPos);
    setHasUserMovedCircle(false); // Reset del flag para permitir auto-reposicionamiento futuro

    // Eliminar la posición guardada del localStorage si no hay usuario (para usar posición por defecto)
    if (!token) {
      const currentLocalPrefs = JSON.parse(localStorage.getItem('localUIPreferences') || '{}');
      const { circleSmallPos, ...updatedPrefs } = currentLocalPrefs; // Remover circleSmallPos
      localStorage.setItem('localUIPreferences', JSON.stringify(updatedPrefs));
    }
  }, [token, displayOptions?.fullboardMode, smallSize, computeDefaultSmallPos]);

  // Función para resetear a la posición original (usada por el menú contextual)
  const resetCircleSmallToDefault = useCallback(() => {
    if (window.innerWidth <= 640) return;

    let resetPos;

    // Si está en fullboard mode, usar posición centrada
    if (displayOptions?.fullboardMode) {
      const centerX = window.innerWidth / 2 - smallSize / 2;
      const posY = 120;
      resetPos = { x: centerX, y: posY };
    } else {
      // Modo normal, usar posición por defecto
      resetPos = computeDefaultSmallPos();
    }

    setCircleSmallPos(resetPos);
    setHasUserMovedCircle(false); // Reset del flag para permitir auto-reposicionamiento futuro

    // SOLO AQUÍ se elimina la posición guardada del localStorage para usar posición por defecto
    if (!token) {
      const currentLocalPrefs = JSON.parse(localStorage.getItem('localUIPreferences') || '{}');
      const { circleSmallPos, ...updatedPrefs } = currentLocalPrefs; // Remover circleSmallPos
      localStorage.setItem('localUIPreferences', JSON.stringify(updatedPrefs));
    }
  }, [token, displayOptions?.fullboardMode, smallSize, computeDefaultSmallPos]);



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

    // Eliminar la posición guardada del localStorage si no hay usuario (para usar posición por defecto)
    if (!token) {
      const currentLocalPrefs = JSON.parse(localStorage.getItem('localUIPreferences') || '{}');
      const { circleSmallPos, ...updatedPrefs } = currentLocalPrefs; // Remover circleSmallPos
      localStorage.setItem('localUIPreferences', JSON.stringify(updatedPrefs));
    }
  }, [smallSize, computeDefaultSmallPos, token]);

  // Language preference handling - apply when it changes
  useEffect(() => {
    const langPref = displayOptions?.language;
    if (!langPref || langPref === 'auto') {
      // Respetar autodetección actual; solo sincronizar atributo lang
      document.documentElement.setAttribute('lang', i18n.language || 'en');
      return;
    }
    if (i18n.language !== langPref) {
      i18n.changeLanguage(langPref).then(() => {
        document.documentElement.setAttribute('lang', i18n.language || 'en');
      }).catch(() => {
        // noop
      });
    }
  }, [displayOptions?.language]);

  // Wrappers para los setters que también guardan las preferencias
  const setLeftSidebarPinnedWithSave = useCallback((value) => {
    setIsLeftSidebarPinned(value);
    updatePreference('ui.leftSidebarPinned', value);
  }, [updatePreference]);

  const setRightSidebarPinnedWithSave = useCallback((value) => {
    setIsRightSidebarPinned(value);
    updatePreference('ui.rightSidebarPinned', value);
  }, [updatePreference]);

  function isOverTrashZone(pos) {
    if (!pos) return false;
    // Coordenadas que coinciden con DragTrashZone (left: 25, top: 5)
    const trashX = 0;
    const trashY = 5;
    const trashWidth = 50;
    const trashHeight = 50;

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
      setToast(t('alerts.selectDayFirstShort'));
      return;
    }

    const angle = Math.random() * 360;
    const distance = 120;
    const rad = (angle * Math.PI) / 180;

    const newItem = {
      label: item.label,
      content: item.label === 'Tarea' ? [''] : '',
      ...(item.label === 'Tarea' && { checked: [false] }),
      width: item.label === 'Tarea' ? 200 : 100,
      height: item.label === 'Tarea' ? 46 : 100,
    };

    if (displayOptions?.fullboardMode) {
      // En fullboard mode, poner en el centro de la pantalla
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      newItem.fullboard_x = centerX;
      newItem.fullboard_y = centerY;
      // Valores dummy para normal mode (o calcular algo válido)
      newItem.angle = 0;
      newItem.distance = 0;
      newItem.x = centerX;
      newItem.y = centerY;
    } else {
      newItem.angle = angle;
      newItem.distance = distance;
      newItem.x = distance * Math.cos(rad);
      newItem.y = distance * Math.sin(rad);
    }

    try {
      await addItem({
        date: dateKey,
        rotation: 0,
        rotation_enabled: true,
        ...newItem,
      });
    } catch (e) {
      setToast(e?.message || t('alerts.itemCreateError'));
    }
  }, [addItem, setToast, displayOptions?.fullboardMode]);

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
    setCircleSmallPos,
    smallSize,
    onCircleSmallMouseDown,
    onCircleSmallDoubleClick,
    resetCircleSmallToDefault,
    recenterCircleSmall,
    leftSidebarPos,
    setLeftSidebarPos,
    onLeftSidebarMouseDown,
    startLeftSidebarDrag,
    errorToast,
    setErrorToast,
  };
}
