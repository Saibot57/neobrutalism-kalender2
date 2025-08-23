import React from 'react';
import type { FamilyMember } from '../types';

interface FamilyBarProps {
  members: FamilyMember[];
}

export const FamilyBar: React.FC<FamilyBarProps> = ({ members }) => {
  return (
    <div className="family-bar" role="region" aria-label="Familjemedlemmar">
      <div className="family-members">
        {members.map(member => (
          <div key={member.id} className="member-badge">
            <span role="img" aria-label={member.name}>{member.icon}</span>
            <span className="member-dot" style={{ background: member.color }}></span>
            <span>{member.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};