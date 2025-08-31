import '../../styles/components/common/MobileBottomControls.css';
import { Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function MobileBottomControls({ 
  showSmall, 
  setShowSmall, 
  showLeftSidebarMobile, 
  setShowLeftSidebarMobile, 
  showRightSidebarMobile, 
  setShowRightSidebarMobile 
}) {
  const { isLightTheme } = useTheme();
  
  // Filtro para adaptar iconos al tema
  const iconFilter = isLightTheme 
    ? 'brightness(0) saturate(100%)' // Negro para tema claro
    : 'brightness(0) saturate(100%) invert(1)'; // Blanco para tema oscuro
  return (
    <div className="mobile-controls">
      <button 
        onClick={() => setShowLeftSidebarMobile(prev => !prev)} 
        aria-label="Mostrar sidebar izquierdo" 
        className="p-0"
      >
        <img src="/assets/plus.svg" alt="Plus" className="w-5 h-5" style={{ filter: iconFilter }} />
      </button>

      <button 
        onClick={() => setShowSmall(prev => !prev)} 
        aria-label="Toggle mostrar pequeño" 
        className="p-0"
      >
        {showSmall ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>

      <button 
        onClick={() => setShowRightSidebarMobile(prev => !prev)} 
        aria-label="Mostrar sidebar derecho" 
        className="p-0"
      >
        <img src="/assets/category.svg" alt="Category" className="w-5 h-5" style={{ filter: iconFilter }} />
      </button>
    </div>
  );
}
