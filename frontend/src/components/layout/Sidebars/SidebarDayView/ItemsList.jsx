
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DayItemGroup from '@components/layout/Sidebars/SidebarDayView/DayItemGroup';
import ItemRenderer from '@components/layout/Sidebars/SidebarDayView/ItemRenderer';

export default function ItemsList({ itemsForDays, setSelectedDay, toggleTaskCheck, isLocalMode }) {
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
  if (itemsForDays.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-8 pt-4 px-4 text-center gap-3">
          <img
            src={isDark ? '/assets/image.png' : '/assets/image2.png'}
            alt=""
            className="h-[20rem] w-auto max-w-full opacity-90 pt-5 pb-5"
            aria-hidden
          />
          <p className="text-sm dark:text-gray-400">
            {t('sidebar.empty')}
          </p>
          <p className="text-[12px] text-[color:var(--color-text-secondary)]">
            {t('sidebar.createFromLeft')}
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
          renderItem={(item, dateKey) => (
            <ItemRenderer
              item={item}
              dateKey={dateKey}
              toggleTaskCheck={toggleTaskCheck}
              isLocalMode={isLocalMode}
              key={item.id}
            />
          )}
        />
      ))}
    </>
  );
}
    