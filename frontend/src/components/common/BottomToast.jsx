import { useEffect, useState } from 'react';

export default function BottomToast({ message, onClose, duration = 2000 }) {
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!message) return;

    setShouldRender(true);
    setVisible(false);

    const appearTimeout = setTimeout(() => {
      setVisible(true);
    }, 20);

    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setShouldRender(false);
        onClose();
      }, 700); 
    }, duration);

    return () => {
      clearTimeout(appearTimeout);
      clearTimeout(hideTimer);
    };
  }, [message, duration, onClose]);

  if (!shouldRender) return null;

  return (
    <div
      className={`
        fixed bottom-0 left-1/2 transform -translate-x-1/2
        px-6 py-2 text-sm w-fit max-w-[90%]
        rounded-t-xl rounded-b-none shadow-md border-t border-x
        bg-gray-100 border-gray-400 text-neutral-900
        backdrop-blur-md normal-case
        transition-transform duration-700 ease-out
        ${visible ? 'translate-y-0' : 'translate-y-full'}
      `}
      style={{
        zIndex: 9999,
        willChange: 'transform',
      }}
    >
      {message}
    </div>
  );
}
