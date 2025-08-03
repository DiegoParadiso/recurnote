import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import CircleLarge from '../components/Circles/CircleLarge/CircleLarge';
import SidebarDayView from '../components/Sidebars/SidebarDayView/SidebarDayView';
import CurvedSidebar from '../components/Sidebars/HalfCircleSidebar/HalfCircleSidebar';
import ConfigButton from '../components/Preferences/ConfigButton';
import ConfigPanel from '../components/Preferences/ConfigPanel';
import ThemeToggle from '../components/Preferences/ThemeToggle';
import useIsMobile from '../hooks/useIsMobile';
import DesktopSidebarToggles from '../components/common/DesktopSidebarToggles'; // Ajusta ruta
import MobileBottomControls from '../components/common/MobileBottomControls';   // Ajusta ruta

export default function Home() {
  const [showSmall, setShowSmall] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showLeftSidebarMobile, setShowLeftSidebarMobile] = useState(false);
  const [showRightSidebarMobile, setShowRightSidebarMobile] = useState(false);

  const isMobile = useIsMobile();

  return (
    <div
      className="scroll-hidden pt-3 sm:pt-0 w-screen min-h-[100dvh] flex items-center justify-center relative"
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      {/* Botones Config y Tema móvil arriba */}
      <div className="fixed top-3 left-3 z-[30] sm:hidden" aria-label="Mostrar configuración móvil">
        <ConfigButton onToggle={() => setShowConfigPanel(v => !v)} />
      </div>
      <div className="fixed top-3 right-3 z-[30] sm:hidden" aria-label="Toggle tema oscuro móvil">
        <ThemeToggle />
      </div>

      {/* Botones Config y Tema desktop arriba */}
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
        <div className="fixed left-0 right-0 bottom-[64px] z-40">
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
            if (isMobile) setShowSmall(false);
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

{showRightSidebarMobile && isMobile && (
  <div
    className="fixed top-0 bottom-0 right-0"   
    style={{
      width: 'calc(100vw - 50px)',      
      backgroundColor: 'var(--color-bg)',
      padding: '1rem',
      overflow: 'auto',
      zIndex: 70,                             
      boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 10px', // opcional sombra para que se note que está encima
    }}
  >
    <SidebarDayView
      selectedDay={selectedDay}
      setSelectedDay={setSelectedDay}
      showRightSidebar={showRightSidebarMobile}
      isMobile={true}
      onClose={() => setShowRightSidebarMobile(false)}
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

      {/* Toggles sidebar desktop */}
      <DesktopSidebarToggles
        onToggleLeft={() => setShowLeftSidebar(v => !v)}
        onToggleRight={() => setShowRightSidebar(v => !v)}
      />

      {/* Controles inferiores móviles */}
      <MobileBottomControls
        showSmall={showSmall}
        setShowSmall={setShowSmall}
        onToggleLeft={() => setShowLeftSidebarMobile(v => !v)}
        onToggleRight={() => setShowRightSidebarMobile(true)}
      />
    </div>
  );
}
