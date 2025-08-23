import { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

// Types
import type { Activity, FormData, Settings } from './types';

// Constants
import { 
  DEFAULT_FAMILY_MEMBERS, 
  ACTIVITY_COLORS, 
  DEFAULT_SETTINGS,
  WEEKDAYS_FULL,
  WEEKEND_DAYS
} from './constants';

// Utils
import { 
  getWeekNumber, 
  getWeekDateRange, 
  isWeekInPast, 
  isWeekInFuture 
} from './utils/dateUtils';
import { 
  generateTimeSlots, 
  conflictsExist, 
  generateActivityId 
} from './utils/scheduleUtils';
import { downloadICS } from './utils/exportUtils';

// Hooks
import { useLocalStorage, useFocusTrap } from './hooks';

// Components
import { Header } from './components/Header';
import { FamilyBar } from './components/FamilyBar';
import { WeekNavigation } from './components/WeekNavigation';
import { WeekPicker } from './components/WeekPicker';
import { ScheduleGrid } from './components/ScheduleGrid';
import { ActivityModal } from './components/ActivityModal';
import { SettingsModal } from './components/SettingsModal';

// Styles
import './styles/neobrutalism.css';

const BLANK_FORM: FormData = {
  name: '',
  icon: '🎯',
  days: [],
  participants: [],
  startTime: '09:00',
  endTime: '10:00',
  location: '',
  notes: '',
  recurring: false,
  recurringEndDate: ''
};

export default function App() {
  // Refs for focus trap
  const modalRef = useRef<HTMLDivElement>(null);
  const settingsModalRef = useRef<HTMLDivElement>(null);

  // Persistent state
  const [activities, setActivities] = useLocalStorage<Activity[]>('familjens-schema-activities', []);
  const [settings, setSettings] = useLocalStorage<Settings>('familjens-schema-settings', DEFAULT_SETTINGS);

  // Calendar navigation
  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber(new Date()));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const currentWeek = getWeekNumber(new Date());
  const currentYear = new Date().getFullYear();
  const isCurrentWeek = selectedWeek === currentWeek && selectedYear === currentYear;

  // UI state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const [showConflict, setShowConflict] = useState(false);
  const [clipboardWeek, setClipboardWeek] = useState<{ week: number; year: number } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>(BLANK_FORM);

  // Initialize form data when modal opens
  useEffect(() => {
    if (!modalOpen) return;
    if (editingActivity) {
      setFormData({
        ...editingActivity,
        days: [editingActivity.day],
        recurring: false,
        recurringEndDate: '',
        location: editingActivity.location || '',
        notes: editingActivity.notes || ''
      });
    } else {
      setFormData(BLANK_FORM);
    }
  }, [modalOpen, editingActivity]);

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modalOpen) setModalOpen(false);
        if (settingsOpen) setSettingsOpen(false);
        if (showWeekPicker) setShowWeekPicker(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [modalOpen, settingsOpen, showWeekPicker]);

  // Focus traps
  useFocusTrap(modalRef, modalOpen);
  useFocusTrap(settingsModalRef, settingsOpen);

  // Derived data
  const days = settings.showWeekends 
    ? [...WEEKDAYS_FULL, ...WEEKEND_DAYS]
    : WEEKDAYS_FULL;
  const timeSlots = generateTimeSlots(settings.dayStart, settings.dayEnd);
  const weekDates = getWeekDateRange(selectedWeek, selectedYear, days.length);

  // Navigation
  const navigateWeek = (direction: number) => {
    const monday = getWeekDateRange(selectedWeek, selectedYear, 1)[0];
    monday.setDate(monday.getDate() + direction * 7);
    setSelectedWeek(getWeekNumber(monday));
    setSelectedYear(monday.getFullYear());
  };

  const goToCurrentWeek = () => {
    setSelectedWeek(currentWeek);
    setSelectedYear(currentYear);
  };

  // Activity management
  const handleSaveActivity = () => {
    if (!formData.name || formData.days.length === 0 || formData.participants.length === 0) {
      alert('Fyll i alla obligatoriska fält!');
      return;
    }
    if (formData.endTime <= formData.startTime) {
      alert('Sluttid måste vara efter starttid.');
      return;
    }

    let newActivities: Activity[] = [];

    if (editingActivity) {
      // Update existing activity
      newActivities = [{
        ...editingActivity,
        ...formData,
        day: formData.days[0],
        week: selectedWeek,
        year: selectedYear
      }];
    } else {
      // Create new activities
      if (formData.recurring && formData.recurringEndDate) {
        const endDate = new Date(formData.recurringEndDate);
        const cursor = new Date(weekDates[0]);
        const weeks: { week: number; year: number }[] = [];

        while (cursor <= endDate) {
          weeks.push({
            week: getWeekNumber(cursor),
            year: cursor.getFullYear()
          });
          cursor.setDate(cursor.getDate() + 7);
        }

        weeks.forEach(({ week, year }) => {
          formData.days.forEach(day => {
            newActivities.push({
              id: generateActivityId(),
              name: formData.name,
              icon: formData.icon,
              day,
              week,
              year,
              participants: formData.participants,
              startTime: formData.startTime,
              endTime: formData.endTime,
              location: formData.location,
              notes: formData.notes,
              color: ACTIVITY_COLORS[Math.floor(Math.random() * ACTIVITY_COLORS.length)]
            });
          });
        });
      } else {
        formData.days.forEach(day => {
          newActivities.push({
            id: generateActivityId(),
            name: formData.name,
            icon: formData.icon,
            day,
            week: selectedWeek,
            year: selectedYear,
            participants: formData.participants,
            startTime: formData.startTime,
            endTime: formData.endTime,
            location: formData.location,
            notes: formData.notes,
            color: ACTIVITY_COLORS[Math.floor(Math.random() * ACTIVITY_COLORS.length)]
          });
        });
      }
    }

    // Check for conflicts
    if (conflictsExist(newActivities, activities)) {
      setShowConflict(true);
      setTimeout(() => setShowConflict(false), 5000);
      return;
    }

    setShowConflict(false);

    // Save activities
    if (editingActivity) {
      setActivities((prev: Activity[]) => prev.map((a: Activity) => 
        a.id === editingActivity.id ? newActivities[0] : a
      ));
    } else {
      setActivities((prev: Activity[]) => [...prev, ...newActivities]);
    }

    setModalOpen(false);
    setEditingActivity(null);
  };

  const handleDeleteActivity = () => {
    if (editingActivity) {
      setActivities((prev: Activity[]) => prev.filter((a: Activity) => a.id !== editingActivity.id));
      setModalOpen(false);
      setEditingActivity(null);
    }
  };

  const handleActivityClick = (activity: Activity) => {
    setEditingActivity(activity);
    setModalOpen(true);
  };

  // Copy/Paste functionality
  const handleCopyWeek = () => {
    setClipboardWeek({ week: selectedWeek, year: selectedYear });
  };

  const handlePasteWeek = () => {
    if (!clipboardWeek) return;

    const copiedActivities = activities
      .filter((a: Activity) => a.week === clipboardWeek.week && a.year === clipboardWeek.year)
      .map((a: Activity) => ({
        ...a,
        id: generateActivityId(),
        week: selectedWeek,
        year: selectedYear
      }));

    if (conflictsExist(copiedActivities, activities)) {
      setShowConflict(true);
      setTimeout(() => setShowConflict(false), 5000);
      return;
    }

    setShowConflict(false);
    setActivities((prev: Activity[]) => [...prev, ...copiedActivities]);
    setClipboardWeek(null);
  };

  const handleExportWeek = () => {
    downloadICS(activities, selectedWeek, selectedYear, weekDates, days);
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <Header
          selectedWeek={selectedWeek}
          selectedYear={selectedYear}
          weekDates={weekDates}
          onNewActivity={() => {
            setEditingActivity(null);
            setModalOpen(true);
          }}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <FamilyBar members={DEFAULT_FAMILY_MEMBERS} />

        <WeekNavigation
          isCurrentWeek={isCurrentWeek}
          clipboardWeek={clipboardWeek}
          selectedWeek={selectedWeek}
          selectedYear={selectedYear}
          onNavigateWeek={navigateWeek}
          onGoToCurrentWeek={goToCurrentWeek}
          onToggleWeekPicker={() => setShowWeekPicker(!showWeekPicker)}
          onCopyWeek={handleCopyWeek}
          onPasteWeek={handlePasteWeek}
          onExportWeek={handleExportWeek}
        />

        {showWeekPicker && (
          <WeekPicker
            selectedWeek={selectedWeek}
            selectedYear={selectedYear}
            onSelectWeek={setSelectedWeek}
            onChangeYear={setSelectedYear}
            onClose={() => setShowWeekPicker(false)}
          />
        )}

        {/* Notices */}
        {!isCurrentWeek && (
          <div className="notice-banner" role="alert">
            <AlertCircle size={24}/>
            Du tittar på {isWeekInPast(weekDates) ? 'en tidigare' : isWeekInFuture(weekDates) ? 'en kommande' : 'en annan'} vecka
          </div>
        )}
        {showConflict && (
          <div className="notice-banner conflict-banner" role="alert">
            <AlertCircle size={24}/> Tidskonflikt! En deltagare är redan upptagen.
          </div>
        )}

        <ScheduleGrid
          days={days}
          weekDates={weekDates}
          timeSlots={timeSlots}
          activities={activities}
          familyMembers={DEFAULT_FAMILY_MEMBERS}
          settings={settings}
          selectedWeek={selectedWeek}
          selectedYear={selectedYear}
          onActivityClick={handleActivityClick}
        />

        <ActivityModal
          ref={modalRef}
          isOpen={modalOpen}
          isEditing={!!editingActivity}
          formData={formData}
          familyMembers={DEFAULT_FAMILY_MEMBERS}
          days={days}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveActivity}
          onDelete={handleDeleteActivity}
          onFormChange={setFormData}
        />

        <SettingsModal
          ref={settingsModalRef}
          isOpen={settingsOpen}
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onSettingsChange={setSettings}
        />
      </div>
    </div>
  );
}