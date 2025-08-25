import { forwardRef, useState } from 'react';
import { X, Save, Plus, Edit2, Trash2, UserPlus, Users, Baby } from 'lucide-react';
import type { Settings, FamilyMember } from '../types';
import { SizeableModal } from './SizeableModal';
import { IconPicker } from './IconPicker';
import { IconRenderer } from './IconRenderer';
import { ACTIVITY_COLORS } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  settings: Settings;
  onClose: () => void;
  onSettingsChange: (settings: Settings) => void;
}

interface MemberFormData {
  name: string;
  icon: string;
  iconType: 'emoji' | 'lucide' | 'custom';
  color: string;
  isAdult: boolean;
}

export const SettingsModal = forwardRef<HTMLDivElement, SettingsModalProps>(
  ({ isOpen, settings, onClose, onSettingsChange }, ref) => {
    const [editingMember, setEditingMember] = useState<string | null>(null);
    const [memberForm, setMemberForm] = useState<MemberFormData>({ 
      name: '', 
      icon: '👤', 
      iconType: 'emoji',
      color: ACTIVITY_COLORS[0],
      isAdult: true
    });
    const [showAddMember, setShowAddMember] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);

    const handleSave = () => {
      onClose();
    };

    const handleAddMember = () => {
      if (!memberForm.name.trim()) {
        alert('Ange ett namn för familjemedlemmen');
        return;
      }

      const newMember: FamilyMember = {
        id: `member-${Date.now()}`,
        name: memberForm.name,
        icon: memberForm.icon,
        iconType: memberForm.iconType,
        color: memberForm.color,
        isAdult: memberForm.isAdult
      };

      onSettingsChange({
        ...settings,
        familyMembers: [...settings.familyMembers, newMember]
      });

      setMemberForm({ name: '', icon: '👤', iconType: 'emoji', color: ACTIVITY_COLORS[0], isAdult: true });
      setShowAddMember(false);
    };

    const handleEditMember = (member: FamilyMember) => {
      setEditingMember(member.id);
      setMemberForm({
        name: member.name,
        icon: member.icon,
        iconType: member.iconType || 'emoji',
        color: member.color,
        isAdult: member.isAdult ?? true
      });
    };

    const handleUpdateMember = (memberId: string) => {
      if (!memberForm.name.trim()) {
        alert('Ange ett namn för familjemedlemmen');
        return;
      }

      onSettingsChange({
        ...settings,
        familyMembers: settings.familyMembers.map(m => 
          m.id === memberId 
            ? { 
                ...m, 
                name: memberForm.name, 
                icon: memberForm.icon,
                iconType: memberForm.iconType,
                color: memberForm.color,
                isAdult: memberForm.isAdult
              }
            : m
        )
      });

      setEditingMember(null);
      setMemberForm({ name: '', icon: '👤', iconType: 'emoji', color: ACTIVITY_COLORS[0], isAdult: true });
    };

    const handleDeleteMember = (memberId: string) => {
      if (settings.familyMembers.length <= 1) {
        alert('Du måste ha minst en familjemedlem');
        return;
      }

      if (confirm('Är du säker på att du vill ta bort denna familjemedlem? Alla aktiviteter med denna person kommer också att påverkas.')) {
        onSettingsChange({
          ...settings,
          familyMembers: settings.familyMembers.filter(m => m.id !== memberId)
        });
      }
    };

    const handleCancelEdit = () => {
      setEditingMember(null);
      setShowAddMember(false);
      setMemberForm({ name: '', icon: '👤', iconType: 'emoji', color: ACTIVITY_COLORS[0], isAdult: true });
    };

    const handleIconSelect = (icon: string, type: 'emoji' | 'lucide' | 'custom') => {
      setMemberForm({ ...memberForm, icon, iconType: type });
      setShowIconPicker(false);
    };

    return (
      <>
        <SizeableModal
          isOpen={isOpen}
          onClose={onClose}
          storageKey="settings-modal"
          defaultSize="medium"
          allowedSizes={['small', 'medium', 'large']}
          ref={ref}
        >
          <div className="modal-header">
            <h2 id="settings-title" className="modal-title">Inställningar</h2>
            <button 
              className="modal-close" 
              onClick={onClose}
              aria-label="Stäng inställningar"
            >
              <X size={24}/>
            </button>
          </div>

          <div className="modal-body">
            {/* Family Members Section */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <label className="form-label" style={{ margin: 0 }}>Familjemedlemmar</label>
                {!showAddMember && (
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                    onClick={() => setShowAddMember(true)}
                  >
                    <UserPlus size={18}/> Lägg till
                  </button>
                )}
              </div>

              {/* Add Member Form */}
              {showAddMember && (
                <div className="member-edit-form">
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <button
                      className="icon-select-btn"
                      onClick={() => setShowIconPicker(true)}
                      title="Välj ikon"
                    >
                      <IconRenderer icon={memberForm.icon} iconType={memberForm.iconType} size={24} />
                    </button>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Namn"
                      value={memberForm.name} 
                      onChange={e => setMemberForm({ ...memberForm, name: e.target.value })}
                      aria-label="Namn"
                    />
                    <input 
                      type="color" 
                      className="form-input" 
                      style={{ width: '60px' }}
                      value={memberForm.color} 
                      onChange={e => setMemberForm({ ...memberForm, color: e.target.value })}
                      aria-label="Färg"
                    />
                  </div>
                  <div className="member-type-selector">
                    <button
                      className={`type-btn ${memberForm.isAdult ? 'active' : ''}`}
                      onClick={() => setMemberForm({ ...memberForm, isAdult: true })}
                    >
                      <Users size={16} /> Vuxen
                    </button>
                    <button
                      className={`type-btn ${!memberForm.isAdult ? 'active' : ''}`}
                      onClick={() => setMemberForm({ ...memberForm, isAdult: false })}
                    >
                      <Baby size={16} /> Barn
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button 
                      className="btn btn-success" 
                      style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                      onClick={handleAddMember}
                    >
                      <Plus size={18}/> Lägg till
                    </button>
                    <button 
                      className="btn" 
                      style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                      onClick={handleCancelEdit}
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              )}

              {/* Members List */}
              <div className="members-list">
                {settings.familyMembers.map(member => (
                  <div key={member.id} className="member-item">
                    {editingMember === member.id ? (
                      <div className="member-edit-form">
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                          <button
                            className="icon-select-btn"
                            onClick={() => setShowIconPicker(true)}
                            title="Välj ikon"
                          >
                            <IconRenderer icon={memberForm.icon} iconType={memberForm.iconType} size={24} />
                          </button>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={memberForm.name} 
                            onChange={e => setMemberForm({ ...memberForm, name: e.target.value })}
                            aria-label="Namn"
                          />
                          <input 
                            type="color" 
                            className="form-input" 
                            style={{ width: '60px' }}
                            value={memberForm.color} 
                            onChange={e => setMemberForm({ ...memberForm, color: e.target.value })}
                            aria-label="Färg"
                          />
                        </div>
                        <div className="member-type-selector">
                          <button
                            className={`type-btn ${memberForm.isAdult ? 'active' : ''}`}
                            onClick={() => setMemberForm({ ...memberForm, isAdult: true })}
                          >
                            <Users size={16} /> Vuxen
                          </button>
                          <button
                            className={`type-btn ${!memberForm.isAdult ? 'active' : ''}`}
                            onClick={() => setMemberForm({ ...memberForm, isAdult: false })}
                          >
                            <Baby size={16} /> Barn
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <button 
                            className="btn btn-success" 
                            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                            onClick={() => handleUpdateMember(member.id)}
                          >
                            <Save size={18}/> Spara
                          </button>
                          <button 
                            className="btn" 
                            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                            onClick={handleCancelEdit}
                          >
                            Avbryt
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="member-display">
                        <div className="member-info">
                          <IconRenderer icon={member.icon} iconType={member.iconType || 'emoji'} size={24} />
                          <span className="member-color" style={{ background: member.color }}></span>
                          <span className="member-name">{member.name}</span>
                          <span className="member-badge-type">
                            {member.isAdult ? <Users size={14} /> : <Baby size={14} />}
                            {member.isAdult ? 'Vuxen' : 'Barn'}
                          </span>
                        </div>
                        <div className="member-actions">
                          <button 
                            className="btn btn-icon btn-small"
                            onClick={() => handleEditMember(member)}
                            aria-label={`Redigera ${member.name}`}
                          >
                            <Edit2 size={16}/>
                          </button>
                          <button 
                            className="btn btn-icon btn-small btn-danger"
                            onClick={() => handleDeleteMember(member.id)}
                            aria-label={`Ta bort ${member.name}`}
                            disabled={settings.familyMembers.length <= 1}
                          >
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <hr style={{ margin: '30px 0', border: 'none', borderTop: '3px solid var(--neo-black)' }} />

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
              <Save size={20}/> Stäng
            </button>
          </div>
        </SizeableModal>

        {/* Icon Picker Modal */}
        {showIconPicker && (
          <IconPicker
            currentIcon={memberForm.icon}
            currentIconType={memberForm.iconType}
            onSelectIcon={handleIconSelect}
            onClose={() => setShowIconPicker(false)}
          />
        )}
      </>
    );
  }
);

SettingsModal.displayName = 'SettingsModal';