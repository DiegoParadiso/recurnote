import { DateTime } from 'luxon';
import i18n from '../i18n/index.js';

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
    const activeLang = (displayOptions?.language && displayOptions.language !== 'auto')
      ? displayOptions.language
      : (i18n.language || 'en');
    const dateI18n = selectedDate
      .setLocale(activeLang)
      .setZone(displayOptions.timeZone || 'local');

    const dateGroup = [];

    if (displayOptions.weekday) dateGroup.push(dateI18n.toFormat('cccc')); 
    if (displayOptions.day) dateGroup.push(dateI18n.toFormat('d'));
    if (displayOptions.month) dateGroup.push(dateI18n.toFormat('LLLL'));

    if (dateGroup.length) displayParts.push(dateGroup.join(' '));
    if (displayOptions.year) displayParts.push(dateI18n.toFormat('yyyy'));
    if (displayOptions.week) {
      const weekLabel = activeLang.startsWith('es') ? 'Semana' : 'Week';
      displayParts.push(`${weekLabel} ${dateI18n.weekNumber}`);
    }
    
    if (displayOptions.time) {
      const timeFormat = displayOptions.timeFormat === '12h' ? 'hh:mm a' : 'HH:mm';
      displayParts.push(dateI18n.toFormat(timeFormat));
    }
  }

  const welcome = (i18n.language || 'en').startsWith('es') ? 'Bienvenido' : 'Welcome';
  const displayText = selectedDate && displayParts.length
    ? displayParts.join(' • ')
    : welcome;

  return displayText;
}
