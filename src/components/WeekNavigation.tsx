// src/components/WeekNavigation.tsx

import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Copy, Upload, Home, ArrowRightLeft } from 'lucide-react';

interface WeekNavigationProps {
  isCurrentWeek: boolean;
  clipboardWeek: { week: number; year: number } | null;
  selectedWeek: number;
  selectedYear: number;
  onNavigateWeek: (direction: number) => void;
  onGoToCurrentWeek: () => void;
  onToggleWeekPicker: () => void;
  onCopyWeek: () => void;
  onPasteWeek: () => void;
  onOpenDataModal: () => void;
}

export const WeekNavigation: React.FC<WeekNavigationProps> = ({
  isCurrentWeek,
  clipboardWeek,
  selectedWeek,
  selectedYear,
  onNavigateWeek,
  onGoToCurrentWeek,
  onToggleWeekPicker,
  onCopyWeek,
  onPasteWeek,
  onOpenDataModal
}) => {
  const canPaste = clipboardWeek &&
    (clipboardWeek.week !== selectedWeek || clipboardWeek.year !== selectedYear);

  return (
    <nav className="week-nav" aria-label="Veckonavigering">
      <div className="week-nav-content">
        <div className="btn-group">
          <button
            className="btn btn-icon"
            onClick={() => onNavigateWeek(-1)}
            aria-label="Föregående vecka"
          >
            <ChevronLeft size={24}/>
          </button>
          <button
            className={`btn ${isCurrentWeek ? 'btn-success' : ''}`}
            onClick={onGoToCurrentWeek}
            disabled={isCurrentWeek}
            aria-label="Gå till nuvarande vecka"
          >
            <Home size={20}/> Denna Vecka
          </button>
          <button
            className="btn btn-icon"
            onClick={() => onNavigateWeek(1)}
            aria-label="Nästa vecka"
          >
            <ChevronRight size={24}/>
          </button>
          <button
            className="btn btn-info"
            onClick={onToggleWeekPicker}
            aria-label="Öppna veckoväljare"
          >
            <Calendar size={20}/> Välj Vecka
          </button>
        </div>

        <div className="btn-group">
          <button
            className="btn btn-info"
            onClick={onCopyWeek}
            aria-label="Kopiera denna vecka"
          >
            <Copy size={20}/> Kopiera
          </button>
          {canPaste && (
            <button
              className="btn btn-success"
              onClick={onPasteWeek}
              aria-label="Klistra in kopierad vecka"
            >
              <Upload size={20}/> Klistra in
            </button>
          )}
           <button
            className="btn btn-warning"
            onClick={onOpenDataModal}
           >
            <ArrowRightLeft size={20} /> Import / Export
          </button>
        </div>
      </div>
    </nav>
  );
};