import { useEffect, useState, useCallback, useMemo } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next'; 
import CircleLarge from '@components/Circles/CircleLarge/CircleLarge';
import CircleSmall from '@components/Circles/CircleSmall/CircleSmall';
import SidebarDayView from '@components/layout/Sidebars/SidebarDayView/SidebarDayView';
import CurvedSidebar from '@components/layout/Sidebars/CurvedSidebar/CurvedSidebar';
import ConfigButton from '@components/Preferences/ConfigButton';
import ConfigPanel from '@components/Preferences/ConfigPanel';
import ThemeToggle from '@components/Preferences/ThemeToggle';
import useIsMobile from '@hooks/useIsMobile';
import useSidebarLayout from '@hooks/useSidebarLayout';
import { useHomeLogic } from '@hooks/useHomeLogic';
import DesktopSidebarToggles from '@components/common/DesktopSidebarToggles';
import WithContextMenu from '@components/common/WithContextMenu';
import MobileBottomControls from '@components/common/MobileBottomControls';
import DragTrashZone from '@components/common/DragTrashZone'; 
import RightSidebarOverlay from '@components/common/RightSidebarOverlay';
import { useItems } from '@context/ItemsContext';
import { useAuth } from '@context/AuthContext';
import BottomToast from '@components/common/BottomToast';
import RefreshButton from '@components/common/RefreshButton';
import CircleSmallWithContextMenu from '@components/common/CircleSmallWithContextMenu';
import { useNotes } from '@context/NotesContext';
import LocalUserIndicator from '@components/common/LocalUserIndicator';
import LocalMigrationHandler from '@components/common/LocalMigrationHandler';
import '@styles/pages/Home.css';

export default function Home() {
  const { t } = useTranslation();
  const { deleteItem, itemsByDate, loading: itemsLoading, error: itemsError, refreshItems, syncStatus, isRetrying, retryCount, setItemsByDate } = useItems();
  const { user, loading: authLoading, token } = useAuth();
  const { selectedDay, setSelectedDay } = useNotes();

  const [isOverTrash, setIsOverTrash] = useState(false);
  const [circleLargeSize, setCircleLargeSize] = useState(660); // Tamaño actual del CircleLarge
  const [currentTouchPos, setCurrentTouchPos] = useState(null); // Posición actual del touch/mouse
  const [itemToDelete, setItemToDelete] = useState(null); // Item pendiente de eliminación en mobile

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

  // Memoizar items para el día seleccionado
  const itemsForSelectedDay = useMemo(() =>
    dateKey ? combinedItemsByDate[dateKey] || [] : [],
    [dateKey, combinedItemsByDate]
  );

  // Memoizar función de detección de zona de papelera
  const isOverTrashZone = useCallback((pos) => {
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
  }, [isMobile]);

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
      // Delay para que currentTouchPos esté disponible cuando se procese el drop
      setTimeout(() => {
        setCurrentTouchPos(null);
      }, 150);
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

  // Memoizar handler de selección de item
  const handleSelectItemLocal = useCallback(async (item) => {
    if (!dateKey) {
      setToast(t('alerts.selectDayFirst'));
      return;
    }
    await handleSelectItem(item, dateKey);
  }, [dateKey, handleSelectItem, t, setToast]);

  // Memoizar handler de eliminación de item
  const handleDeleteItem = useCallback(async (itemId) => {
    // En mobile, mostrar modal de confirmación
    if (isMobile) {
      setItemToDelete(itemId);
      return;
    }

    // En desktop, eliminar directamente sin toast
    try {
      await deleteItem(itemId);
    } catch (error) {
      setToast(t('alerts.itemDeleteError'));
    }
  }, [deleteItem, t, setToast, isMobile]);

  // Confirmar eliminación (usado por el modal en mobile)
  const confirmDeleteItem = useCallback(async () => {
    if (!itemToDelete) return;

    try {
      await deleteItem(itemToDelete);
      setItemToDelete(null);
    } catch (error) {
      setToast(t('alerts.itemDeleteError'));
      setItemToDelete(null);
    }
  }, [itemToDelete, deleteItem, t, setToast]);

  // Cancelar eliminación
  const cancelDeleteItem = useCallback(() => {
    setItemToDelete(null);
  }, []);

  // ----- Prevent Scroll by Keyboard -----
  useEffect(() => {
    function blockScrollKeys(e) {
      // Bloquear flechas, space, PageUp/PageDown, Home/End
      const keys = [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'PageUp', 'PageDown', 'Home', 'End', ' ' // space
      ];
      if (keys.includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
    window.addEventListener('keydown', blockScrollKeys, { passive: false });
    return () => window.removeEventListener('keydown', blockScrollKeys);
  }, []);

  return (
    <div
      className="home-page pt-3 sm:pt-0 w-screen min-h-[100dvh] flex items-center justify-center relative"
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
        className="home-desktop-topbar hidden sm:flex gap-2 items-center"
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
                { label: (<span>{t('sidebar.hide')}</span>), onClick: () => setIsLeftSidebarPinned(false) }
              ]}
            >
              <div
                className="hidden sm:block home-left-sidebar-fixed"
                onMouseDownCapture={onLeftSidebarMouseDown}
                style={{
                  left: leftSidebarPos.x ?? 12,
                  top: (leftSidebarPos.y ?? (window.innerHeight - 450) / 2),
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
            className="home-toggle-small hidden sm:flex"
            style={{
              left: `calc(50% + ${(circleLargeSize / 2 - 20)}px + 35px)`,
            }}
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
            className="home-circlesmall-fixed"
            onMouseDownCapture={onCircleSmallMouseDown}
            onDoubleClick={onCircleSmallDoubleClick}
            style={{
              left: circleSmallPos.x,
              top: circleSmallPos.y,
              width: smallSize,
              height: smallSize,
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
              extraOptions={[{ label: (<span>{t('sidebar.hide')}</span>), onClick: () => setIsRightSidebarPinned(false) }]}
            >
              <div className="hidden sm:block home-right-sidebar-panel">
                <SidebarDayView
                  selectedDay={selectedDay}
                  setSelectedDay={setSelectedDay}
                  showRightSidebar={true}
                  isRightSidebarPinned={isRightSidebarPinned}
                />
              </div>
            </WithContextMenu>
          ) : (
            // Sidebar derecho con hover nativo (sin menú contextual)
            <div
              className="hidden sm:block home-right-sidebar-fixed"
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

      {/* Modal de confirmación para eliminar item en mobile */}
      {itemToDelete && isMobile && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-[10000]"
          onClick={cancelDeleteItem}
        >
          <div
            className="bg-[var(--color-bg)] rounded-lg p-6 max-w-md mx-4 border border-[var(--color-text-secondary)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-3 text-[var(--color-text-primary)]">
              {t('alerts.confirmDelete')}
            </h3>
            <p className="text-sm text-[var(--color-muted)] mb-4">
              {t('alerts.confirmDeleteMessage')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDeleteItem}
                className="flex-1 px-4 py-2 rounded-md bg-[var(--color-neutral)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-2)] transition-colors border border-[var(--color-neutral-dark)]"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmDeleteItem}
                className="flex-1 px-4 py-2 rounded-md bg-[var(--color-neutral-darker)] text-white hover:opacity-90 transition-opacity"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    );
}
