import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

let activeTooltipSetter = null; // Para que solo haya un tooltip visible

export default function HelpIcon({ text }) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const handleClick = (e) => {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      top: rect.top + rect.height / 2 + window.scrollY,
      left: rect.right + 8 + window.scrollX, // a la derecha del botón
    });

    // Cerrar cualquier otro tooltip activo
    if (activeTooltipSetter && activeTooltipSetter !== setShow) {
      activeTooltipSetter(false);
    }

    setShow((prev) => !prev);
    activeTooltipSetter = setShow;
  };

  useEffect(() => {
    const handleClickOutside = () => setShow(false);
    if (show) {
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
  }, [show]);

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="pl-2 w-5 h-5 flex items-center justify-center rounded-full 
                   text-[var(--color-text-primary)] 
                   transition duration-200"
        aria-label="Help"
      >
        <HelpCircle size={14} />
      </button>

      {show &&
        createPortal(
          <div
            style={{
              position: 'absolute',
              top: position.top,
              left: position.left,
              transform: 'translateY(-50%)',
            }}
            className="px-2 py-1 text-xs rounded 
                       bg-[var(--color-neutral-dark)] 
                       text-[var(--color-text-primary)] 
                       shadow-sm whitespace-nowrap z-[105] 
                       transition-opacity duration-200"
          >
            {text}
          </div>,
          document.body
        )}
    </>
  );
}
