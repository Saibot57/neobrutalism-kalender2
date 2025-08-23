import { forwardRef } from 'react';
import { X, Save, Trash2, Repeat, Maximize2 } from 'lucide-react';
import type { FormData, FamilyMember } from '../types';
import { ResizableModal } from './ResizableModal';

interface ActivityModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: FormData;
  familyMembers: FamilyMember[];
  days: string[];
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  onFormChange: (data: FormData) => void;
}

export const ActivityModal = forwardRef<HTMLDivElement, ActivityModalProps>(
  ({ isOpen, isEditing, formData, familyMembers, days, onClose, onSave, onDelete, onFormChange }, ref) => {
    const handleDayToggle = (day: string) => {
      if (isEditing) return;
      const newDays = formData.days.includes(day)
        ? formData.days.filter(d => d !== day)
        : [...formData.days, day];
      onFormChange({ ...formData, days: newDays });
    };

    const handleParticipantToggle = (participantId: string) => {
      const newParticipants = formData.participants.includes(participantId)
        ? formData.participants.filter(p => p !== participantId)
        : [...formData.participants, participantId];
      onFormChange({ ...formData, participants: newParticipants });
    };

    return (
      <ResizableModal
        isOpen={isOpen}
        onClose={onClose}
        storageKey="activity-modal"
        minWidth={400}
        minHeight={400}
        defaultWidth={600}
        defaultHeight={600}
        ref={ref}
      >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {isEditing ? 'Redigera Aktivitet' : 'Ny Aktivitet'}
          </h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="resize-hint" title="Dra i hörnen för att ändra storlek">
              <Maximize2 size={20} />
            </div>
            <button 
              className="modal-close" 
              onClick={onClose}
              aria-label="Stäng modal"
            >
              <X size={24}/>
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* Name & Icon */}
          <div className="form-group">
            <label htmlFor="activity-icon" className="form-label">Aktivitetsnamn *</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                id="activity-icon"
                type="text" 
                className="form-input" 
                style={{ width: '60px', textAlign: 'center', fontSize: '1.5rem' }}
                value={formData.icon} 
                onChange={e => onFormChange({ ...formData, icon: e.target.value })}
                aria-label="Aktivitetsikon"
              />
              <input 
                id="activity-name"
                type="text" 
                className="form-input" 
                placeholder="T.ex. Fotboll"
                value={formData.name} 
                onChange={e => onFormChange({ ...formData, name: e.target.value })}
                aria-label="Aktivitetsnamn"
                aria-required="true"
              />
            </div>
          </div>

          {/* Days */}
          <div className="form-group">
            <label className="form-label">Välj Dagar *</label>
            <div 
              className="day-selector" 
              style={{ gridTemplateColumns: `repeat(${days.length <= 3 ? days.length : 3}, 1fr)` }}
              role="group"
              aria-label="Välj veckodagar"
            >
              {days.map(day => (
                <div 
                  key={day}
                  className={`day-checkbox ${formData.days.includes(day) ? 'selected' : ''} ${isEditing ? 'disabled' : ''}`}
                  onClick={() => handleDayToggle(day)}
                  role="checkbox"
                  aria-checked={formData.days.includes(day)}
                  tabIndex={isEditing ? -1 : 0}
                  onKeyDown={(e) => {
                    if (!isEditing && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleDayToggle(day);
                    }
                  }}
                >
                  {day.substring(0, 3).toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div className="form-group">
            <label className="form-label">Deltagare *</label>
            <div className="participants-grid" role="group" aria-label="Välj deltagare">
              {familyMembers.map(member => (
                <div 
                  key={member.id}
                  className={`participant-option ${formData.participants.includes(member.id) ? 'selected' : ''}`}
                  onClick={() => handleParticipantToggle(member.id)}
                  role="checkbox"
                  aria-checked={formData.participants.includes(member.id)}
                  aria-label={member.name}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleParticipantToggle(member.id);
                    }
                  }}
                >
                  <span>{member.icon}</span>
                  <span>{member.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Time */}
          <div className="form-group">
            <label className="form-label">Tid *</label>
            <div className="time-inputs">
              <input 
                type="time" 
                className="form-input" 
                value={formData.startTime}
                onChange={e => onFormChange({ ...formData, startTime: e.target.value })}
                aria-label="Starttid"
                aria-required="true"
              />
              <input 
                type="time" 
                className="form-input" 
                value={formData.endTime}
                onChange={e => onFormChange({ ...formData, endTime: e.target.value })}
                aria-label="Sluttid"
                aria-required="true"
              />
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label htmlFor="activity-location" className="form-label">Plats</label>
            <input 
              id="activity-location"
              type="text" 
              className="form-input" 
              placeholder="T.ex. Sporthallen"
              value={formData.location} 
              onChange={e => onFormChange({ ...formData, location: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="activity-notes" className="form-label">Anteckningar</label>
            <textarea 
              id="activity-notes"
              rows={3} 
              className="form-textarea"
              placeholder="Ytterligare information..."
              value={formData.notes} 
              onChange={e => onFormChange({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Recurring */}
          {!isEditing && (
            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  className="checkbox-input"
                  checked={formData.recurring}
                  onChange={e => onFormChange({ ...formData, recurring: e.target.checked })}
                  aria-label="Återkommande aktivitet"
                />
                <Repeat size={20}/> Återkommande aktivitet
              </label>
              {formData.recurring && (
                <div className="recurring-section">
                  <label htmlFor="recurring-end" className="form-label">Upprepa till och med</label>
                  <input 
                    id="recurring-end"
                    type="date" 
                    className="form-input"
                    value={formData.recurringEndDate}
                    onChange={e => onFormChange({ ...formData, recurringEndDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {isEditing && (
            <button 
              className="btn btn-danger" 
              onClick={onDelete}
              aria-label="Ta bort aktivitet"
            >
              <Trash2 size={20}/> Ta bort
            </button>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px' }}>
            <button className="btn" onClick={onClose}>Avbryt</button>
            <button 
              className="btn btn-success" 
              onClick={onSave}
              aria-label="Spara aktivitet"
            >
              <Save size={20}/> Spara
            </button>
          </div>
        </div>
      </ResizableModal>
    );
  }
);

ActivityModal.displayName = 'ActivityModal';