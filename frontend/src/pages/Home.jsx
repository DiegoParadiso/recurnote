import { useState } from 'react';
import CircleLarge from '../components/Circles/CircleLarge/CircleLarge';
import SidebarDayView from '../components/Sidebars/SidebarDayView/SidebarDayView/';
import { Eye, EyeOff } from 'lucide-react';
import CurvedSidebar from '../components/Sidebars/HalfCircleSidebar/HalfCircleSidebar';
import ConfigButton from '../components/common/ConfigButton';
import ConfigPanel from '../components/common/ConfigPanel';
import ThemeToggle from '../components/common/ThemeToggle';

export default function Home() {
  const [showSmall, setShowSmall] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  return (
    <div
      className={`scroll-hidden pt-3 sm:pt-0 w-screen min-h-[100dvh] flex items-center justify-center relative
        text-black dark:text-white`}
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      {/* Botones de configuración y tema arriba a la izquierda */}
      <div className="fixed top-3 left-3 z-70 flex gap-3 items-center">
        <ConfigButton onToggle={() => setShowConfigPanel(v => !v)} />
        <ThemeToggle />
      </div>

      {/* Sidebar izquierdo condicional con estilo */}
      {showLeftSidebar && (
        <div
          style={{
            zIndex: showConfigPanel ? 10 : 30,
            position: 'relative',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 6px var(--color-shadow)',
            borderRadius: '8px',
            backgroundColor: 'var(--color-bg)',
            transition: 'all 0.3s ease',
          }}
        >
          <CurvedSidebar showConfigPanel={showConfigPanel} />
        </div>
      )}

      {/* Contenido principal */}
      <div
        className="relative flex items-center justify-center"
        style={{
          borderRadius: '12px',
          backgroundColor: 'var(--color-bg)',
          transition: 'all 0.3s ease',
        }}
      >
        <CircleLarge
          showSmall={showSmall}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
        />

        {/* Botón para toggle showSmall */}
        <button
          onClick={() => setShowSmall(!showSmall)}
          aria-label="Toggle mostrar pequeño"
          className="absolute right-[-25px] top-1/2 transform -translate-y-1/2 z-10 transition cursor-pointer"
          style={{
            color: 'var(--color-text-secondary)',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '1.2rem',
            userSelect: 'none',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          {showSmall ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* Sidebar derecho condicional con estilo */}
      {showRightSidebar && (
        <SidebarDayView
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          showRightSidebar={showRightSidebar}
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            backgroundColor: 'var(--color-bg)',
            transition: 'all 0.3s ease',
          }}
        />
      )}

      {/* Panel de configuración */}
      <ConfigPanel
        show={showConfigPanel}
        onClose={() => setShowConfigPanel(false)}
        showSmall={showSmall}
        setShowSmall={setShowSmall}
        showRightSidebar={showRightSidebar}
        setShowRightSidebar={setShowRightSidebar}
      />

      {/* Botón para toggle sidebar derecho con flecha animada */}
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
        {/* Flecha apuntando a la izquierda */}
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

      {/* Botón para toggle sidebar izquierdo con flecha animada */}
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
        {/* Flecha apuntando a la derecha */}
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

      {/* Animaciones de las flechas */}
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
