import React from 'react';
import type { Activity, FamilyMember } from '../types';
import { HoverCard } from './HoverCard';

interface ActivityBlockProps {
  activity: Activity;
  familyMembers: FamilyMember[];
  style: React.CSSProperties;
  onClick: () => void;
  day: string;
}

export const ActivityBlock: React.FC<ActivityBlockProps> = ({
  activity,
  familyMembers,
  style,
  onClick,
  day
}) => {
  const participants = activity.participants
    .map(id => familyMembers.find(m => m.id === id))
    .filter(Boolean) as FamilyMember[];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const getBackgroundStyle = () => {
    if (activity.color) {
      return { background: activity.color };
    }
    if (participants.length === 0) {
      return { background: '#E0E0E0' };
    }
    if (participants.length === 1) {
      return { background: participants[0].color };
    }
    const participantColors = participants.map(p => p.color);
    const colorStops = participantColors.map((color, index) => {
        const start = (100 / participantColors.length) * index;
        const end = (100 / participantColors.length) * (index + 1);
        return `${color} ${start}%, ${color} ${end}%`;
    }).join(', ');

    return { background: `linear-gradient(135deg, ${colorStops})` };
  };

  const backgroundStyle = getBackgroundStyle();
  const wrapperClassName = `activity-block-wrapper ${day === 'Måndag' ? 'hover-on-right' : ''}`;

  return (
    <div
      className={wrapperClassName}
      style={style}
    >
      <div
        className="activity-block"
        style={{
          ...backgroundStyle,
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label={`${activity.name} från ${activity.startTime} till ${activity.endTime}`}
        onKeyDown={handleKeyDown}
      >
        <div className="activity-name">
          <span>{activity.icon}</span>
          {activity.name}
        </div>
        <div className="activity-time">
          {activity.startTime} – {activity.endTime}
        </div>
        <div className="activity-participants">
          {participants.map(p => (
            <span key={p.id} aria-label={p.name}>{p.icon}</span>
          ))}
        </div>
      </div>
      <HoverCard activity={activity} familyMembers={familyMembers} />
    </div>
  );
};