
import React from 'react';
import DayItemGroup from './DayItemGroup';
import ItemRenderer from './ItemRenderer';

export default function ItemsList({ itemsForDays, setSelectedDay, toggleTaskCheck, isLocalMode }) {
  if (itemsForDays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          No hay ítems para los próximos días
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Crea nuevos ítems desde el sidebar izquierdo
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
    