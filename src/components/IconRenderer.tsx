// src/components/IconRenderer.tsx - Renderar ikoner av olika typer
import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconRendererProps {
  icon: string;
  iconType: 'emoji' | 'lucide' | 'custom';
  size?: number;
  className?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ 
  icon, 
  iconType, 
  size = 24,
  className = ''
}) => {
  // Get custom icons from localStorage
  const getCustomIcon = (iconId: string): string | null => {
    const saved = localStorage.getItem('customIcons');
    if (!saved) return null;
    const icons = JSON.parse(saved);
    return icons[iconId] || null;
  };

  if (iconType === 'emoji') {
    return <span className={className} style={{ fontSize: size }}>{icon}</span>;
  }

  if (iconType === 'lucide') {
    const IconComponent = (LucideIcons as any)[icon];
    if (!IconComponent) {
      // Fallback to a default icon if not found
      return <LucideIcons.HelpCircle size={size} className={className} />;
    }
    return <IconComponent size={size} className={className} />;
  }

  if (iconType === 'custom') {
    const customIconData = getCustomIcon(icon);
    if (!customIconData) {
      return <LucideIcons.Image size={size} className={className} />;
    }
    return (
      <img 
        src={customIconData} 
        alt="Custom icon" 
        style={{ width: size, height: size }} 
        className={className}
      />
    );
  }

  return null;
};