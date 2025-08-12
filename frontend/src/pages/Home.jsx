import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { DateTime } from 'luxon'; 
import CircleLarge from '../components/Circles/CircleLarge/CircleLarge';
import CircleSmall from '../components/Circles/CircleSmall/CircleSmall';
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
import BottomToast from '../components/common/BottomToast';
import { useNotes } from '../context/NotesContext';

export default function Home() {
  const { deleteItem } = useItems();
  const { selectedDay, setSelectedDay } = useNotes();
  // Eliminar el estado local draggedItem para usar el de useHomeLogic
  // const [draggedItem, setDraggedItem] = useState(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  // Eliminar el estado local toast para usar el de useHomeLogic
  // const [toast, setToast] = useState('');
  
  // Variables faltantes restauradas
  const [itemsByDate, setItemsByDate] = useState({});
  
  // Estados para controlar visibilidad de sidebars por hover
  const [showLeftSidebarHover, setShowLeftSidebarHover] = useState(false);
  const [showRightSidebarHover, setShowRightSidebarHover] = useState(false);

  // Handlers para controlar visibilidad por hover
  const handleLeftSidebarHover = (isHovering) => {
    if (!isLeftSidebarPinned) {
      setShowLeftSidebarHover(isHovering);
    }
  };

  const handleRightSidebarHover = (isHovering) => {
    if (!isRightSidebarPinned) {
      setShowRightSidebarHover(isHovering);
    }
  };

  const {
    circleSmallPos,
    smallSize,
    onCircleSmallMouseDown,
    onCircleSmallDoubleClick,
    recenterCircleSmall,
    displayOptions,
    setDisplayOptions,
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
    handleSelectItem,
    setToast,
    toast,
    addItem,
    draggedItem,
    setDraggedItem,
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

  // Recentrar CircleSmall en desktop cuando se muestra o cambia el layout relevante
  useEffect(() => {
    if (!isMobile && showSmall) {
      recenterCircleSmall();
    }
  }, [isMobile, showSmall, recenterCircleSmall]);

  async function handleSelectItemLocal(item) {
    if (!dateKey) {
      setToast('Para agregar un item, primero selecciona un día en el calendario');
      return;
    }
    await handleSelectItem(item, dateKey);
  }

  async function handleDeleteItem(itemId) {
    try {
      await deleteItem(itemId);
      setToast('Item eliminado correctamente');
    } catch (error) {
      console.error('Error deleting item:', error);
      setToast('Error al eliminar el item');
    }
  }

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
                zIndex: 'var(--z-modal)',
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
            // Sidebar izquierdo con hover nativo
            <div
              className="hidden sm:block"
              style={{
                position: 'fixed',
                top: 'var(--navbar-top-offset)', 
                left: 0,
                height: `calc(100vh - var(--navbar-top-offset))`, 
                zIndex: 'var(--z-modal)',
              }}
            >
              <CurvedSidebar 
                showConfig={showConfig} 
                onSelectItem={handleSelectItemLocal}
                onHover={handleLeftSidebarHover}
              />
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
          onItemDrag={(itemId, pos) => {
            const newDraggedItem = { id: itemId, ...pos };
            setDraggedItem(newDraggedItem);
          }}
          onItemDrop={async () => {
            // Solo procesar si realmente hay un item arrastrado y está sobre la papelera
            if (draggedItem && isOverTrash) {
              try {
                // Eliminar del estado local
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
                
                setToast('Item eliminado correctamente');
              } catch (error) {
                console.error('Error deleting item:', error);
                setToast('Error al eliminar el item');
              }
            }
            
            // SIEMPRE limpiar estados cuando se suelta un item
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

      {/* CircleSmall draggable global en Desktop */}
      {!isMobile && showSmall && circleSmallPos.x != null && circleSmallPos.y != null && (
        <div
          className="fixed"
          onMouseDownCapture={onCircleSmallMouseDown}
          onDoubleClick={onCircleSmallDoubleClick}
          style={{
            zIndex: 'var(--z-high)',
            cursor: 'grab',
            left: circleSmallPos.x,
            top: circleSmallPos.y,
            width: smallSize,
            height: smallSize,
            borderRadius: '50%',
            pointerEvents: 'auto',
          }}
        >
          <CircleSmall
            onDayClick={setSelectedDay}
            isSmallScreen={false}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            size={smallSize}
          />
        </div>
      )}

      {!isMobile && (
        <>
          {isRightSidebarPinned ? (
            // Fijado siempre visible lado derecho
            <div className="hidden sm:block" style={{ zIndex: 'var(--z-modal)' }}>
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
            // Sidebar derecho con hover nativo
            <div
              className="hidden sm:block"
              style={{
                position: 'fixed',
                top: 'var(--navbar-top-offset)',
                right: 0,
                height: `calc(100vh - var(--navbar-top-offset))`, 
                zIndex: 'var(--z-modal)',
              }}
            >
              <SidebarDayView
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                showRightSidebar={showRightSidebar}
                isRightSidebarPinned={false}
                isMobile={isMobile}
                onHover={handleRightSidebarHover}
              />
            </div>
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

      {/* Desktop Sidebar Toggles - Pegados a los bordes */}
      {!isMobile && (
        <DesktopSidebarToggles
          onToggleLeft={() => setIsLeftSidebarPinned(prev => !prev)}
          onToggleRight={() => setIsRightSidebarPinned(prev => !prev)}
          isLeftSidebarPinned={isLeftSidebarPinned}
          isRightSidebarPinned={isRightSidebarPinned}
        />
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
        <DragTrashZone 
          isActive={!!draggedItem} 
          isOverTrash={isOverTrash}
          onItemDrop={async () => {
            console.log('DragTrashZone onItemDrop ejecutado', { draggedItem, isOverTrash, dateKey });
            
            if (draggedItem && isOverTrash) {
              try {
                // Buscar el item en todas las fechas si no hay dateKey
                if (!dateKey) {
                  console.log('No hay dateKey, buscando item en todas las fechas');
                  setItemsByDate(prev => {
                    const newState = { ...prev };
                    let itemFound = false;
                    
                    // Buscar en todas las fechas
                    Object.keys(newState).forEach(date => {
                      const items = newState[date] || [];
                      const itemIndex = items.findIndex(i => i.id === draggedItem.id);
                      if (itemIndex !== -1) {
                        newState[date] = items.filter(i => i.id !== draggedItem.id);
                        itemFound = true;
                        console.log(`Item eliminado de la fecha: ${date}`);
                      }
                    });
                    
                    if (!itemFound) {
                      console.log('Item no encontrado en ninguna fecha');
                    }
                    
                    return newState;
                  });
                } else {
                  // Eliminar del estado local usando dateKey
                  console.log(`Eliminando item de la fecha: ${dateKey}`);
                  setItemsByDate(prev => {
                    const filtered = (prev[dateKey] || []).filter(i => i.id !== draggedItem.id);
                    return { ...prev, [dateKey]: filtered };
                  });
                }
                
                // Si el id es numérico, también borrar en backend
                const numericId = Number(draggedItem.id);
                if (Number.isFinite(numericId)) {
                  console.log(`Eliminando item del backend con ID: ${numericId}`);
                  await deleteItem(numericId);
                }
                
                setToast('Item eliminado correctamente');
                console.log('Item eliminado exitosamente');
              } catch (error) {
                console.error('Error deleting item:', error);
                setToast('Error al eliminar el item');
              }
            } else {
              console.log('Condiciones no cumplidas para eliminar:', { draggedItem, isOverTrash });
            }
            
            // SIEMPRE limpiar estados cuando se suelta un item
            setDraggedItem(null);
            setIsOverTrash(false);
          }}
          draggedItem={draggedItem}
        />
      )}

      {/* Controles inferiores móviles */}
      <MobileBottomControls
        showSmall={showSmall}
        setShowSmall={setShowSmall}
        showLeftSidebarMobile={showLeftSidebarMobile}
        setShowLeftSidebarMobile={setShowLeftSidebarMobile}
        showRightSidebarMobile={showRightSidebarMobile}
        setShowRightSidebarMobile={setShowRightSidebarMobile}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        isMobile={isMobile}
      />

      {/* BottomToast global */}
      <BottomToast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
