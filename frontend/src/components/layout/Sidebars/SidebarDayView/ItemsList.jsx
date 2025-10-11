
import React from 'react';
import { useTranslation } from 'react-i18next';
import DayItemGroup from '@components/layout/Sidebars/SidebarDayView/DayItemGroup';
import ItemRenderer from '@components/layout/Sidebars/SidebarDayView/ItemRenderer';

export default function ItemsList({ itemsForDays, setSelectedDay, toggleTaskCheck, isLocalMode }) {
  const { t } = useTranslation();
  if (itemsForDays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
          {t('sidebar.empty')}
        </p>
      </div>
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
    