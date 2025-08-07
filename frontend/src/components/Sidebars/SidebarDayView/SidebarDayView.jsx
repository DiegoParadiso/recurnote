import React, { useState, useRef } from 'react';
import { useItems } from '../../../context/ItemsContext';
import ItemsList from './ItemsList';
import ItemRenderer from './ItemRenderer';
import './SidebarDayView.css';
import useItemsForDays from './hooks/useItemsForDays';
import useAutoScrollOnHover from './hooks/useAutoScrollOnHover';

export default function SidebarDayView({ setSelectedDay, isMobile, onClose, setShowSmall, isRightSidebarPinned }) {
  const { itemsByDate, setItemsByDate } = useItems();
  const { itemsForDays, startDate } = useItemsForDays(itemsByDate);

  const [isHoveringTop, setIsHoveringTop] = useState(false);
  const [isHoveringBottom, setIsHoveringBottom] = useState(false);

  const scrollContainerRef = useRef(null);
  useAutoScrollOnHover(scrollContainerRef, isHoveringTop, isHoveringBottom);

  const toggleTaskCheck = (dateKey, index) => {
    const currentItems = itemsByDate[dateKey];
    const updatedItems = currentItems.map(item => {
      if (item.label === 'Tarea') {
        const checks = [...(item.checked || [])];
        checks[index] = !checks[index];
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
    <div className={`fixed ${isMobile ? 'inset-0 z-50 flex flex-col bg-[var(--color-bg)]' : 'top-0 right-0 h-screen w-[30px] group z-50'}`}>
      {/* Botón cerrar solo en móviles */}
      {isMobile && (
        <button
          className="self-end p-4 text-xl text-[var(--color-text-primary)] z-50"
          onClick={onClose}
          aria-label="Cerrar sidebar"
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
            : 'absolute right-[-260px] top-0 group-hover:right-0 cursor-default'
        } sidebar-container`}
      >
        <div className="px-4 md:pt-7 pb-7 flex-shrink-0">
          <h2 className="sidebar-header">próximos días</h2>
        </div>

        <div
          ref={scrollContainerRef}
          className="sidebar-scroll-area scroll-hidden"
          style={{ position: 'relative', zIndex: 20 }}
        >
          <ItemsList
            itemsForDays={itemsForDays}
            setSelectedDay={handleDaySelect}
            renderItem={(item, dateKey) => (
              <ItemRenderer
                item={item}
                dateKey={dateKey}
                toggleTaskCheck={toggleTaskCheck}
                setItemsByDate={setItemsByDate}
                key={item.id}
              />
            )}
          />
        </div>

        {!isMobile && (
          <>
            <div
              className="absolute top-[2px] left-0 right-0 h-[72px] z-30 cursor-default"
              onMouseEnter={() => setIsHoveringTop(true)}
              onMouseLeave={() => setIsHoveringTop(false)}
            />
            <div
              className="absolute bottom-[10px] left-0 right-0 h-[70px] z-30 cursor-default"
              onMouseEnter={() => setIsHoveringBottom(true)}
              onMouseLeave={() => setIsHoveringBottom(false)}
            />
          </>
        )}

        {startDate && (
          <div className="sidebar-footer">
            Mostrando desde{' '}
            <strong>{startDate.setLocale('es').toFormat('cccc d LLLL')}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
