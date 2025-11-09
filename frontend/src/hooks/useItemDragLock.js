import { createContext, useContext, useState, useCallback, useRef } from 'react';

/**
 * Context para gestionar el estado de drag de items y prevenir movimientos concurrentes
 */
const ItemDragLockContext = createContext(null);

export function ItemDragLockProvider({ children }) {
  const [activeItemId, setActiveItemId] = useState(null);
  const [lockedItems, setLockedItems] = useState(new Set());
  const dragTimeoutsRef = useRef(new Map()); // itemId -> timeoutId

  /**
   * Intenta bloquear un item para drag
   * @param {string} itemId - ID del item a bloquear
   * @returns {boolean} - true si se pudo bloquear, false si ya hay otro item bloqueado
   */
  const lockItem = useCallback((itemId) => {
    if (!itemId) return false;
    
    // Si ya está bloqueado este item, está ok
    if (activeItemId === itemId) return true;
    
    // Si hay otro item bloqueado, rechazar
    if (activeItemId && activeItemId !== itemId) {
      return false;
    }
    
    setActiveItemId(itemId);
    setLockedItems(prev => new Set(prev).add(itemId));
    return true;
  }, [activeItemId]);

  /**
   * Desbloquea un item después del drag
   * @param {string} itemId - ID del item a desbloquear
   */
  const unlockItem = useCallback((itemId) => {
    if (!itemId) return;
    
    // Limpiar timeout si existe
    const timeoutId = dragTimeoutsRef.current.get(itemId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      dragTimeoutsRef.current.delete(itemId);
    }
    
    // Solo desbloquear si este item es el activo
    if (activeItemId === itemId) {
      setActiveItemId(null);
    }
    
    setLockedItems(prev => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  }, [activeItemId]);

  /**
   * Programa el desbloqueo de un item después de un delay
   * Útil para evitar bloqueos permanentes si el evento onDrop no se dispara
   */
  const scheduleUnlock = useCallback((itemId, delayMs = 500) => {
    if (!itemId) return;
    
    // Limpiar timeout previo si existe
    const prevTimeout = dragTimeoutsRef.current.get(itemId);
    if (prevTimeout) {
      clearTimeout(prevTimeout);
    }
    
    // Programar nuevo unlock
    const timeoutId = setTimeout(() => {
      unlockItem(itemId);
      dragTimeoutsRef.current.delete(itemId);
    }, delayMs);
    
    dragTimeoutsRef.current.set(itemId, timeoutId);
  }, [unlockItem]);

  /**
   * Verifica si un item está bloqueado
   */
  const isItemLocked = useCallback((itemId) => {
    return lockedItems.has(itemId);
  }, [lockedItems]);

  /**
   * Verifica si un item es el actualmente activo
   */
  const isItemActive = useCallback((itemId) => {
    return activeItemId === itemId;
  }, [activeItemId]);

  const value = {
    activeItemId,
    lockItem,
    unlockItem,
    scheduleUnlock,
    isItemLocked,
    isItemActive,
  };

  return (
    <ItemDragLockContext.Provider value={value}>
      {children}
    </ItemDragLockContext.Provider>
  );
}

/**
 * Hook para usar el sistema de bloqueo de drag
 */
export function useItemDragLock() {
  const context = useContext(ItemDragLockContext);
  if (!context) {
    throw new Error('useItemDragLock debe usarse dentro de ItemDragLockProvider');
  }
  return context;
}
