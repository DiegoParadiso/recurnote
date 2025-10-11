import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next'; 
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
import WithContextMenu from '../components/common/WithContextMenu';
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
  const { t } = useTranslation();
  const { deleteItem, itemsByDate, loading: itemsLoading, error: itemsError, refreshItems, syncStatus, isRetrying, retryCount, setItemsByDate } = useItems();
  const { user, loading: authLoading, token } = useAuth();
  const { selectedDay, setSelectedDay } = useNotes();

  const [isOverTrash, setIsOverTrash] = useState(false);
  const [circleLargeSize, setCircleLargeSize] = useState(660); // Tamaño actual del CircleLarge
  const [currentTouchPos, setCurrentTouchPos] = useState(null); // Posición actual del touch/mouse

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
    leftSidebarPos,
    onLeftSidebarMouseDown,
    startLeftSidebarDrag,
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
    itemsByDate: combinedItemsByDate, 
    errorToast,
    setErrorToast,
  } = useHomeLogic();

  const safeSetItemsByDate = setItemsByDate;

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
  const itemsForSelectedDay = dateKey ? combinedItemsByDate[dateKey] || [] : [];

  function isOverTrashZone(pos) {
    if (!pos) return false;
    
    // Ajustar zona de papelera para móvil
    const trashX = 0;
    const trashY = 5; 
    const trashWidth = isMobile ? 100 : 80; // Zona más grande en móvil
    const trashHeight = isMobile ? 100 : 80;

    return (
      pos.x >= trashX &&
      pos.x <= trashX + trashWidth &&
      pos.y >= trashY &&
      pos.y <= trashY + trashHeight
    );
  }

  // Detectar posición del touch/mouse en tiempo real durante el drag
  useEffect(() => {
    if (!draggedItem || !isMobile) return;

    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        const pos = { x: touch.clientX, y: touch.clientY };
        setCurrentTouchPos(pos);
        setIsOverTrash(isOverTrashZone(pos));
      }
    };

    const handleMouseMove = (e) => {
      const pos = { x: e.clientX, y: e.clientY };
      setCurrentTouchPos(pos);
      setIsOverTrash(isOverTrashZone(pos));
    };

    const handleEnd = () => {
      setCurrentTouchPos(null);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('mouseup', handleEnd);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('mouseup', handleEnd);
    };
  }, [draggedItem, isMobile]);



  // Cargar posición del CircleSmall cuando se muestre en desktop
  useEffect(() => {
    if (!isMobile && showSmall && (!circleSmallPos.x || !circleSmallPos.y)) {
      recenterCircleSmall();
    }
  }, [isMobile, showSmall, circleSmallPos.x, circleSmallPos.y, recenterCircleSmall]);

  async function handleSelectItemLocal(item) {
    if (!dateKey) {
      setToast(t('alerts.selectDayFirst'));
      return;
    }
    await handleSelectItem(item, dateKey);
  }

  async function handleDeleteItem(itemId) {
    try {
      // Usar solo setItemsByDate del ItemsContext
      await deleteItem(itemId);
      setToast(t('alerts.itemDeleted'));
    } catch (error) {
      setToast(t('alerts.itemDeleteError'));
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
            <WithContextMenu
              extraOptions={[
                { label: (<span>Ocultar Sidebar</span>), onClick: () => setIsLeftSidebarPinned(false) }
              ]}
            >
              <div
                className="hidden sm:block"
                onMouseDownCapture={onLeftSidebarMouseDown}
                style={{
                  position: 'fixed',
                  left: leftSidebarPos.x ?? 12,
                  top: (leftSidebarPos.y ?? (window.innerHeight - 450) / 2),
                  zIndex: 'var(--z-modal)',
                  cursor: 'grab',
                }}
              >
                <CurvedSidebar 
                  showConfig={showConfig} 
                  onSelectItem={handleSelectItemLocal}
                  isLeftSidebarPinned={true}
                />
              </div>
            </WithContextMenu>
          ) : (
            <CurvedSidebar 
              showConfig={showConfig} 
              onSelectItem={handleSelectItemLocal}
              onHover={handleLeftSidebarHover}
              isLeftSidebarPinned={false}
              onStartDrag={(e) => {
                // Iniciar drag usando la posición real del panel (startLeftSidebarDrag se encarga de fijar y leer el rect)
                startLeftSidebarDrag(e);
              }}
            />
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

      {/* Contenido principal */}
      <div
        className="relative flex items-center justify-center px-4 sm:px-0 circle-large-wrapper"
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
          onCircleSizeChange={setCircleLargeSize}
          onItemDrag={(itemId, pos) => {
            if (pos && pos.action === 'drop') {
              // Verificar si está sobre la papelera en el momento del drop
              // En mobile, usar currentTouchPos para detectar la posición final
              const finalIsOverTrash = isMobile && currentTouchPos
                ? isOverTrashZone(currentTouchPos)
                : isOverTrash;

              if (finalIsOverTrash) {
                handleDeleteItem(itemId);
              }

              // Limpiar estados después de verificar
              setDraggedItem(null);
              setIsOverTrash(false);
              setCurrentTouchPos(null);
            } else if (pos && pos.x !== undefined && pos.y !== undefined) {
              const newDraggedItem = { id: itemId, ...pos };
              setDraggedItem(newDraggedItem);
            }
          }}
          setSelectedDay={day => {
            setSelectedDay(day);
            if (isMobile) setShowSmall(false);
          }}
          items={itemsForSelectedDay}
          setItems={newItemsForDay => {
            if (!dateKey) return;

          }}
          setLocalItemsByDate={safeSetItemsByDate}
        />

        {/* Botón toggle mostrar pequeño (solo desktop) */}
        {!isMobile && (
          <button
            onClick={() => setShowSmall(!showSmall)}
            aria-label="Toggle mostrar pequeño"
            className="absolute top-1/2 transform -translate-y-1/2 z-10 hidden sm:flex"
            style={{
              left: `calc(50% + ${(circleLargeSize / 2 - 20)}px + 35px)`, // Centrado + radio del círculo + margen reducido
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
            <WithContextMenu
              extraOptions={[{ label: (<span>Ocultar Sidebar</span>), onClick: () => setIsRightSidebarPinned(false) }]}
            >
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
            </WithContextMenu>
          ) : (
            // Sidebar derecho con hover nativo (sin menú contextual)
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
            
            if (draggedItem && isOverTrash) {
              try {
                // Si el id es numérico, borrar en backend
                const numericId = Number(draggedItem.id);
                if (Number.isFinite(numericId)) {
                  await deleteItem(numericId);
                }
                
                setToast(t('alerts.itemDeleted'));
                              } catch (error) {
                  setToast(t('alerts.itemDeleteError'));
                }
            } else {
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
        
        {/* BottomToast para errores */}
        <BottomToast message={errorToast} onClose={() => setErrorToast('')} duration={5000} />
      </div>
    );
}
