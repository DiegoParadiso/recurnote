import { Eye, EyeOff } from 'lucide-react';

export default function MobileBottomControls({ showSmall, setShowSmall, onToggleLeft, onToggleRight }) {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-10 sm:hidden flex justify-between items-center px-4">
      <button onClick={onToggleLeft} aria-label="Mostrar sidebar izquierdo" className="p-0" style={{ color: 'var(--color-highlight)' }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <button onClick={() => setShowSmall(prev => !prev)} aria-label="Toggle mostrar pequeño" className="p-0" style={{ color: 'var(--color-highlight)' }}>
        {showSmall ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>

      <button onClick={onToggleRight} aria-label="Mostrar sidebar derecho" className="p-0" style={{ color: 'var(--color-highlight)' }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  );
}
