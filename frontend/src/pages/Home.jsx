import { useState, useEffect } from 'react';
import CircleLarge from '../components/Circles/CircleLarge/CircleLarge';
import CircleSmall from '../components/Circles/CircleSmall/CircleSmall';
import SidebarDayView from '../components/Sidebars/SidebarDayView/SidebarDayView';
import { Eye, EyeOff } from 'lucide-react';
import CurvedSidebar from '../components/Sidebars/HalfCircleSidebar/HalfCircleSidebar';
import ConfigButton from '../components/Preferences/ConfigButton';
import ConfigPanel from '../components/Preferences/ConfigPanel';
import ThemeToggle from '../components/Preferences/ThemeToggle';

export default function Home() {
  const [showSmall, setShowSmall] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  const [showLeftSidebarMobile, setShowLeftSidebarMobile] = useState(false);
  const [showRightSidebarMobile, setShowRightSidebarMobile] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      className="scroll-hidden pt-3 sm:pt-0 w-screen min-h-[100dvh] flex items-center justify-center relative"
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      {/* ConfigButton (menú 3 barras) en móvil arriba izquierda */}
      <div
        className="fixed top-3 left-3 z-[30] sm:hidden"
        aria-label="Mostrar configuración móvil"
      >
        <ConfigButton onToggle={() => setShowConfigPanel(v => !v)} />
      </div>

      {/* ThemeToggle en móvil arriba derecha */}
      <div
        className="fixed top-3 right-3 z-[30] sm:hidden"
        aria-label="Toggle tema oscuro móvil"
      >
        <ThemeToggle />
      </div>

      {/* ConfigButton y ThemeToggle juntos en desktop arriba izquierda */}
      <div className="fixed top-3 left-3 z-[20] hidden sm:flex gap-3 items-center">
        <ConfigButton onToggle={() => setShowConfigPanel(v => !v)} />
        <ThemeToggle />
      </div>

      {/* Sidebar izquierdo desktop */}
      {showLeftSidebar && !isMobile && (
        <div
          className="hidden sm:block"
          style={{
            zIndex: 30,
            position: 'relative',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            backgroundColor: 'var(--color-bg)',
            transition: 'all 0.3s ease',
          }}
        >
          <CurvedSidebar showConfigPanel={showConfigPanel} />
        </div>
      )}

      {/* Sidebar izquierdo móvil */}
      {showLeftSidebarMobile && isMobile && (
        <div className="fixed left-0 right-0 top-0 z-50 bg-[var(--color-bg)] p-4 overflow-auto max-h-[80vh]">
          <button
            onClick={() => setShowLeftSidebarMobile(false)}
            aria-label="Cerrar sidebar izquierdo móvil"
            className="mb-4 text-2xl font-bold"
          >
            ×
          </button>
          <CurvedSidebar showConfigPanel={showConfigPanel} isMobile={true} />
        </div>
      )}

      {/* Contenido principal */}
      <div
        className="relative flex items-center justify-center px-4 sm:px-0"
        style={{
          borderRadius: '12px',
          backgroundColor: 'var(--color-bg)',
          transition: 'all 0.3s ease',
          width: isMobile ? '100vw' : 'auto',
        }}
      >
        <CircleLarge
          showSmall={showSmall}
          selectedDay={selectedDay}
          setSelectedDay={(day) => {
            setSelectedDay(day);
            if (isMobile) {
              setShowSmall(false);
            }
          }}
        />

        {/* Botón toggle mostrar pequeño (solo desktop) */}
        {!isMobile && (
          <button
            onClick={() => setShowSmall(!showSmall)}
            aria-label="Toggle mostrar pequeño"
            className="absolute right-[-25px] top-1/2 transform -translate-y-1/2 z-10 hidden sm:flex"
            style={{
              color: 'var(--color-text-secondary)',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '1.2rem',
              userSelect: 'none',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
          >
            {showSmall ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {/* Botones móviles inferiores */}
      <div className="fixed bottom-4 left-4 right-4 z-50 sm:hidden flex justify-between items-center px-4">
        <button
          onClick={() => setShowLeftSidebarMobile(true)}
          aria-label="Mostrar sidebar izquierdo"
          className="p-0"
          style={{ color: 'var(--color-highlight)', transition: 'all 0.3s ease' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => {
            setShowSmall(prev => {
              return !prev;
            });
          }}
          aria-label="Toggle mostrar pequeño"
          className="p-0"
          style={{ color: 'var(--color-highlight)', transition: 'all 0.3s ease' }}
        >
          {showSmall ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>

        <button
          onClick={() => setShowRightSidebarMobile(true)}
          aria-label="Mostrar sidebar derecho"
          className="p-0"
          style={{ color: 'var(--color-highlight)', transition: 'all 0.3s ease' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Sidebar derecho desktop */}
      {showRightSidebar && !isMobile && (
        <div className="hidden sm:block">
          <SidebarDayView
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            showRightSidebar={showRightSidebar}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              backgroundColor: 'var(--color-text-secondary)',
              transition: 'all 0.3s ease',
            }}
          />
        </div>
      )}

      {/* Sidebar derecho móvil */}
      {showRightSidebarMobile && isMobile && (
        <div className="fixed inset-0 z-50 bg-[var(--color-bg)] p-4 overflow-auto">
          <button
            onClick={() => setShowRightSidebarMobile(false)}
            aria-label="Cerrar sidebar derecho móvil"
            className="mb-4 text-2xl font-bold"
          >
            ×
          </button>
          <SidebarDayView
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            showRightSidebar={showRightSidebarMobile}
            isMobile={true}
          />
        </div>
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

      {/* Toggle sidebar derecho desktop */}
      <button
        onClick={() => setShowRightSidebar(v => !v)}
        aria-label="Toggle right sidebar"
        className="fixed right-0 z-20 cursor-pointer flex items-center justify-center w-8 h-8 text-gray-300 animate-[slideLeftRight_2s_ease-in-out_infinite] hidden sm:flex"
        style={{
          top: '50vh',
          transform: 'translateY(-50%)',
          background: 'transparent',
          border: 'none',
          padding: 0,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Toggle sidebar izquierdo desktop */}
      <button
        onClick={() => setShowLeftSidebar(v => !v)}
        aria-label="Toggle left sidebar"
        className="fixed left-0 z-20 cursor-pointer flex items-center justify-center w-8 h-8 text-gray-300 animate-[slideRightLeft_2s_ease-in-out_infinite] hidden sm:flex"
        style={{
          top: '50vh',
          transform: 'translateY(-50%)',
          background: 'transparent',
          border: 'none',
          padding: 0,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Animaciones flechas */}
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