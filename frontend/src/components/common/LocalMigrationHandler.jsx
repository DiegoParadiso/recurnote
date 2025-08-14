import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocalMigration } from '../../hooks/useLocalMigration';
import BottomToast from './BottomToast';

export default function LocalMigrationHandler() {
  const { migrationStatus } = useAuth();
  const { hasLocalItems, performMigration } = useLocalMigration();
  const [migrationToast, setMigrationToast] = useState('');

  useEffect(() => {
    if (migrationStatus === 'pending' && hasLocalItems) {
      const performMigrationAsync = async () => {
        try {
          const result = await performMigration();
          if (result.success) {
            setMigrationToast(result.message || 'Elementos locales migrados exitosamente');
          } else {
            setMigrationToast(result.error || 'Error durante la migración');
          }
        } catch (error) {
          console.error('Migration error:', error);
          setMigrationToast('Error durante la migración');
        }
      };

      performMigrationAsync();
    }
  }, [migrationStatus, hasLocalItems, performMigration]);

  return (
    <BottomToast 
      message={migrationToast} 
      onClose={() => setMigrationToast('')}
      duration={5000}
    />
  );
}
