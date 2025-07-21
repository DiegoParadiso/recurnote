import { Settings } from 'lucide-react';

export default function ConfigButton({ onToggle }) {
  return (
    <div className="fixed top-3 left-3 z-70">
      <button
        onClick={onToggle}
        aria-label="Abrir configuración"
        className="p-1 text-neutral-500 hover:text-neutral-700 active:scale-95 transition-transform cursor-pointer"
        title="Configuración"
        style={{ background: 'transparent', border: 'none' }}
      >
        <Settings size={24} />
      </button>
    </div>
  );
}
