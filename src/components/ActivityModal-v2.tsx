import { forwardRef, useState } from 'react';
import { X, Save, Trash2, Repeat, Palette } from 'lucide-react';
import type { FormData, FamilyMember } from '../types';
import { SizeableModal } from './SizeableModal';
import { IconPicker } from './IconPicker';
import { IconRenderer } from './IconRenderer';
import { getActivityColors, createStripedPattern } from '../utils/colorUtils';
import { ACTIVITY_COLORS } from '../constants';

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
    const [showIconPicker, setShowIconPicker] = useState(false);

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

    const handleIconSelect = (icon: string, type: 'emoji' | 'lucide' | 'custom') => {
      onFormChange({ ...formData, icon, iconType: type });
      setShowIconPicker(false);
    };

    return (
      <>
        <SizeableModal
          isOpen={isOpen}
          onClose={onClose}
          storageKey="activity-modal"
          defaultSize="medium"
          allowedSizes={['small', 'medium', 'large']}
          ref={ref}
        >
          <div className="modal-header">
            <h2 id="modal-title" className="modal-title">
              {isEditing ? 'Redigera Aktivitet' : 'Ny Aktivitet'}
            </h2>
            <button 
              className="modal-close" 
              onClick={onClose}
              aria-label="Stäng modal"
            >
              <X size={24}/>
            </button>
          </div>

          <div className="modal-body">
            {/* Name & Icon */}
            <div className="form-group">
              <label htmlFor="activity-name" className="form-label">Aktivitetsnamn *</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="icon-select-btn"
                  onClick={() => setShowIconPicker(true)}
                  title="Välj ikon"
                >
                  <IconRenderer icon={formData.icon} iconType={formData.iconType || 'emoji'} size={24} />
                </button>
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
                    style={{
                      borderLeft: `5px solid ${member.color}`,
                      background: formData.participants.includes(member.id) 
                        ? `var(--neo-green)` 
                        : undefined
                    }}
                  >
                    <IconRenderer 
                      icon={member.icon} 
                      iconType={member.iconType || 'emoji'} 
                      size={20}
                    />
                    <span>{member.name}</span>
                    {member.isAdult !== undefined && (
                      <span className="participant-type-badge">
                        {member.isAdult ? 'V' : 'B'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Color Preview and Custom Color */}
            <div className="form-group">
              <label className="form-label">Färg</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <div 
                  className="color-preview"
                  style={{
                    width: '60px',
                    height: '40px',
                    border: '3px solid var(--neo-black)',
                    boxShadow: 'var(--shadow-sm)',
                    ...(!formData.useCustomColor && formData.participants.length > 0 
                      ? createStripedPattern(getActivityColors(formData.participants, familyMembers))
                      : { background: formData.useCustomColor ? formData.customColor : '#E0E0E0' })
                  }}
                />
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  {formData.useCustomColor 
                    ? 'Anpassad färg' 
                    : formData.participants.length > 0 
                      ? formData.participants.length === 1
                        ? 'Färg från deltagare'
                        : `${formData.participants.length} deltagares färger (diagonal)`
                      : 'Välj deltagare för färg'}
                </span>
              </div>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  className="checkbox-input"
                  checked={formData.useCustomColor}
                  onChange={e => onFormChange({ ...formData, useCustomColor: e.target.checked })}
                  aria-label="Använd anpassad färg"
                />
                <Palette size={20}/> Använd anpassad färg
              </label>
              {formData.useCustomColor && (
                <div style={{ marginTop: '10px' }}>
                  <input 
                    type="color" 
                    className="form-input" 
                    style={{ width: '100%', height: '40px' }}
                    value={formData.customColor} 
                    onChange={e => onFormChange({ ...formData, customColor: e.target.value })}
                    aria-label="Välj anpassad färg"
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {ACTIVITY_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        className="color-preset"
                        style={{ background: color }}
                        onClick={(e) => {
                          e.preventDefault();
                          onFormChange({ ...formData, customColor: color });
                        }}
                        aria-label={`Välj färg ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}
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
        </SizeableModal>

        {/* Icon Picker Modal */}
        {showIconPicker && (
          <IconPicker
            currentIcon={formData.icon}
            currentIconType={formData.iconType || 'emoji'}
            onSelectIcon={handleIconSelect}
            onClose={() => setShowIconPicker(false)}
          />
        )}
      </>
    );
  }
);

ActivityModal.displayName = 'ActivityModal';