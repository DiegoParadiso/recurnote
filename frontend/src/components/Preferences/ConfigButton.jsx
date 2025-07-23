import { SlidersHorizontal } from 'lucide-react';

export default function ConfigButton({ onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Abrir configuración"
      className="p-1 text-neutral-500 hover:text-neutral-700 active:scale-95 transition-transform cursor-pointer"
      title="Configuración"
      style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)' }}
    >
      <SlidersHorizontal size={24} />
    </button>
  );
}
