// src/components/ActivityBlock.tsx - Visar en aktivitet i schemat
import React from 'react';
import type { Activity, FamilyMember } from '../types';
import { IconRenderer } from './IconRenderer';
import { getActivityColors, createStripedPattern } from '../utils/colorUtils';

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

  // Determine background based on custom color or participant colors
  const getBackgroundStyle = (): React.CSSProperties => {
    if (activity.customColor) {
      return { background: activity.customColor };
    }
    
    const participantColors = getActivityColors(activity.participants, familyMembers);
    return createStripedPattern(participantColors);
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
        <IconRenderer 
          icon={activity.icon} 
          iconType={activity.iconType || 'emoji'} 
          size={16}
        />
        {activity.name}
      </div>
      <div className="activity-time">
        {activity.startTime} – {activity.endTime}
      </div>
      <div className="activity-participants">
        {participants.map(p => (
          <IconRenderer 
            key={p.id}
            icon={p.icon} 
            iconType={p.iconType || 'emoji'} 
            size={16}
          />
        ))}
      </div>
    </div>
  );
};