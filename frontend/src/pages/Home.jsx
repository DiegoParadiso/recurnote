import { useState } from 'react';
import CircleLarge from '../components/Circles/CircleLarge/CircleLarge';
import SidebarDayView from '../components/Sidebars/SidebarDayView/SidebarDayView/';
import { Eye, EyeOff } from 'lucide-react';
import HalfCircleSidebar from '../components/Sidebars/HalfCircleSidebar/HalfCircleSidebar';
import ConfigButton from '../components/common/ConfigButton';
import ConfigPanel from '../components/common/ConfigPanel';

export default function Home() {
  const [showSmall, setShowSmall] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  return (
    <div className="pt-3 sm:pt-0 w-screen min-h-[100dvh] bg-neutral-100 flex items-center justify-center relative">

      {/* Configuración */}
      <ConfigButton onToggle={() => setShowConfigPanel(v => !v)} />
      <ConfigPanel
        show={showConfigPanel}
        onClose={() => setShowConfigPanel(false)}
        showSmall={showSmall}
        setShowSmall={setShowSmall}
        showRightSidebar={showRightSidebar}
        setShowRightSidebar={setShowRightSidebar}
      />

      {/* Sidebar izquierdo condicional */}
      {showLeftSidebar && (
        <div style={{ zIndex: showConfigPanel ? 10 : 30, position: 'relative' }}>
          <HalfCircleSidebar showConfigPanel={showConfigPanel} />
        </div>
      )}

      {/* Contenido principal */}
      <div className="relative flex items-center justify-center">
        <CircleLarge
          showSmall={showSmall}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
        />

        <button
          onClick={() => setShowSmall(!showSmall)}
          className="absolute right-[-25px] top-1/2 transform -translate-y-1/2 z-10 text-gray-300 hover:text-gray-600 transition"
        >
          {showSmall ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* Sidebar derecho condicional */}
      {showRightSidebar && (
        <SidebarDayView
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          showRightSidebar={showRightSidebar}
        />
      )}

      {/* Flecha animada para mostrar/ocultar sidebar derecho */}
      <button
        onClick={() => setShowRightSidebar(v => !v)}
        aria-label="Toggle right sidebar"
        className="fixed right-0 z-20 cursor-pointer flex items-center justify-center w-8 h-8 text-gray-300 animate-[slideLeftRight_2s_ease-in-out_infinite]"
        style={{
          top: '50vh',
          transform: 'translateY(-50%)',
          background: 'transparent',
          border: 'none',
          padding: 0,
        }}
      >
        {/* ← Flecha apuntando a la izquierda */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Flecha animada para mostrar/ocultar sidebar izquierdo */}
      <button
        onClick={() => setShowLeftSidebar(v => !v)}
        aria-label="Toggle left sidebar"
        className="fixed left-0 z-20 cursor-pointer flex items-center justify-center w-8 h-8 text-gray-300 animate-[slideRightLeft_2s_ease-in-out_infinite]"
        style={{
          top: '50vh',
          transform: 'translateY(-50%)',
          background: 'transparent',
          border: 'none',
          padding: 0,
        }}
      >
        {/* → Flecha apuntando a la derecha */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <style>{`
        @keyframes slideLeftRight {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-6px); }
        }
        @keyframes slideRightLeft {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
