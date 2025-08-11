import { useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { DateTime } from 'luxon'; 
import CircleLarge from '../components/Circles/CircleLarge/CircleLarge';
import SidebarDayView from '../components/layout/Sidebars/SidebarDayView/SidebarDayView';
import CurvedSidebar from '../components/layout/Sidebars/CurvedSidebar/CurvedSidebar';
import ConfigButton from '../components/Preferences/ConfigButton';
import ConfigPanel from '../components/Preferences/ConfigPanel';
import ThemeToggle from '../components/Preferences/ThemeToggle';
import useIsMobile from '../hooks/useIsMobile';
import useSidebarLayout from '../hooks/useSidebarLayout';
import { useHomeLogic } from '../hooks/useHomeLogic';
import DesktopSidebarToggles from '../components/common/DesktopSidebarToggles';
import MobileBottomControls from '../components/common/MobileBottomControls';
import DragTrashZone from '../components/common/DragTrashZone'; 
import RightSidebarOverlay from '../components/common/RightSidebarOverlay';
import { useItems } from '../context/ItemsContext';
import { useNotes } from '../context/NotesContext';

export default function Home() {
  const { deleteItem } = useItems();
  const { selectedDay, setSelectedDay } = useNotes();
  const {
    showRightSidebar,
    setShowRightSidebar,
    showLeftSidebar,
    setShowLeftSidebar,
    showConfig,
    setShowConfig,
    isRightSidebarPinned,
    setIsRightSidebarPinned,
    isLeftSidebarPinned,
    setIsLeftSidebarPinned,
    draggedItem,
    setDraggedItem,
    isOverTrash,
    setIsOverTrash,
    displayOptions,
    setDisplayOptions,
    handleSelectItem,
    itemsByDate,
    setItemsByDate,
  } = useHomeLogic();

  const isMobile = useIsMobile();
  const {
    showSmall,
    setShowSmall,
    showLeftSidebarMobile,
    setShowLeftSidebarMobile,
    showRightSidebarMobile,
    setShowRightSidebarMobile,
    leftSidebarMobileWrapperStyle,
  } = useSidebarLayout(selectedDay, isMobile);

  const dateKey = selectedDay ? DateTime.fromObject(selectedDay).toISODate() : null;
  const itemsForSelectedDay = dateKey ? itemsByDate[dateKey] || [] : [];


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

  async function handleSelectItemLocal(item) {
    if (!dateKey) {
      alert('Seleccioná un día primero');
      return;
    }
    await handleSelectItem(item, dateKey);
  }

  useEffect(() => {
    if (selectedDay && !isMobile) setShowLeftSidebar(true);
  }, [selectedDay, isMobile]);

  return (
    <div
      className="scroll-hidden pt-3 sm:pt-0 w-screen min-h-[100dvh] flex items-center justify-center relative"
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
        transition: 'var(--transition-colors)',
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
                zIndex: 'var(--z-high)',
                position: 'fixed',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg)',
                transition: 'var(--transition-all)',
              }}
            >
                             <CurvedSidebar showConfig={showConfig} onSelectItem={handleSelectItemLocal} isLeftSidebarPinned={true} />
            </div>
          ) : (
            <div
              className="hidden sm:block opacity-0 hover:opacity-100 transition-opacity duration-200 ease-in-out"
              style={{
                pointerEvents: 'auto',
                position: 'fixed',
                top: 'var(--navbar-top-offset)', 
                left: 0,
                height: `calc(100vh - var(--navbar-top-offset))`, 
                width: 'var(--sidebar-hover-strip-width)',
                zIndex: 'var(--z-overlay)',
                backgroundColor: 'transparent',
              }}
            >
                             <div
                 style={{
                   position: 'absolute',
                   top: 0,
                   right: 0,
                   height: '100vh',
                   width: 'var(--sidebar-width)',
                   border: 'none',
                   borderRadius: '8px',
                   backgroundColor: 'var(--color-bg)',
                   transition: 'var(--transition-all)',
                 }}
               >
                                 <CurvedSidebar showConfig={showConfig} onSelectItem={handleSelectItemLocal} />
              </div>
            </div>
          )}
        </>
      )}

      {/* Sidebar izquierdo móvil */}
      {showLeftSidebarMobile && isMobile && (
        <div className={`fixed left-0 right-0 z-40`} style={leftSidebarMobileWrapperStyle}>
                     <CurvedSidebar showConfig={showConfig} isMobile={true} onSelectItem={handleSelectItemLocal} />
        </div>
      )}

      {/* Contenido principal */}
      <div
        className="relative flex items-center justify-center px-4 sm:px-0"
        style={{
          borderRadius: '12px',
          backgroundColor: 'var(--color-bg)',
          transition: 'var(--transition-all)',
          width: isMobile ? '100vw' : 'auto',
        }}
      >
        <CircleLarge
          showSmall={showSmall}
          displayOptions={displayOptions}
          selectedDay={selectedDay}
          onItemDrag={(itemId, pos) => setDraggedItem({ id: itemId, ...pos })}
          onItemDrop={async () => {
            if (draggedItem && isOverTrash) {
              setItemsByDate(prev => {
                if (!dateKey) return prev;
                const filtered = (prev[dateKey] || []).filter(i => i.id !== draggedItem.id);
                return { ...prev, [dateKey]: filtered };
              });
              // Si el id es numérico, también borrar en backend
              const numericId = Number(draggedItem.id);
              if (Number.isFinite(numericId)) {
                try { await deleteItem(numericId); } catch {}
              }
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
              transition: 'var(--transition-normal)',
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
                  transition: 'var(--transition-all)',
                }}
              />
            </div>
          ) : (
            // Hover en borde derecho para mostrar sidebar
            <div
              className="hidden sm:block opacity-0 hover:opacity-100 transition-opacity duration-200 ease-in-out"
              style={{
                position: 'fixed',
                top: 'var(--navbar-top-offset)',
                right: 0,
                height: `calc(100vh - var(--navbar-top-offset))`, 
                width: 'var(--sidebar-hover-strip-width)',
                zIndex: 'var(--z-overlay)',
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
                   width: 'var(--sidebar-width)',
                   border: 'none',
                   borderRadius: '8px',
                   backgroundColor: 'var(--color-bg)',
                   transition: 'var(--transition-all)',
                   zIndex: 'var(--z-high)',
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
              className="fixed right-0 top-[50vh] transform -translate-y-1/2 z-10 hidden sm:flex cursor-pointer items-center justify-center w-8 h-8 text-gray-300"
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
        <RightSidebarOverlay>
          <SidebarDayView
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            showRightSidebar={showRightSidebarMobile}
            isMobile={true}
            onClose={() => setShowRightSidebarMobile(false)}
            setShowSmall={setShowSmall}
          />
        </RightSidebarOverlay>
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

    </div>
  );
}
