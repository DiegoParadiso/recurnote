import { SlidersHorizontal } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ConfigButton({ onToggle }) {
  const { isLightTheme } = useTheme();
  
  // Filtro para adaptar iconos al tema
  const iconFilter = isLightTheme 
    ? 'brightness(0) saturate(100%)' // Negro para tema claro
    : 'brightness(0) saturate(100%) invert(1)'; // Blanco para tema oscuro
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
