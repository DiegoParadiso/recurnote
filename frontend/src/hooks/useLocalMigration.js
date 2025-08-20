import { useCallback, useState, useRef } from 'react';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';

export function useLocalMigration() {
  const { itemsByDate, setItemsByDate } = useItems();
  const { addItem, user, token } = useItems();
  const { markMigrationComplete } = useAuth();
  const [errorToast, setErrorToast] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);
  const migrationInProgressRef = useRef(false);

  // Verificar si hay items locales (items que no son del servidor)
  const hasLocalItems = useCallback(() => {
    return Object.values(itemsByDate).some(items => 
      items.some(item => item._local === true)
    );
  }, [itemsByDate]);

  const performMigration = useCallback(async () => {
    // Prevenir múltiples migraciones simultáneas
    if (migrationInProgressRef.current || isMigrating) {
      return { success: false, error: 'Migración ya en progreso' };
    }

    // Verificar que haya items locales antes de empezar
    if (!hasLocalItems()) {
      markMigrationComplete('no-items');
      return { success: true, migratedCount: 0 };
    }

    // Verificar autenticación
    if (!user || !token) {
      setErrorToast('Debes estar autenticado para migrar datos');
      markMigrationComplete('failed');
      return { success: false, error: 'No autenticado' };
    }

    setIsMigrating(true);
    migrationInProgressRef.current = true;

    try {
      // Obtener todos los items locales
      const localItems = [];
      Object.values(itemsByDate).forEach(items => {
        items.forEach(item => {
          if (item._local === true) {
            localItems.push(item);
          }
        });
      });

      if (localItems.length === 0) {
        markMigrationComplete('no-items');
        return { success: true, migratedCount: 0 };
      }

      let migratedCount = 0;
      let failedCount = 0;

      // Migrar items uno por uno con delay para evitar sobrecarga
      for (const item of localItems) {
        try {
          await addItem({
            date: item.date,
            x: item.x,
            y: item.y,
            rotation: item.rotation || 0,
            rotation_enabled: item.rotation_enabled !== false,
            label: item.label,
            content: item.content || '',
            ...(item.label === 'Tarea' && { checked: item.checked || [false] }),
            width: item.width,
            height: item.height,
          });
          migratedCount++;
          
          // Pequeño delay entre items para evitar sobrecarga
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error('Error migrando item:', error);
          failedCount++;
          
          // Si es un error de autenticación (403), detener la migración
          if (error.message?.includes('403') || error.message?.includes('Unauthorized')) {
            setErrorToast('Error de autenticación. Por favor, inicia sesión nuevamente.');
            markMigrationComplete('failed');
            return { success: false, error: 'Error de autenticación' };
          }
        }
      }

      // Limpiar items locales después de la migración exitosa
      if (migratedCount > 0) {
        setItemsByDate(prev => {
          const newState = {};
          Object.keys(prev).forEach(dateKey => {
            newState[dateKey] = prev[dateKey].filter(item => item._local !== true);
          });
          return newState;
        });
      }

      markMigrationComplete('completed');
      return { 
        success: true, 
        migratedCount, 
        failedCount,
        message: `${migratedCount} elementos migrados exitosamente${failedCount > 0 ? `, ${failedCount} fallaron` : ''}`
      };
    } catch (error) {
      console.error('Error general en migración:', error);
      setErrorToast('Error durante la migración');
      markMigrationComplete('failed');
      return { 
        success: false, 
        error: error.message || 'Error durante la migración'
      };
    } finally {
      setIsMigrating(false);
      migrationInProgressRef.current = false;
    }
  }, [hasLocalItems, itemsByDate, addItem, markMigrationComplete, setItemsByDate, user, token, isMigrating]);

  return {
    hasLocalItems: hasLocalItems(),
    performMigration,
    errorToast,
    setErrorToast,
    isMigrating
  };
}
