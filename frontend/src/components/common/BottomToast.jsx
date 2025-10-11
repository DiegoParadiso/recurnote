import { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import useIsMobile from '@hooks/useIsMobile';
import { useTranslation } from 'react-i18next';

// message puede ser: string literal, o { key: 'i18n.path', params?: {...} }
export default function BottomToast({ message, onClose, duration = 2000 }) {
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const onCloseRef = useRef(onClose);
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  // Mantener siempre la última referencia de onClose sin reiniciar el efecto principal
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!message) return;

    setShouldRender(true);
    setVisible(false);

    const appearTimeout = setTimeout(() => setVisible(true), 20);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setShouldRender(false);
        onCloseRef.current?.();
      }, 700);
    }, duration);

    return () => {
      clearTimeout(appearTimeout);
      clearTimeout(hideTimer);
    };
  }, [message, duration]);

  if (!shouldRender) return null;

  // Resolver mensaje internacionalizado si es objeto { key, params }
  let resolvedMessage = '';
  if (typeof message === 'string') {
    resolvedMessage = message;
  } else if (message && typeof message === 'object' && message.key) {
    resolvedMessage = t(message.key, message.params || {});
  }

  const basePositionClass = isMobile
    ? 'top-0 left-1/2 -translate-x-1/2'
    : 'bottom-0 left-1/2 -translate-x-1/2';

  const slideClass = visible
    ? 'translate-y-0'
    : isMobile
      ? '-translate-y-full'
      : 'translate-y-full';

  const roundedClass = isMobile ? 'rounded-b-xl rounded-t-none border-b border-x' : 'rounded-t-xl rounded-b-none border-t border-x';

  return (
    <div
      className={`
        fixed transform ${basePositionClass}
        px-6 py-2 text-sm
        ${roundedClass} shadow-md
        backdrop-blur-md normal-case
        flex justify-center
        transition-transform duration-700 ease-out
        ${slideClass}
      `}
      style={{
        zIndex: 'var(--z-toast)',
        willChange: 'transform',
        backgroundColor: 'var(--color-bg)',
        borderColor: 'var(--color-text-secondary)',
        color: 'var(--color-text-primary)',
        width: isMobile ? 'calc(100vw - 24px)' : 'auto',
        maxWidth: isMobile ? '640px' : '600px',
      }}
    >
      <span className="inline-flex items-center gap-2 text-center">
        <AlertTriangle size={16} aria-hidden="true" />
        <span>{resolvedMessage}</span>
      </span>
    </div>
  );
}
