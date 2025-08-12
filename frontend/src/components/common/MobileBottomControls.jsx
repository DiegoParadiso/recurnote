import '../../styles/components/common/MobileBottomControls.css';
import { Eye, EyeOff } from 'lucide-react';

export default function MobileBottomControls({ 
  showSmall, 
  setShowSmall, 
  showLeftSidebarMobile, 
  setShowLeftSidebarMobile, 
  showRightSidebarMobile, 
  setShowRightSidebarMobile 
}) {
  return (
    <div className="mobile-controls">
      <button 
        onClick={() => setShowLeftSidebarMobile(prev => !prev)} 
        aria-label="Mostrar sidebar izquierdo" 
        className="p-0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
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
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  );
}
