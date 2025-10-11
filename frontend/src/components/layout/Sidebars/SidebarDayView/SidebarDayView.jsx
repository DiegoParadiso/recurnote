import React, { useState, useRef } from 'react';
import { useItems } from '@context/ItemsContext';
import { useAuth } from '@context/AuthContext';
import ItemsList from '@components/layout/Sidebars/SidebarDayView/ItemsList';
import ItemRenderer from '@components/layout/Sidebars/SidebarDayView/ItemRenderer';
import '@styles/layouts/sidebars/SidebarDayView.css';
import useItemsForDays from '@components/layout/Sidebars/SidebarDayView/hooks/useItemsForDays';
import useAutoScrollOnHover from '@components/layout/Sidebars/SidebarDayView/hooks/useAutoScrollOnHover';
import { useTranslation } from 'react-i18next';

export default function SidebarDayView({ setSelectedDay, isMobile, onClose, setShowSmall, isRightSidebarPinned, onHover }) {
  const { t, i18n } = useTranslation();
  const { itemsByDate, setItemsByDate, updateItem } = useItems();
  const { user, token } = useAuth();
  
  // Usar items del ItemsContext (que maneja tanto servidor como local)
  const { itemsForDays, startDate } = useItemsForDays(itemsByDate);
  
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
        updateItem(item.id, { checked: checks }).catch(() => {});
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

  return (
    <div 
      className={`fixed ${isMobile ? 'inset-0 z-50 flex flex-col bg-[var(--color-bg)]' : 'top-0 right-0 h-screen w-[30px] group z-50'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Botón cerrar solo en móviles */}
      {isMobile && (
        <button
          className="self-end p-4 text-xl text-[var(--color-text-primary)] z-50"
          onClick={onClose}
          aria-label={t('sidebar.close')}
        >
          ✕
        </button>
      )}

      {/* Hover trigger desktop */}
      {!isMobile && <div className="absolute right-0 top-0 h-full w-[30px] z-10" />}

      <div
        className={`${
          isMobile
            ? 'sidebar-mobile'
            : isRightSidebarPinned
            ? 'absolute right-0 top-0 cursor-default'
            : 'absolute -right-[var(--sidebar-width)] top-0 group-hover:right-0 cursor-default'
        } sidebar-container`}
      >
        <div className="px-4 md:pt-7 pb-7 flex-shrink-0">
          <h2 className="sidebar-header">{t('sidebar.upcomingDays')}</h2>
        </div>

        <div
          ref={scrollContainerRef}
          className="sidebar-scroll-area scroll-hidden"
          style={{ position: 'relative', zIndex: 'var(--z-mid)' }}
        >
          <ItemsList
            itemsForDays={itemsForDays}
            setSelectedDay={handleDaySelect}
            toggleTaskCheck={toggleTaskCheck}
            isLocalMode={!user || !token}
          />
        </div>
        <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="text-center" style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
            {t('sidebar.shownFrom')} <strong>{new Date().toLocaleDateString(i18n.language || 'en')}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
