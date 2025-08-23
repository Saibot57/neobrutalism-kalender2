import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { getWeeksInYear, getWeekNumber } from '../utils/dateUtils';
import { useResizable } from '../hooks/useResizable';

interface WeekPickerProps {
  selectedWeek: number;
  selectedYear: number;
  onSelectWeek: (week: number) => void;
  onChangeYear: (year: number) => void;
  onClose: () => void;
}

export const WeekPicker: React.FC<WeekPickerProps> = ({
  selectedWeek,
  selectedYear,
  onSelectWeek,
  onChangeYear,
  onClose
}) => {
  const currentWeek = getWeekNumber(new Date());
  const currentYear = new Date().getFullYear();
  const weeksInYear = getWeeksInYear(selectedYear);
  
  const pickerRef = useRef<HTMLDivElement>(null);
  const { handleMouseDown, isResizing } = useResizable(pickerRef as React.RefObject<HTMLElement>, {
    minWidth: 400,
    minHeight: 300,
    defaultWidth: 600,
    defaultHeight: 450,
    storageKey: 'week-picker'
  });

  return (
    <>
      <div 
        className={`modal-overlay ${isResizing ? 'resizing' : ''}`}
        onClick={onClose}
      />
      <div 
        className="week-picker resizable" 
        role="dialog" 
        aria-label="Välj vecka och år"
        ref={pickerRef}
      >
        {/* Resize Handles */}
        <div 
          className="resize-handle resize-handle-n" 
          onMouseDown={(e) => handleMouseDown(e, 'n')}
        />
        <div 
          className="resize-handle resize-handle-s" 
          onMouseDown={(e) => handleMouseDown(e, 's')}
        />
        <div 
          className="resize-handle resize-handle-e" 
          onMouseDown={(e) => handleMouseDown(e, 'e')}
        />
        <div 
          className="resize-handle resize-handle-w" 
          onMouseDown={(e) => handleMouseDown(e, 'w')}
        />
        <div 
          className="resize-handle resize-handle-ne" 
          onMouseDown={(e) => handleMouseDown(e, 'ne')}
        />
        <div 
          className="resize-handle resize-handle-nw" 
          onMouseDown={(e) => handleMouseDown(e, 'nw')}
        />
        <div 
          className="resize-handle resize-handle-se" 
          onMouseDown={(e) => handleMouseDown(e, 'se')}
        />
        <div 
          className="resize-handle resize-handle-sw" 
          onMouseDown={(e) => handleMouseDown(e, 'sw')}
        />
        
        <div className="resize-indicator">
          <span className="resize-dots">⋮⋮</span>
        </div>

        <div className="week-picker-header">
          <h3 style={{ textTransform: 'uppercase' }}>Välj Vecka</h3>
          <div className="year-selector">
            <button 
              className="btn btn-icon" 
              onClick={() => onChangeYear(selectedYear - 1)}
              aria-label="Föregående år"
            >
              <ChevronLeft size={20}/>
            </button>
            <span style={{ padding: '0 15px', fontWeight: '700', fontSize: '1.2rem' }}>
              {selectedYear}
            </span>
            <button 
              className="btn btn-icon" 
              onClick={() => onChangeYear(selectedYear + 1)}
              aria-label="Nästa år"
            >
              <ChevronRight size={20}/>
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
            <div className="resize-hint" title="Dra i hörnen för att ändra storlek">
              <Maximize2 size={20} />
            </div>
            <button 
              className="modal-close" 
              onClick={onClose}
              aria-label="Stäng veckoväljare"
              style={{ position: 'static' }}
            >
              <X size={24}/>
            </button>
          </div>
        </div>
        <div className="week-picker-grid" style={{ flex: 1, overflow: 'auto' }}>
          {[...Array(weeksInYear)].map((_, i) => {
            const week = i + 1;
            const isSelected = week === selectedWeek && selectedYear === selectedYear;
            const isCurrent = week === currentWeek && selectedYear === currentYear;
            
            return (
              <button 
                key={week}
                className={`week-picker-btn ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
                onClick={() => {
                  onSelectWeek(week);
                  onClose();
                }}
                aria-label={`Vecka ${week}`}
              >
                {week}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};