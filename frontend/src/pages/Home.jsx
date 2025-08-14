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
import { useAuth } from '../context/AuthContext';
import BottomToast from '../components/common/BottomToast';
import RefreshButton from '../components/common/RefreshButton';
import CircleSmallWithContextMenu from '../components/common/CircleSmallWithContextMenu';
import { useNotes } from '../context/NotesContext';
import LocalUserIndicator from '../components/common/LocalUserIndicator';
import LocalMigrationHandler from '../components/common/LocalMigrationHandler';

export default function Home() {
  const { deleteItem, itemsByDate, loading: itemsLoading, error: itemsError, refreshItems, syncStatus, isRetrying, retryCount } = useItems();
  const { user, loading: authLoading } = useAuth();
  const { selectedDay, setSelectedDay } = useNotes();

  const [isOverTrash, setIsOverTrash] = useState(false);


  const [showLeftSidebarHover, setShowLeftSidebarHover] = useState(false);
  const [showRightSidebarHover, setShowRightSidebarHover] = useState(false);

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
    resetCircleSmallToDefault,
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



  // Cargar posición del CircleSmall cuando se muestre en desktop
  useEffect(() => {
    if (!isMobile && showSmall && (!circleSmallPos.x || !circleSmallPos.y)) {
      recenterCircleSmall();
    }
  }, [isMobile, showSmall, circleSmallPos.x, circleSmallPos.y, recenterCircleSmall]);

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
        <div className="fixed top-3 left-0 right-0 z-[30] sm:hidden flex justify-between items-center px-4">
          <div className="w-10 h-10 flex items-center justify-center" aria-label="Mostrar configuración móvil">
            <ConfigButton onToggle={() => setShowConfig(v => !v)} />
          </div>
          <div className="w-10 h-10 flex items-center justify-center" aria-label="Recargar items">
            <RefreshButton 
              onClick={refreshItems}
              loading={syncStatus === 'syncing'}
            />
          </div>
          <div className="w-10 h-10 flex items-center justify-center" aria-label="Toggle tema oscuro móvil">
            <ThemeToggle />
          </div>
        </div>
      )}

      {/* Botones Config y Tema desktop */}
      <div
        className="fixed top-3 left-3 z-[20] hidden sm:flex gap-2 items-center"
      >
        <div className="w-10 h-10 flex items-center justify-center">
          <ConfigButton onToggle={() => setShowConfig(v => !v)} />
        </div>
        <div className="w-10 h-10 flex items-center justify-center">
          <ThemeToggle />
        </div>
        <div className="w-10 h-10 flex items-center justify-center">
          <RefreshButton 
            onClick={refreshItems}
            loading={syncStatus === 'syncing'}
            isDesktop={true}
          />
        </div>
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



      {/* Indicador de error para items con reintento automático */}
      {itemsError && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <div>
              <div>{itemsError}</div>
              {isRetrying && (
                <div className="text-sm text-red-600 mt-1">
                  Reintentando automáticamente... (intento {retryCount + 1}/5)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay items y no está cargando */}
      {!authLoading && !itemsLoading && !itemsError && Object.keys(itemsByDate).length === 0 && user && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <span className="mr-2">ℹ️</span>
            <span>No hay items creados aún. ¡Comienza agregando algunos!</span>
          </div>
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
          setSelectedDay={day => {
            setSelectedDay(day);
            if (isMobile) setShowSmall(false);
          }}
          items={itemsForSelectedDay}
          setItems={newItemsForDay => {
            if (!dateKey) return;

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
        <CircleSmallWithContextMenu
          onResetPosition={resetCircleSmallToDefault}
          onHide={() => setShowSmall(false)}
        >
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
        </CircleSmallWithContextMenu>
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
                // Si el id es numérico, borrar en backend
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

      {/* Indicador de usuario local */}
      <LocalUserIndicator showAccountIndicator={displayOptions.showAccountIndicator !== false} />
      
      {/* Handler de migración local */}
      <LocalMigrationHandler />

      {/* BottomToast global */}
      <BottomToast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
