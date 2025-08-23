import type { Activity } from '../types';

export const downloadICS = (
  activities: Activity[],
  selectedWeek: number,
  selectedYear: number,
  weekDates: Date[],
  days: string[]
): void => {
  const pad = (n: number): string => n.toString().padStart(2, '0');
  
  const toICS = (date: Date, time: string): string => {
    const [hour, minute] = time.split(':');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${hour}${minute}00`;
  };

  const events = activities.filter(a => a.week === selectedWeek && a.year === selectedYear);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FamiljensSchema//SE'
  ];

  events.forEach(event => {
    const dayIndex = days.indexOf(event.day);
    if (dayIndex === -1) return;
    
    const date = weekDates[dayIndex];
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id}`);
    lines.push(`DTSTAMP:${toICS(new Date(), '00:00')}`);
    lines.push(`DTSTART:${toICS(date, event.startTime)}`);
    lines.push(`DTEND:${toICS(date, event.endTime)}`);
    lines.push(`SUMMARY:${event.icon} ${event.name}`);
    
    if (event.location) {
      lines.push(`LOCATION:${event.location}`);
    }
    
    if (event.notes) {
      lines.push(`DESCRIPTION:${event.notes}`);
    }
    
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vecka-${selectedWeek}-${selectedYear}.ics`;
  a.click();
  URL.revokeObjectURL(url);
};