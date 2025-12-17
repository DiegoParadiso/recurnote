import React, { useState, useRef } from 'react';
import { useItems } from '@context/ItemsContext';
import ItemsList from '@components/layout/Sidebars/SidebarDayView/ItemsList';
import ConfirmationModal from '@components/common/ConfirmationModal';
import '@styles/layouts/sidebars/SidebarDayView.css';
import useItemsForDays from '@hooks/data/useItemsForDays';
import useAutoScrollOnHover from '@hooks/ui/useAutoScrollOnHover';
import { useTranslation } from 'react-i18next';

export default function SidebarDayView({ setSelectedDay, isMobile, onClose, setShowSmall, isRightSidebarPinned, onHover }) {
  const { t, i18n } = useTranslation();
  const { itemsByDate, setItemsByDate, updateItem, deleteItem, loading } = useItems();
  const [itemToDelete, setItemToDelete] = useState(null);

  // Usar items del ItemsContext (que maneja tanto servidor como local)
  const { itemsForDays } = useItemsForDays(itemsByDate);

  const [isHoveringTop, setIsHoveringTop] = useState(false);
  const [isHoveringBottom, setIsHoveringBottom] = useState(false);

  const scrollContainerRef = useRef(null);
  useAutoScrollOnHover(scrollContainerRef, isHoveringTop, isHoveringBottom);

  // Manejar hover interno
  const handleMouseEnter = () => {
    if (onHover && !isRightSidebarPinned) {
      onHover(true);
    }
  };

  const handleReorder = (dateKey, sourceId, targetId) => {
    if (!dateKey || !sourceId || !targetId) return;
    const list = itemsByDate[dateKey] || [];
    if (!Array.isArray(list) || list.length === 0) return;
    if (sourceId === targetId) return;

    const sourceIndex = list.findIndex(i => String(i.id) === String(sourceId));
    const targetIndex = list.findIndex(i => String(i.id) === String(targetId));
    if (sourceIndex === -1 || targetIndex === -1) return;

    const newList = list.slice();
    const [moved] = newList.splice(sourceIndex, 1);
    newList.splice(targetIndex, 0, moved);

    // Actualizar solo el orden visual para todos los items
    setItemsByDate(prev => ({
      ...prev,
      [dateKey]: newList,
    }));

    // Persistir list_order únicamente para items locales (_local)
    newList.forEach((item, idx) => {
      if (item?._local) {
        try {
          updateItem(item.id, { list_order: idx });
        } catch {
        }
      }
    });
  };

  const handleMouseLeave = () => {
    if (onHover && !isRightSidebarPinned) {
      onHover(false);
    }
  };

  // Toggle sólo la tarea del item indicado
  const toggleTaskCheck = (dateKey, itemId, taskIndex) => {
    // Usar updateItem del ItemsContext para todo (tanto servidor como local)
    const currentItems = itemsByDate[dateKey] || [];
    const updatedItems = currentItems.map(item => {
      if (item.id === itemId && item.label === 'Tarea') {
        const checks = [...(item.checked || [])];
        checks[taskIndex] = !checks[taskIndex];
        // Persistir usando updateItem (que maneja tanto servidor como local)
        updateItem(item.id, { checked: checks }).catch(() => { });
        return { ...item, checked: checks };
      }
      return item;
    });

    setItemsByDate(prev => ({
      ...prev,
      [dateKey]: updatedItems,
    }));
  };

  function handleDaySelect(day) {
    setSelectedDay(day);
    if (isMobile) {
      if (onClose) onClose();
      if (setShowSmall) setShowSmall(false);
    }
  }


  const handleDeleteRequest = (itemId) => {
    setItemToDelete(itemId);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteItem(itemToDelete);
      } catch (error) {
        // Error silencioso
      }
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setItemToDelete(null);
  };

  return (
    <div
      className={`fixed ${isMobile ? ' z-50 flex flex-col bg-[var(--color-bg)]' : 'top-0 right-0 h-screen w-[100px] group z-50'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Botón cerrar solo en móviles */}
      {isMobile && (
        <button
          className="self-end pt-2 pr-3 pb-0 text-xl text-[var(--color-text-primary)] z-50"
          onClick={onClose}
          aria-label={t('sidebar.close')}
        >
          ✕
        </button>
      )}

      {/* Hover trigger desktop */}
      {!isMobile && <div className="absolute right-0 top-0 h-full w-[30px] z-10" />}

      <div
        className={`${isMobile
          ? 'sidebar-mobile'
          : 'absolute right-0 top-0 cursor-default'
          } sidebar-container ${!isMobile && (isRightSidebarPinned ? 'sidebar-visible' : 'sidebar-hidden')}`}
      >
        <div className={`${isMobile ? 'pt-0 pb-6' : 'pt-8 pb-5'} flex-shrink-0`}>
          <h2 className="sidebar-header text-center w-full">{t('sidebar.upcomingDays')}</h2>
        </div>

        <div className="border-t mx-4" style={{ borderColor: 'var(--color-border)' }} />

        <div
          ref={scrollContainerRef}
          className="sidebar-scroll-area scroll-hidden"
          style={{ position: 'relative', zIndex: 'var(--z-mid)' }}
        >
          {itemsForDays.length > 0 && <div className="mt-2" />}
          <ItemsList
            itemsForDays={itemsForDays}
            setSelectedDay={handleDaySelect}
            toggleTaskCheck={toggleTaskCheck}
            loading={loading}
            onReorder={handleReorder}
            onDeleteRequest={handleDeleteRequest}
          />
        </div>
        <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="text-center" style={{ fontSize: '10px', color: 'var(--color-muted)' }}>
            {t('sidebar.shownFrom')} <strong>{new Date().toLocaleDateString(i18n.language || 'en')}</strong>
          </div>
        </div>
      </div>


      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={t('sidebar.confirmDeleteItem')}
        message={t('alerts.confirmDeleteMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        isDangerous={true}
      />
    </div >
  );
}

