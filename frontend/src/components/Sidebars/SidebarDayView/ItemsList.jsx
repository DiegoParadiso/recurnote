
import React from 'react';
import DayItemGroup from './DayItemGroup';

export default function ItemsList({ itemsForDays, setSelectedDay, renderItem }) {
  if (itemsForDays.length === 0) {
    return <p className="text-[10px] italic">No hay ítems para los próximos días.</p>;
  }

  return (
    <>
      {itemsForDays.map(({ date, items }) => (
        <DayItemGroup
          key={date.toISODate()}
          date={date}
          items={items}
          onDaySelect={setSelectedDay}
          renderItem={renderItem}
        />
      ))}
    </>
  );
}
    