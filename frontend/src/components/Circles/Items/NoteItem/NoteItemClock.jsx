import React from 'react';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';

export default function NoteItemClock({
  assignedTime,
  now,
  timeInput,
  onTimeInputChange,
  onAssignTime,
  onClearTime,
}) {
  const { t } = useTranslation();

  const getCountdownLabel = () => {
    if (!assignedTime) return '';
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const [hh, mm] = (assignedTime || '00:00').split(':').map(v => parseInt(v, 10));
    const nowTz = DateTime.fromJSDate(now).setZone(tz);
    const baseToday = nowTz.startOf('day');
    const target = baseToday.set({ hour: hh || 0, minute: mm || 0, second: 0, millisecond: 0 });
    const totalMin = Math.round(target.diff(nowTz, 'minutes').as('minutes'));
    const sign = totalMin >= 0 ? 1 : -1;
    const absMin = Math.abs(totalMin);
    const hours = Math.floor(absMin / 60);
    const minutes = absMin % 60;
    if (sign > 0) {
      if (hours > 0) {
        return minutes > 0
          ? t('note.countdown.in_h_m', { h: hours, m: minutes })
          : t('note.countdown.in_h', { h: hours });
      }
      return t('note.countdown.in_m', { m: minutes });
    } else {
      if (hours > 0) {
        return minutes > 0
          ? t('note.countdown.ago_h_m', { h: hours, m: minutes })
          : t('note.countdown.ago_h', { h: hours });
      }
      return t('note.countdown.ago_m', { m: minutes });
    }
  };

  return (
    <>
      <span className="clock" aria-live={assignedTime ? 'polite' : undefined}>
        {assignedTime
          ? getCountdownLabel()
          : now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
      {!assignedTime && (
        <input
          type="time"
          value={timeInput}
          onChange={(e) => onTimeInputChange?.(e.target.value)}
          aria-label={t('note.assignTimeAria')}
        />
      )}
    </>
  );
}
