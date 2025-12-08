import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

let activeTooltipSetter = null; // Para que solo haya un tooltip visible

export default function HelpIcon({ text }) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [scrollTarget, setScrollTarget] = useState(null);
  const tooltipRef = useRef(null);

  const handleClick = (e) => {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    // Posición base relativa al viewport (position: fixed)
    const baseTop = rect.top + rect.height / 2;
    const baseLeft = rect.right + 8;
    setPosition({ top: baseTop, left: baseLeft });

    // Cerrar cualquier otro tooltip activo
    if (activeTooltipSetter && activeTooltipSetter !== setShow) {
      activeTooltipSetter(false);
    }

    setShow((prev) => !prev);
    activeTooltipSetter = setShow;

    // Vincular el scroll del panel para autocerrar
    try {
      const panelMain = document.querySelector('.config-panel-main');
      setScrollTarget(panelMain || null);
    } catch { }
  };

  useEffect(() => {
    if (!show) return;

    const close = () => setShow(false);

    // Cerrar por click fuera
    window.addEventListener('click', close);
    // Cerrar por scroll global
    window.addEventListener('scroll', close, { passive: true });
    // Cerrar por scroll dentro del panel
    if (scrollTarget) scrollTarget.addEventListener('scroll', close, { passive: true });

    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('scroll', close);
      if (scrollTarget) scrollTarget.removeEventListener('scroll', close);
    };
  }, [show, scrollTarget]);

  // Cuando se muestre, ajustar para que no salga de pantalla (mobile/desktop)
  useEffect(() => {
    if (!show) return;
    const el = tooltipRef.current;
    if (!el) return;

    const margin = 8; // margen desde los bordes
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;

    // Medir tooltip
    const rect = el.getBoundingClientRect();

    let top = position.top;
    let left = position.left;

    // Si se sale por la derecha, intentar colocarlo a la izquierda del icono
    if (rect.right > vpW - margin) {
      const anchor = el.dataset.anchorRight ? Number(el.dataset.anchorRight) : null;
      // Si tenemos referencia del botón, reposicionar a la izquierda
      // No tenemos anchor explícito, así que estimamos colocando 8px a la izquierda del centro actual
      left = Math.max(margin, vpW - rect.width - margin);
    }

    // Clamp horizontal
    left = Math.max(margin, Math.min(left, vpW - rect.width - margin));

    // Clamp vertical
    top = Math.max(margin, Math.min(top - rect.height / 2, vpH - rect.height - margin));

    // Aplicar
    // Usamos translateY(0) porque ya centramos verticalmente con el cálculo anterior
    el.style.transform = 'translateY(0)';
    el.style.top = `${top}px`;
    el.style.left = `${left}px`;
  }, [show, position]);

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
            ref={tooltipRef}
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
              transform: 'translateY(-50%)',
              zIndex: 'calc(var(--z-max) + 50)',
              maxWidth: 'calc(100vw - 24px)',
              whiteSpace: 'normal',
              wordBreak: 'break-word'
            }}
            className="px-2 py-1 text-xs rounded 
                       bg-[var(--color-neutral-dark)] 
                       text-[var(--color-text-primary)] 
                       shadow-sm 
                       transition-opacity duration-200"
          >
            {text}
          </div>,
          document.body
        )}
    </>
  );
}
