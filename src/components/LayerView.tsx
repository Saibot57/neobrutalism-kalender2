import React from 'react';
import type { Activity, FamilyMember, Settings } from '../types';
import { ActivityBlock } from './ActivityBlock';
import { calculatePosition } from '../utils/scheduleUtils';
import { isToday } from '../utils/dateUtils';

interface LayerViewProps {
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

export const LayerView: React.FC<LayerViewProps> = ({
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
  const monthAbbr = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun',
                     'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

  const getActivitiesForMemberAndDay = (memberId: string, day: string) => {
    return activities
      .filter(a => 
        a.participants.includes(memberId) &&
        a.day === day && 
        a.week === selectedWeek && 
        a.year === selectedYear
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getMemberActivityCount = (memberId: string) => {
    return activities.filter(a => 
      a.participants.includes(memberId) &&
      a.week === selectedWeek && 
      a.year === selectedYear
    ).length;
  };

  return (
    <main className="layer-view-container" role="main" aria-label="Schema per familjemedlem">
      <div className="layer-view-header">
        <div className="layer-time-header">
          <div className="corner-cell">MEDLEM / TID</div>
        </div>
        {days.map((day, index) => {
          const date = weekDates[index];
          return (
            <div key={day} className={`layer-day-header ${isToday(date) ? 'today' : ''}`}>
              <span className="day-name">{day}</span>
              <span className="day-date">
                {date.getDate()} {monthAbbr[date.getMonth()]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="layer-view-body">
        {familyMembers.map(member => {
          const memberActivityCount = getMemberActivityCount(member.id);
          const hasActivities = memberActivityCount > 0;
          
          return (
            <div 
              key={member.id} 
              className={`participant-layer ${!hasActivities ? 'inactive' : ''}`}
              style={{ borderLeftColor: member.color }}
            >
              {/* Member info column */}
              <div className="member-info" style={{ background: member.color + '20' }}>
                <div className="member-avatar">
                  <span className="member-icon">{member.icon}</span>
                  <div className="member-details">
                    <span className="member-name">{member.name}</span>
                    <span className="activity-count">
                      {memberActivityCount} {memberActivityCount === 1 ? 'aktivitet' : 'aktiviteter'}
                    </span>
                  </div>
                </div>
                {/* Mini timeline for this member */}
                <div className="member-timeline">
                  {timeSlots.map(time => (
                    <div key={time} className="mini-time-slot">{time}</div>
                  ))}
                </div>
              </div>

              {/* Days columns for this member */}
              <div className="member-schedule" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
                {days.map((day, dayIndex) => {
                  const date = weekDates[dayIndex];
                  const dayActivities = getActivitiesForMemberAndDay(member.id, day);
                  
                  return (
                    <div 
                      key={day} 
                      className={`member-day-column ${isToday(date) ? 'today' : ''}`}
                    >
                      <div className="day-activities" style={{ height: `${timeSlots.length * 60}px` }}>
                        {dayActivities.map(activity => {
                          const { top, height } = calculatePosition(
                            activity.startTime,
                            activity.endTime,
                            60,
                            settings.dayStart
                          );

                          // Check if this activity has multiple participants
                          const isShared = activity.participants.length > 1;
                          
                          const activityBlockProps = {
                            activity: activity,
                            day: day,
                            familyMembers: familyMembers,
                            style: {
                              position: 'absolute' as const,
                              top,
                              height,
                              left: '4px',
                              width: 'calc(100% - 8px)',
                              opacity: isShared ? 0.95 : 1,
                            },
                            onClick: () => onActivityClick(activity),
                            dayIndex: dayIndex,
                            totalDays: days.length,
                          };
                          
                          return (
                            <div key={activity.id} className="layer-activity-wrapper">
                              <ActivityBlock {...activityBlockProps} />
                              {isShared && (
                                <div className="shared-indicator" title="Delad aktivitet">
                                  👥
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid overlay for reference */}
      <div className="time-grid-overlay">
        {timeSlots.map((time, index) => (
          <div 
            key={time} 
            className="time-line" 
            style={{ top: `${80 + index * 60}px` }}
          >
            <span className="time-label">{time}</span>
          </div>
        ))}
      </div>
    </main>
  );
};