import { useCallback } from 'react';
import { useLocal } from '../context/LocalContext';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';

export function useLocalMigration() {
  const { migrateLocalItems, getTotalLocalItems } = useLocal();
  const { addItem } = useItems();
  const { markMigrationComplete } = useAuth();

  const hasLocalItems = getTotalLocalItems() > 0;

  const performMigration = useCallback(async () => {
    if (!hasLocalItems) {
      markMigrationComplete('no-items');
      return { success: true, migratedCount: 0 };
    }

    try {
      const localItems = migrateLocalItems();
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
  }, [hasLocalItems, migrateLocalItems, addItem, markMigrationComplete]);

  return {
    hasLocalItems,
    performMigration
  };
}
