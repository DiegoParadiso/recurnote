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
      style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
    >
      {isLightTheme ? <Moon size={24} /> : <Sun size={24} />}
    </button>
  );
}
