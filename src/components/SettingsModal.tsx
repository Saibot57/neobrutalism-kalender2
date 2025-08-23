import { forwardRef } from 'react';
import { X, Save, Maximize2 } from 'lucide-react';
import type { Settings } from '../types';
import { ResizableModal } from './ResizableModal';

interface SettingsModalProps {
  isOpen: boolean;
  settings: Settings;
  onClose: () => void;
  onSettingsChange: (settings: Settings) => void;
}

export const SettingsModal = forwardRef<HTMLDivElement, SettingsModalProps>(
  ({ isOpen, settings, onClose, onSettingsChange }, ref) => {
    const handleSave = () => {
      onClose();
    };

    return (
      <ResizableModal
        isOpen={isOpen}
        onClose={onClose}
        storageKey="settings-modal"
        minWidth={350}
        minHeight={300}
        defaultWidth={500}
        defaultHeight={400}
        ref={ref}
      >
        <div className="modal-header">
          <h2 id="settings-title" className="modal-title">Inställningar</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="resize-hint" title="Dra i hörnen för att ändra storlek">
              <Maximize2 size={20} />
            </div>
            <button 
              className="modal-close" 
              onClick={onClose}
              aria-label="Stäng inställningar"
            >
              <X size={24}/>
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* Weekends */}
          <div className="form-group">
            <label className="form-label">Arbetsdagar</label>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                className="checkbox-input"
                checked={settings.showWeekends}
                onChange={e => onSettingsChange({ ...settings, showWeekends: e.target.checked })}
                aria-label="Inkludera helger"
              />
              Inkludera lör/sön
            </label>
          </div>

          {/* Hour range */}
          <div className="form-group">
            <label className="form-label">Tidsintervall (start–slut)</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="number" 
                className="form-input"
                value={settings.dayStart} 
                min="0" 
                max="23"
                onChange={e => onSettingsChange({ ...settings, dayStart: Number(e.target.value) })}
                aria-label="Starttimme"
              />
              <input 
                type="number" 
                className="form-input"
                value={settings.dayEnd} 
                min={settings.dayStart + 1} 
                max="23"
                onChange={e => onSettingsChange({ ...settings, dayEnd: Number(e.target.value) })}
                aria-label="Sluttimme"
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-success" 
            onClick={handleSave}
            aria-label="Spara inställningar"
          >
            <Save size={20}/> Spara
          </button>
        </div>
      </ResizableModal>
    );
  }
);

SettingsModal.displayName = 'SettingsModal';