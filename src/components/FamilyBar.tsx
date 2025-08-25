// src/components/FamilyBar.tsx - Visar familjemedlemmar i en rad
import React from 'react';
import type { FamilyMember } from '../types';
import { IconRenderer } from './IconRenderer';

interface FamilyBarProps {
  members: FamilyMember[];
}

export const FamilyBar: React.FC<FamilyBarProps> = ({ members }) => {
  return (
    <div className="family-bar" role="region" aria-label="Familjemedlemmar">
      <div className="family-members">
        {members.map(member => (
          <div key={member.id} className="member-badge">
            <IconRenderer 
              icon={member.icon} 
              iconType={member.iconType || 'emoji'} 
              size={20}
            />
            <span className="member-dot" style={{ background: member.color }}></span>
            <span>{member.name}</span>
            {member.isAdult !== undefined && (
              <span className="member-type-indicator">
                {member.isAdult ? '(V)' : '(B)'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};