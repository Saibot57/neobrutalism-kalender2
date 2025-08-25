import React from 'react';
import type { Activity, FamilyMember } from '../types';

interface ActivityBlockProps {
  activity: Activity;
  familyMembers: FamilyMember[];
  style: React.CSSProperties;
  onClick: () => void;
}

export const ActivityBlock: React.FC<ActivityBlockProps> = ({
  activity,
  familyMembers,
  style,
  onClick
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
    // 1. Egen färg har högst prioritet
    if (activity.color) {
      return { background: activity.color };
    }

    // 2. Inga deltagare, neutral färg
    if (participants.length === 0) {
        return { background: '#E0E0E0' }; 
    }

    // 3. En deltagare, använd dennes färg
    if (participants.length === 1) {
      return { background: participants[0].color };
    }

    // 4. Flera deltagare, skapa en diagonal gradient
    const participantColors = participants.map(p => p.color);
    const colorStops = participantColors.map((color, index) => {
        const start = (100 / participantColors.length) * index;
        const end = (100 / participantColors.length) * (index + 1);
        return `${color} ${start}%, ${color} ${end}%`;
    }).join(', ');

    return { background: `linear-gradient(135deg, ${colorStops})` };
  };

  const backgroundStyle = getBackgroundStyle();

  return (
    <div
      className="activity-block"
      style={{
        ...style,
        ...backgroundStyle
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
  );
};