import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocalMigration } from '../../hooks/useLocalMigration';
import BottomToast from './BottomToast';

export default function LocalMigrationHandler() {
  const { migrationStatus } = useAuth();
  const { hasLocalItems, performMigration, isMigrating } = useLocalMigration();
  const [migrationToast, setMigrationToast] = useState('');
  const migrationAttemptedRef = useRef(false);

  useEffect(() => {
    // Solo ejecutar migración si:
    // 1. El estado es 'pending'
    // 2. Hay items locales
    // 3. No se ha intentado ya
    // 4. No está migrando actualmente
    if (
      migrationStatus === 'pending' && 
      hasLocalItems && 
      !migrationAttemptedRef.current && 
      !isMigrating
    ) {
      migrationAttemptedRef.current = true;
      
      const performMigrationAsync = async () => {
        try {
          const result = await performMigration();
          if (result.success) {
            setMigrationToast(result.message || 'Elementos locales migrados exitosamente');
          } else {
            setMigrationToast(result.error || 'Error durante la migración');
          }
        } catch (error) {
          console.error('Error en migración:', error);
          setMigrationToast('Error durante la migración');
        }
      };

      performMigrationAsync();
    }

    // Resetear el flag cuando el estado de migración cambie
    if (migrationStatus !== 'pending') {
      migrationAttemptedRef.current = false;
    }
  }, [migrationStatus, hasLocalItems, performMigration, isMigrating]);

  return (
    <BottomToast 
      message={migrationToast} 
      onClose={() => setMigrationToast('')}
      duration={5000}
    />
  );
}
