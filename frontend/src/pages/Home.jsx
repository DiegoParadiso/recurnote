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
  
  const { itemsByDate, setItemsByDate } = useItems();
  const { selectedDay, setSelectedDay } = useNotes();

  const [showSmall, setShowSmall] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showLeftSidebarMobile, setShowLeftSidebarMobile] = useState(false);
  const [showRightSidebarMobile, setShowRightSidebarMobile] = useState(false);

  const isMobile = useIsMobile();
  const [draggedItem, setDraggedItem] = useState(null); 
  const [isOverTrash, setIsOverTrash] = useState(false);

  // Obtener items para el día seleccionado
  const dateKey = selectedDay ? DateTime.fromObject(selectedDay).toISODate() : null;

  const itemsForSelectedDay = dateKey ? itemsByDate[dateKey] || [] : [];
  
  // Función para determinar si la posición está sobre la papelera (zona arriba)
function isOverTrashZone(pos) {
  if (!pos) return false;
  const trashX = 0;      // esquina izquierda (coincide con left:0)
  const trashY = 5;      // mismo top que el div
  const trashWidth = 80; // igual al ancho del div
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

  function handleSelectItem(item) {
    if (!dateKey) {
      alert('Seleccioná un día primero');
      return;
    }

    const handleDeleteItemById = (id) => {
      if (!selectedDay) return;
      const dateKey = DateTime.fromObject(selectedDay).toISODate();
      setItemsByDate(prev => ({
        ...prev,
        [dateKey]: (prev[dateKey] || []).filter(item => item.id !== id),
      }));
    };

    const handleItemDrop = () => {
      if (draggedItem && isOverTrashZone(draggedItem)) {
        handleDeleteItemById(draggedItem.id);
      }
      setDraggedItem(null);
      setIsOverTrash(false);
    };

    const newItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      label: item.label,
      angle: Math.random() * 360,
      distance: 120,
      content: item.label === 'Tarea' ? [''] : '',
      ...(item.label === 'Tarea' && { checked: [false] }),
      width: item.label === 'Tarea' ? 200 : 100,
      height: item.label === 'Tarea' ? 150 : 100,
    };

    setItemsByDate(prev => {
      const prevItems = prev[dateKey] || [];
      return {
        ...prev,
        [dateKey]: [...prevItems, newItem],
      };
    });
  }
useEffect(() => {
  if (!selectedDay) {
    setShowSmall(true);
  }
}, [selectedDay]);
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
          <ConfigButton onToggle={() => setShowConfigPanel(v => !v)} />
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
          <CurvedSidebar showConfigPanel={showConfigPanel} onSelectItem={handleSelectItem} />
        </div>
      )}

      {/* Sidebar izquierdo móvil */}
      {showLeftSidebarMobile && isMobile && (
        <div className="fixed left-0 right-0 bottom-[64px] z-40">
          <CurvedSidebar showConfigPanel={showConfigPanel} isMobile={true} onSelectItem={handleSelectItem} />
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
        <div
          className="fixed top-0 bottom-0 right-0"
          style={{
            width: 'calc(100vw - 50px)',
            backgroundColor: 'var(--color-bg)',
            padding: '1rem',
            overflow: 'auto',
            zIndex: 70,
            boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 10px',
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
        show={showConfigPanel}
        onClose={() => setShowConfigPanel(false)}
        showSmall={showSmall}
        setShowSmall={setShowSmall}
        showRightSidebar={showRightSidebar}
        setShowRightSidebar={setShowRightSidebar}
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