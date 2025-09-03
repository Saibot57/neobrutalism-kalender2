// src/App.tsx

import { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

// Types
import type { Activity, FormData, Settings } from './types';

// Constants
import {
  DEFAULT_FAMILY_MEMBERS,
  DEFAULT_SETTINGS,
  WEEKDAYS_FULL,
  WEEKEND_DAYS,
  ALL_DAYS
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
import { downloadAllICS } from './utils/exportUtils';

// Hooks
import { useLocalStorage, useFocusTrap } from './hooks';

// Components
import { Header } from './components/Header';
import { FamilyBar } from './components/FamilyBar';
import { WeekNavigation } from './components/WeekNavigation';
import { WeekPicker } from './components/WeekPicker';
import { ScheduleGrid } from './components/ScheduleGrid';
import { LayerView } from './components/LayerView';
import { ActivityModal } from './components/ActivityModal';
import { SettingsModal } from './components/SettingsModal';
import { DataModal } from './components/DataModal';

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
  recurringEndDate: '',
  color: undefined
};

type ViewMode = 'grid' | 'layer';

export default function App() {
  const modalRef = useRef<HTMLDivElement>(null);
  const settingsModalRef = useRef<HTMLDivElement>(null);

  const [activities, setActivities] = useLocalStorage<Activity[]>('familjens-schema-activities', []);
  const [settings, setSettings] = useLocalStorage<Settings>('familjens-schema-settings', DEFAULT_SETTINGS);
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('familjens-schema-view-mode', 'grid');

  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber(new Date()));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const currentWeek = getWeekNumber(new Date());
  const currentYear = new Date().getFullYear();
  const isCurrentWeek = selectedWeek === currentWeek && selectedYear === currentYear;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const [showConflict, setShowConflict] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(BLANK_FORM);
  const [highlightedMemberId, setHighlightedMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (!modalOpen) return;
    if (editingActivity) {
      setFormData({
        ...editingActivity,
        days: [editingActivity.day],
        recurring: false,
        recurringEndDate: '',
        location: editingActivity.location || '',
        notes: editingActivity.notes || '',
        color: editingActivity.color
      });
    } else {
      setFormData(BLANK_FORM);
    }
  }, [modalOpen, editingActivity]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modalOpen) setModalOpen(false);
        if (settingsOpen) setSettingsOpen(false);
        if (showWeekPicker) setShowWeekPicker(false);
        if (dataModalOpen) setDataModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [modalOpen, settingsOpen, showWeekPicker, dataModalOpen]);

  useFocusTrap(modalRef, modalOpen);
  useFocusTrap(settingsModalRef, settingsOpen);

  const days = settings.showWeekends
    ? [...WEEKDAYS_FULL, ...WEEKEND_DAYS]
    : WEEKDAYS_FULL;
  const timeSlots = generateTimeSlots(settings.dayStart, settings.dayEnd);
  const weekDates = getWeekDateRange(selectedWeek, selectedYear, days.length);

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

  const handleMemberClick = (memberId: string) => {
    setViewMode('layer');
    setHighlightedMemberId(memberId);
    // Rensa efter en kort stund så att effekten kan köras igen
    setTimeout(() => setHighlightedMemberId(null), 100);
  };

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
      newActivities = [{
        ...editingActivity,
        ...formData,
        day: formData.days[0],
        week: selectedWeek,
        year: selectedYear,
        color: formData.color
      }];
    } else {
      if (formData.recurring && formData.recurringEndDate) {
        const seriesId = generateActivityId(); 
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
              seriesId: seriesId, 
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
              color: formData.color
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
            color: formData.color
          });
        });
      }
    }

    if (conflictsExist(newActivities, activities)) {
      setShowConflict(true);
      setTimeout(() => setShowConflict(false), 3000);
      return;
    }

    setShowConflict(false);

    if (editingActivity) {
      setActivities(prev => prev.map(a =>
        a.id === editingActivity.id ? newActivities[0] : a
      ));
    } else {
      setActivities(prev => [...prev, ...newActivities]);
    }

    setModalOpen(false);
    setEditingActivity(null);
  };

  const handleDeleteActivity = () => {
    if (!editingActivity) return;
  
    if (editingActivity.seriesId) {
      if (window.confirm("Vill du ta bort alla kommande händelser i den här serien? \n\nTryck på 'OK' för att ta bort hela serien, eller 'Avbryt' för att bara ta bort denna enskilda händelse.")) {
        setActivities(prev => prev.filter(a => a.seriesId !== editingActivity.seriesId));
      } else {
        setActivities(prev => prev.filter(a => a.id !== editingActivity.id));
      }
    } else {
      setActivities(prev => prev.filter(a => a.id !== editingActivity.id));
    }
  
    setModalOpen(false);
    setEditingActivity(null);
  };

  const handleActivityClick = (activity: Activity) => {
    setEditingActivity(activity);
    setModalOpen(true);
  };

  const handleExportAllJSON = () => {
    const dataToExport = activities.map(a => {
      const weekDatesForActivity = getWeekDateRange(a.week, a.year, 7);
      const dayIndex = ALL_DAYS.indexOf(a.day);
      const activityDate = weekDatesForActivity[dayIndex];
  
      return {
        name: a.name,
        icon: a.icon,
        date: activityDate.toISOString().split('T')[0], // Format YYYY-MM-DD
        participants: a.participants,
        startTime: a.startTime,
        endTime: a.endTime,
        location: a.location || undefined,
        notes: a.notes || undefined,
        color: a.color || undefined
      };
    });
  
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'familjens-schema-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDataModalOpen(false);
  };
  
  const handleExportAllICS = () => {
    downloadAllICS(activities);
    setDataModalOpen(false);
  };

  const processJsonText = (text: string) => {
    try {
      const importedData = JSON.parse(text) as Array<Partial<Activity> & { date?: string; startDate?: string; recurringEndDate?: string; day?: string }>;

      if (!Array.isArray(importedData)) {
        throw new Error("Invalid JSON format: must be an array.");
      }

      const newActivities: Activity[] = [];

      importedData.forEach(item => {
        if (item.startDate && item.recurringEndDate && item.day) {
          const seriesId = generateActivityId();
          const startDate = new Date(item.startDate);
          const endDate = new Date(item.recurringEndDate);
          const dayOfWeek = ALL_DAYS.indexOf(item.day);
          if (dayOfWeek === -1) return;
          let cursor = new Date(startDate);
          while ((cursor.getDay() + 6) % 7 !== dayOfWeek) {
            cursor.setDate(cursor.getDate() + 1);
          }

          while (cursor <= endDate) {
            newActivities.push({
              id: generateActivityId(),
              seriesId: seriesId,
              name: item.name || 'Unnamed Event',
              icon: item.icon || '📅',
              day: item.day,
              week: getWeekNumber(cursor),
              year: cursor.getFullYear(),
              participants: item.participants || [],
              startTime: item.startTime || '00:00',
              endTime: item.endTime || '01:00',
              location: item.location,
              notes: item.notes,
              color: item.color
            });
            cursor.setDate(cursor.getDate() + 7);
          }
        } else if (item.date) {
          const activityDate = new Date(item.date);
          const dayOfWeek = (activityDate.getDay() + 6) % 7;
          const dayName = ALL_DAYS[dayOfWeek];
          newActivities.push({
            id: item.id || generateActivityId(),
            name: item.name || 'Unnamed Event',
            icon: item.icon || '📅',
            day: dayName,
            week: getWeekNumber(activityDate),
            year: activityDate.getFullYear(),
            participants: item.participants || [],
            startTime: item.startTime || '00:00',
            endTime: item.endTime || '01:00',
            location: item.location,
            notes: item.notes,
            color: item.color
          });
        }
      });

      if (conflictsExist(newActivities, activities)) {
        setShowConflict(true);
        setTimeout(() => setShowConflict(false), 3000);
        return;
      }

      setActivities(prev => [...prev, ...newActivities]);
      alert(`${newActivities.length} activities imported successfully!`);
      setDataModalOpen(false); 
    } catch (error: any) {
        console.error("Error importing activities:", error);
        alert(`Failed to import activities. Please check the data format.\n\nError: ${error.message}`);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        processJsonText(text);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleTextImport = (jsonText: string) => {
    processJsonText(jsonText);
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
        <FamilyBar
          members={DEFAULT_FAMILY_MEMBERS}
          viewMode={viewMode}
          onSetViewMode={setViewMode}
          onMemberClick={handleMemberClick}
        />

        <WeekNavigation
          isCurrentWeek={isCurrentWeek}
          onNavigateWeek={navigateWeek}
          onGoToCurrentWeek={goToCurrentWeek}
          onToggleWeekPicker={() => setShowWeekPicker(!showWeekPicker)}
          onOpenDataModal={() => setDataModalOpen(true)}
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
        
        {viewMode === 'grid' ? (
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
        ) : (
          <LayerView
            days={days}
            weekDates={weekDates}
            timeSlots={timeSlots}
            activities={activities}
            familyMembers={DEFAULT_FAMILY_MEMBERS}
            settings={settings}
            selectedWeek={selectedWeek}
            selectedYear={selectedYear}
            onActivityClick={handleActivityClick}
            highlightedMemberId={highlightedMemberId}
          />
        )}

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
        <DataModal
          isOpen={dataModalOpen}
          onClose={() => setDataModalOpen(false)}
          onFileImport={handleFileImport}
          onTextImport={handleTextImport}
          onExportJSON={handleExportAllJSON}
          onExportICS={handleExportAllICS}
        />
      </div>
    </div>
  );
}