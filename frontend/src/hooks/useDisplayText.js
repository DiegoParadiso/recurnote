import { DateTime } from 'luxon';

export function useDisplayText(selectedDay, displayOptions) {
  const selectedDate = selectedDay ? (() => {
    const zone = displayOptions?.timeZone || DateTime.local().zoneName;
    return DateTime.now().setZone(zone).set({
      day: selectedDay.day,
      month: selectedDay.month,
      year: selectedDay.year,
    });
  })() : null;
  
  const displayParts = [];

  if (selectedDate) {
    const dateEs = selectedDate
      .setLocale('es')
      .setZone(displayOptions.timeZone || 'local');

    const dateGroup = [];

    if (displayOptions.weekday) dateGroup.push(dateEs.toFormat('cccc')); 
    if (displayOptions.day) dateGroup.push(dateEs.toFormat('d'));
    if (displayOptions.month) dateGroup.push(dateEs.toFormat('LLLL'));

    if (dateGroup.length) displayParts.push(dateGroup.join(' '));
    if (displayOptions.year) displayParts.push(dateEs.toFormat('yyyy'));
    if (displayOptions.week) displayParts.push(`Semana ${dateEs.weekNumber}`);
    
    if (displayOptions.time) {
      const timeFormat = displayOptions.timeFormat === '12h' ? 'hh:mm a' : 'HH:mm';
      displayParts.push(dateEs.toFormat(timeFormat));
    }
  }

  const displayText = selectedDate && displayParts.length
    ? displayParts.join(' • ')
    : 'Bienvenido';

  return displayText;
}
