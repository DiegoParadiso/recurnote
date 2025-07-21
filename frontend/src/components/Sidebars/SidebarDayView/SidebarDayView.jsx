import React, { useState, useRef } from 'react';
import { useItems } from '../../../context/ItemsContext';
import ItemsList from './ItemsList';
import ItemRenderer from './ItemRenderer';

import useItemsForDays from './hooks/useItemsForDays';
import useAutoScrollOnHover from './hooks/useAutoScrollOnHover';

export default function HalfCircleDayView({ setSelectedDay }) {
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

  return (
    <div className="fixed top-0 right-0 h-screen w-[30px] group z-50">
      <div className="absolute right-0 top-0 h-full w-[30px] z-10" />

      <div className="absolute right-[-260px] top-0 transition-all duration-300 ease-in-out bg-neutral-100 border border-neutral-700 w-[260px] h-screen flex flex-col group-hover:right-0 cursor-default">

        <div className="px-4 pt-7 pb-7 flex-shrink-0">
          <h2 className="text-[15px] font-medium text-neutral-700 mono tracking-widest uppercase">
            próximos días
          </h2>
        </div>

        {/* Scroll container con contenido y scrollbar oculto */}
        <div
          ref={scrollContainerRef}
          className="relative flex-grow px-4 pb-4 flex flex-col gap-5 scroll-hidden"
          style={{ position: 'relative', zIndex: 20 }}
        >
          <ItemsList
            itemsForDays={itemsForDays}
            setSelectedDay={setSelectedDay}
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

        {/* Zonas semitransparentes para auto-scroll arriba y abajo */}
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

        {startDate && (
          <div className="p-3 flex-shrink-0 border-t border-neutral-300 text-center text-[10px] text-neutral-500 select-none">
            Mostrando desde <strong>{startDate.setLocale('es').toFormat('cccc d LLLL')}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
