import { SlidersHorizontal } from 'lucide-react';

export default function ConfigButton({ onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Abrir configuración"
      className="p-2 transition-colors cursor-pointer"
      title="Configuración"
      style={{ 
        background: 'transparent', 
        border: 'none', 
        color: 'var(--color-text-primary)',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--color-muted)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--color-text-primary)';
      }}
    >
      <SlidersHorizontal size={20} />
    </button>
  );
}
