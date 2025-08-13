import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext'; // importa el hook

export default function ThemeToggle() {
  const { isLightTheme, setIsLightTheme } = useTheme();

  const toggleTheme = () => {
    setIsLightTheme(!isLightTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle tema claro/oscuro"
      className="p-2 transition-colors cursor-pointer"
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
      {isLightTheme ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
