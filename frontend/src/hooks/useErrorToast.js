import { useState, useCallback } from 'react';

export default function useErrorToast(duration = 3000) {
  const [errorToast, setErrorToast] = useState('');

  const showError = useCallback((message) => {
    setErrorToast(message);
    setTimeout(() => setErrorToast(''), duration);
  }, [duration]);

  const clearError = useCallback(() => {
    setErrorToast('');
  }, []);

  return {
    errorToast,
    showError,
    clearError,
  };
}
