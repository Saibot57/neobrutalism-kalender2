import React from 'react';
import type { Activity, FamilyMember, Settings } from '../types';
import { ActivityBlock } from './ActivityBlock';
import { calculatePosition, calculateOverlapGroups } from '../utils/scheduleUtils';
import { isToday } from '../utils/dateUtils';

interface ScheduleGridProps {
  days: string[];
  weekDates: Date[];
  timeSlots: string[];
  activities: Activity[];
  familyMembers: FamilyMember[];
  settings: Settings;
  selectedWeek: number;
  selectedYear: number;
  onActivityClick: (activity: Activity) => void;
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  days,
  weekDates,
  timeSlots,
  activities,
  familyMembers,
  settings,
  selectedWeek,
  selectedYear,
  onActivityClick
}) => {
  const getActivitiesForDay = (day: string) => {
    return activities
      .filter(a => a.day === day && a.week === selectedWeek && a.year === selectedYear)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const monthAbbr = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun',
                     'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

  const columnWidths = days.map(day => {
    const dayActivities = getActivitiesForDay(day);
    const overlapGroups = calculateOverlapGroups(dayActivities);
    // Om det finns 2 eller fler grupper (dvs. en krock), gör kolumnen 50% bredare.
    return overlapGroups.length > 1 ? '1.5fr' : '1fr';
  });

  const gridTemplateColumns = `80px ${columnWidths.join(' ')}`;

  return (
    <main className="schedule-container" role="main" aria-label="Veckans schema">
      <div
        className="schedule-grid"
        style={{ gridTemplateColumns: gridTemplateColumns }}
      >
        {/* Time column */}
        <div className="time-column">
          <div className="time-header">TID</div>
          {timeSlots.map(time => (
            <div key={time} className="time-slot">{time}</div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day, index) => {
          const date = weekDates[index];
          const dayActivities = getActivitiesForDay(day);
          const overlapGroups = calculateOverlapGroups(dayActivities);
          const numColumns = overlapGroups.length;

          return (
            <div key={day} className="day-column">
              <div className={`day-header ${isToday(date) ? 'today' : ''}`}>
                <span className="day-name">{day}</span>
                <span className="day-date">
                  {date.getDate()} {monthAbbr[date.getMonth()]}
                </span>
              </div>
              <div className="day-content" style={{ height: `${timeSlots.length * 60}px` }}>
                {overlapGroups.map((group, groupIndex) =>
                  group.map(activity => {
                    const { top, height } = calculatePosition(
                      activity.startTime,
                      activity.endTime,
                      60,
                      settings.dayStart
                    );
                    const width = numColumns > 1 ? `${100 / numColumns}%` : 'calc(100% - 8px)';
                    const left = numColumns > 1 ? `${(100 / numColumns) * groupIndex}%` : '4px';

                    // Define props in an object before passing them
                    const activityBlockProps = {
                      activity: activity,
                      day: day,
                      familyMembers: familyMembers,
                      style: {
                        position: 'absolute' as const,
                        top,
                        height,
                        left,
                        width,
                      },
                      onClick: () => onActivityClick(activity)
                    };
                    
                    // Spread the props into the component
                    return (
                      <ActivityBlock key={activity.id} {...activityBlockProps} />
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};