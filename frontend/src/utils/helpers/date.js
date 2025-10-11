import { DateTime } from 'luxon';

/**
 * Formatea un objeto de fecha a formato ISO (YYYY-MM-DD)
 * @param {Object} dateObj - Objeto con { year, month, day }
 * @returns {string} Fecha en formato ISO
 */
export function formatDateKey(dateObj) {
  return DateTime.fromObject(dateObj).toISODate();
}

/**
 * Obtiene todos los días de un mes dado
 * @param {DateTime} date - Fecha de Luxon
 * @returns {Array<Object>} Array de objetos { day, month, year }
 */
export function getDaysInMonth(date) {
  const startOfMonth = date.startOf('month');
  const daysInMonth = date.daysInMonth;
  const daysArray = [];

  for (let i = 0; i < daysInMonth; i++) {
    const day = startOfMonth.plus({ days: i });
    daysArray.push({
      day: day.day,
      month: day.month,
      year: day.year,
    });
  }

  return daysArray;
}


