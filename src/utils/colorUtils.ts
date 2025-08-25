// src/utils/colorUtils.ts - Verktyg för färgberäkningar och diagonala mönster
import type { FamilyMember } from '../types';

export const getActivityColors = (
  participantIds: string[], 
  familyMembers: FamilyMember[]
): string[] => {
  const colors: string[] = [];
  
  participantIds.forEach(id => {
    const member = familyMembers.find(m => m.id === id);
    if (member) {
      colors.push(member.color);
    }
  });
  
  return colors;
};

export const createStripedPattern = (colors: string[]): React.CSSProperties => {
  if (colors.length === 0) return { background: '#FFD93D' };
  if (colors.length === 1) return { background: colors[0] };
  
  if (colors.length === 2) {
    // For two colors, create a clean diagonal split
    return {
      background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[0]} 50%, ${colors[1]} 50%, ${colors[1]} 100%)`
    };
  }
  
  if (colors.length === 3) {
    // For three colors, create three diagonal sections
    return {
      background: `linear-gradient(135deg, 
        ${colors[0]} 0%, ${colors[0]} 33%, 
        ${colors[1]} 33%, ${colors[1]} 66%, 
        ${colors[2]} 66%, ${colors[2]} 100%)`
    };
  }
  
  // For 4 or more colors, create repeating diagonal stripes
  const stripeWidth = 12; // pixels per stripe
  const totalWidth = stripeWidth * colors.length;
  const gradientStops: string[] = [];
  
  // Create two full sets of stripes for seamless pattern
  for (let set = 0; set < 2; set++) {
    colors.forEach((color, index) => {
      const basePosition = set * totalWidth + (index * stripeWidth);
      gradientStops.push(
        `${color} ${basePosition}px`,
        `${color} ${basePosition + stripeWidth}px`
      );
    });
  }
  
  return {
    background: `repeating-linear-gradient(
      45deg,
      ${gradientStops.join(', ')}
    )`,
    backgroundSize: `${totalWidth * 2}px ${totalWidth * 2}px`
  };
};