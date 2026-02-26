
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DayItemGroup from '@components/layout/Sidebars/SidebarDayView/DayItemGroup';
import ItemRenderer from '@components/layout/Sidebars/SidebarDayView/ItemRenderer';

export default function ItemsList({ itemsForDays, setSelectedDay, toggleTaskCheck, onReorder, onDeleteRequest, loading, isMobile }) {
  const { t } = useTranslation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const el = document?.documentElement;
    const check = () => setIsDark(el?.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    if (el) observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (loading && itemsForDays.length === 0) {
    return null; // Or a spinner if preferred, but null avoids flash
  }

  if (itemsForDays.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center pt-4 px-4 text-center gap-2">
          <img
            src={isDark ? '/assets/image1.png' : '/assets/image0.png'}
            alt=""
            className="h-[20rem] w-auto max-w-full opacity-90 pt-5 pb-5"
            aria-hidden
          />
          <p className="text-sm text-[color:var(--color-text-primary)]">
            {t('sidebar.empty')}
          </p>
          <p className="text-[12px] text-[color:var(--color-muted)] flex items-center justify-center gap-1">
            {isMobile ? (
              <>
                {t('sidebar.createFrom')}
                <img
                  src="/assets/plus.svg"
                  alt="Plus"
                  className="w-4 h-4 inline-block"
                  style={{
                    filter: isDark ? 'brightness(0) saturate(100%) invert(1)' : 'brightness(0) saturate(100%)'
                  }}
                />
              </>
            ) : (
              t('sidebar.createFromLeft')
            )}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {itemsForDays.map(({ date, items }) => (
        <DayItemGroup
          key={date.toISODate()}
          date={date}
          items={items}
          onDaySelect={setSelectedDay}
          onReorder={onReorder}
          renderItem={(item, dateKey) => (
            <ItemRenderer
              item={item}
              dateKey={dateKey}
              toggleTaskCheck={toggleTaskCheck}

              onDeleteRequest={onDeleteRequest}
              key={item.id}
            />
          )}
        />
      ))}
    </>
  );
}
