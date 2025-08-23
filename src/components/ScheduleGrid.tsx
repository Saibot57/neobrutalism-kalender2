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

  return (
    <main className="schedule-container" role="main" aria-label="Veckans schema">
      <div 
        className="schedule-grid"
        style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}
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

                    return (
                      <ActivityBlock
                        key={activity.id}
                        activity={activity}
                        familyMembers={familyMembers}
                        style={{
                          top,
                          height,
                          background: activity.color,
                          left,
                          width,
                          right: 'auto'
                        }}
                        onClick={() => onActivityClick(activity)}
                      />
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