import { useState, useCallback } from 'react';

export default function usePremiumModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [featureName, setFeatureName] = useState('');

  const openModal = useCallback((feature = '') => {
    setFeatureName(feature);
    setIsOpen(true);
    // Deshabilitar scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    // Restaurar scroll del body
    document.body.style.overflow = 'unset';
  }, []);

  const handleUpgrade = useCallback(() => {
    // Aquí iría la lógica para redirigir a la página de pago
    console.log('Upgrading to premium...');
    // Ejemplo de redirección (descomenta cuando tengas la ruta)
    // window.location.href = '/pricing';
  }, []);

  return {
    isOpen,
    featureName,
    openModal,
    closeModal,
    handleUpgrade
  };
}
