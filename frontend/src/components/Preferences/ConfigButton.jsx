import { SlidersHorizontal } from 'lucide-react';
import { useTheme } from '@context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function ConfigButton({ onToggle }) {
  const { isLightTheme } = useTheme();
  const { t } = useTranslation();
  
  // Filtro para adaptar iconos al tema
  const iconFilter = isLightTheme 
    ? 'brightness(0) saturate(100%)' // Negro para tema claro
    : 'brightness(0) saturate(100%) invert(1)'; // Blanco para tema oscuro
  return (
    <button
      onClick={onToggle}
      aria-label={t('common.open_config')}
      className="p-2 transition-colors cursor-pointer"
      title={t('common.config')}
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
