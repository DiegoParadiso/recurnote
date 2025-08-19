import { useCallback } from 'react';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';

export function useLocalMigration() {
  const { itemsByDate, setItemsByDate } = useItems();
  const { addItem } = useItems();
  const { markMigrationComplete } = useAuth();

  // Verificar si hay items locales (items que no son del servidor)
  const hasLocalItems = Object.values(itemsByDate).some(items => 
    items.some(item => item._local === true)
  );

  const performMigration = useCallback(async () => {
    if (!hasLocalItems) {
      markMigrationComplete('no-items');
      return { success: true, migratedCount: 0 };
    }

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

      let migratedCount = 0;
      let failedCount = 0;

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
        } catch (error) {
          console.error('Error migrating item:', error);
          failedCount++;
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
      console.error('Migration failed:', error);
      markMigrationComplete('failed');
      return { 
        success: false, 
        error: error.message || 'Error durante la migración'
      };
    }
  }, [hasLocalItems, itemsByDate, addItem, markMigrationComplete, setItemsByDate]);

  return {
    hasLocalItems,
    performMigration
  };
}
