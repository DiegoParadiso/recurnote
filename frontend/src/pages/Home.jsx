import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { DateTime } from 'luxon'; 
import CircleLarge from '../components/Circles/CircleLarge/CircleLarge';
import SidebarDayView from '../components/Sidebars/SidebarDayView/SidebarDayView';
import CurvedSidebar from '../components/Sidebars/CurvedSidebar/CurvedSidebar';
import ConfigButton from '../components/Preferences/ConfigButton';
import ConfigPanel from '../components/Preferences/ConfigPanel';
import ThemeToggle from '../components/Preferences/ThemeToggle';
import useIsMobile from '../hooks/useIsMobile';
import DesktopSidebarToggles from '../components/common/DesktopSidebarToggles';
import MobileBottomControls from '../components/common/MobileBottomControls';

import DragTrashZone from '../components/common/DragTrashZone'; 

import { useItems } from '../context/ItemsContext';
import { useNotes } from '../context/NotesContext';

export default function Home() {
  
  const { itemsByDate, setItemsByDate, addItem } = useItems();
  const { selectedDay, setSelectedDay } = useNotes();

  const [showSmall, setShowSmall] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showLeftSidebarMobile, setShowLeftSidebarMobile] = useState(false);
  const [showRightSidebarMobile, setShowRightSidebarMobile] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const [isRightSidebarPinned, setIsRightSidebarPinned] = useState(false);
  const [isLeftSidebarPinned, setIsLeftSidebarPinned] = useState(false);

  const isMobile = useIsMobile();
  const [draggedItem, setDraggedItem] = useState(null); 
  const [isOverTrash, setIsOverTrash] = useState(false);

  const dateKey = selectedDay ? DateTime.fromObject(selectedDay).toISODate() : null;

  const itemsForSelectedDay = dateKey ? itemsByDate[dateKey] || [] : [];

    const [displayOptions, setDisplayOptions] = useState({
      year: true,
      month: true,
      week: false,
      weekday: true,
      day: true,
      time: false,
      timeZone: 'America/Argentina/Buenos_Aires',
      timeFormat: '24h'
    });


  function isOverTrashZone(pos) {
    if (!pos) return false;
    const trashX = 0;
    const trashY = 5; 
    const trashWidth = 80; 
    const trashHeight = 80;

    return (
      pos.x >= trashX &&
      pos.x <= trashX + trashWidth &&
      pos.y >= trashY &&
      pos.y <= trashY + trashHeight
    );
  }

  useEffect(() => {
    setIsOverTrash(isOverTrashZone(draggedItem));
  }, [draggedItem]);

  async function handleSelectItem(item) {
    if (!dateKey) {
      alert('Seleccioná un día primero');
      return;
    }

    // posición por defecto: aleatoria en anillo medio
    const angle = Math.random() * 360;
    const distance = 120;
    const rad = (angle * Math.PI) / 180;
    const x = distance * Math.cos(rad);
    const y = distance * Math.sin(rad);

    const newItem = {
      label: item.label,
      angle,
      distance,
      content: item.label === 'Tarea' ? [''] : '',
      ...(item.label === 'Tarea' && { checked: [false] }),
      width: item.label === 'Tarea' ? 200 : 100,
      height: item.label === 'Tarea' ? 150 : 100,
    };

    // Persistencia (ItemsContext hará el setItemsByDate con el id real)
    try {
      await addItem({
        date: dateKey,
        x,
        y,
        rotation: 0,
        rotation_enabled: true,
        ...newItem,
      });
    } catch {}
  }

  useEffect(() => {
    if (!selectedDay) {
      setShowSmall(true);
    } else {
      if (isMobile) {
        setShowLeftSidebarMobile(true); 
      } else {
        setShowLeftSidebar(true); 
      }
    }
  }, [selectedDay, isMobile]);

  return (
    <div
      className="scroll-hidden pt-3 sm:pt-0 w-screen min-h-[100dvh] flex items-center justify-center relative"
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      {/* Botones Config móvil - OCULTO SI draggedItem y SOLO en MOBILE */}
      {isMobile && !draggedItem && (
        <>
          <div
            className="fixed top-3 left-3 z-[30] sm:hidden"
            aria-label="Mostrar configuración móvil"
          >
            <ConfigButton onToggle={() => setShowConfig(v => !v)} />
          </div>
          <div
            className="fixed top-3 right-3 z-[30] sm:hidden"
            aria-label="Toggle tema oscuro móvil"
          >
            <ThemeToggle />
          </div>
        </>
      )}

      {/* Botones Config y Tema desktop */}
      <div
        className="fixed top-3 left-3 z-[20] hidden sm:flex gap-3 items-center"
      >
        <ConfigButton onToggle={() => setShowConfig(v => !v)} />
        <ThemeToggle />
      </div>
      
      {!isMobile && (
        <>
          {isLeftSidebarPinned ? (
            // Fijado permanentemente lado izquierdo
            <div
              className="hidden sm:block"
              style={{
                zIndex: 30,
                position: 'fixed',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg)',
                transition: 'all 0.3s ease',
              }}
            >
              <CurvedSidebar showConfig={showConfig} onSelectItem={handleSelectItem} isLeftSidebarPinned={true} />
            </div>
          ) : (
            <div
              className="hidden sm:block opacity-0 hover:opacity-100 transition-opacity duration-200 ease-in-out"
              style={{
                pointerEvents: 'auto',
                position: 'fixed',
                top: '60px', 
                left: 0,
                height: 'calc(100vh - 60px)', 
                width: '60px',
                zIndex: 40,
                backgroundColor: 'transparent',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  height: '100vh',
                  width: '260px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-bg)',
                  transition: 'all 0.3s ease',
                }}
              >
                <CurvedSidebar showConfig={showConfig} onSelectItem={handleSelectItem} />
              </div>
            </div>
          )}
        </>
      )}

      {/* Sidebar izquierdo móvil */}
      {showLeftSidebarMobile && isMobile && (
        <div className="fixed left-0 right-0 bottom-[64px] z-40">
          <CurvedSidebar showConfig={showConfig} isMobile={true} onSelectItem={handleSelectItem} />
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
          displayOptions={displayOptions}
          selectedDay={selectedDay}
          onItemDrag={(itemId, pos) => setDraggedItem({ id: itemId, ...pos })}
          onItemDrop={() => {
            if (draggedItem && isOverTrash) {
              setItemsByDate(prev => {
                if (!dateKey) return prev;
                const filtered = (prev[dateKey] || []).filter(i => i.id !== draggedItem.id);
                return { ...prev, [dateKey]: filtered };
              });
            }
            setDraggedItem(null);
            setIsOverTrash(false);
          }}
          setSelectedDay={day => {
            setSelectedDay(day);
            if (isMobile) setShowSmall(false);
          }}
          items={itemsForSelectedDay}
          setItems={newItemsForDay => {
            if (!dateKey) return;
            setItemsByDate(prev => ({ ...prev, [dateKey]: newItemsForDay }));
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

      {!isMobile && (
        <>
          {isRightSidebarPinned ? (
            // Fijado siempre visible lado derecho
            <div className="hidden sm:block">
              <SidebarDayView
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                showRightSidebar={true}
                isRightSidebarPinned={isRightSidebarPinned}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-text-secondary)',
                  transition: 'all 0.3s ease',
                }}
              />
            </div>
          ) : (
            // Hover en borde derecho para mostrar sidebar
            <div
              className="hidden sm:block opacity-0 hover:opacity-100 transition-opacity duration-200 ease-in-out"
              style={{
                position: 'fixed',
                top: '60px',
                right: 0,
                height: 'calc(100vh - 60px)', 
                width: '60px',
                zIndex: 40,
                backgroundColor: 'transparent',
                pointerEvents: 'auto',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  height: '100vh',
                  width: '260px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-bg)',
                  transition: 'all 0.3s ease',
                  zIndex: 30,
                }}
              >
                <SidebarDayView
                  selectedDay={selectedDay}
                  setSelectedDay={setSelectedDay}
                  showRightSidebar={showRightSidebar}
                  isRightSidebarPinned={false}
                  isMobile={isMobile}
                />
              </div>
            </div>
          )}

          {/* Toggle derecho - fuera del contenedor hover para que desaparezca al hacer hover en sidebar */}
          {!isRightSidebarPinned && (
            <button
              onClick={() => setShowRightSidebar(v => !v)}
              aria-label="Toggle right sidebar"
              className="fixed right-0 top-[50vh] transform -translate-y-1/2 z-10 hidden sm:flex cursor-pointer flex items-center justify-center w-8 h-8 text-gray-300"
              style={{
                background: 'transparent',
                border: 'none',
                animation: 'slideLeftRight 2s ease-in-out infinite',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </>
      )}

      {/* Sidebar derecho móvil */}
      {showRightSidebarMobile && isMobile && (
        <div
          className="fixed top-0 bottom-0 right-0"
          style={{
            width: 'calc(100vw - 50px)',
            backgroundColor: 'var(--color-bg)',
            padding: '1rem',
            overflow: 'auto',
            zIndex: 70,
          }}
        >
          <SidebarDayView
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            showRightSidebar={showRightSidebarMobile}
            isMobile={true}
            onClose={() => setShowRightSidebarMobile(false)}
            setShowSmall={setShowSmall}
          />
        </div>
      )}

      {/* Panel de configuración */}
      <ConfigPanel
        show={showConfig}
        onClose={() => setShowConfig(false)}
        showSmall={showSmall}
        setShowSmall={setShowSmall}
        isLeftSidebarPinned={isLeftSidebarPinned}
        setIsLeftSidebarPinned={setIsLeftSidebarPinned}
        isRightSidebarPinned={isRightSidebarPinned}
        setIsRightSidebarPinned={setIsRightSidebarPinned}
        displayOptions={displayOptions}
        setDisplayOptions={setDisplayOptions}
      />

      {/* Papelera DragTrashZone SOLO en mobile y si hay draggedItem */}
      {isMobile && (
        <DragTrashZone isActive={!!draggedItem} isOverTrash={isOverTrash} />
      )}

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

      {/* Keyframes para animaciones (si no están ya definidos en CSS global) */}
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
