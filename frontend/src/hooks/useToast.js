import { useState, useEffect, useRef } from 'react';

export default function useToast(defaultDuration = 3000) {
  const [message, setMessage] = useState('');
  const timeoutRef = useRef(null);

  const showToast = (msg, duration = defaultDuration) => {
    setMessage(msg);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setMessage('');
    }, duration);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return { message, setMessage, showToast };
}
