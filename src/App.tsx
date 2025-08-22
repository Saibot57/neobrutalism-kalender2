/* ============================================================================
   App.js – "Familjens Schema" (with fixes for navigation, overlaps, accessibility)
   • Year selector in week picker with 53-week support
   • Visual overlap resolution (side-by-side layout)
   • Full accessibility (Esc key, focus trap, ARIA labels)
   • Smoother year boundary navigation
============================================================================ */

import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar, Plus, ChevronLeft, ChevronRight, Settings,
  Copy, Download, Upload, X, Save, Trash2, Clock,
  MapPin, Users, AlertCircle, Home, Repeat, Search
} from 'lucide-react';

/* ---------------------------------------------------------------------------
   1.  GLOBAL  STYLES  (neobrutalism) – cleaned up
--------------------------------------------------------------------------- */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');

* { margin:0; padding:0; box-sizing:border-box; }
:root {
  --neo-black:#000; --neo-white:#FFF; --neo-purple:#A020F0; --neo-pink:#FF6B6B;
  --neo-yellow:#FFD93D; --neo-green:#6BCF7F; --neo-blue:#4E9FFF; --neo-orange:#FF9F45;
  --neo-cyan:#00D9FF; --neo-red:#FF4757; --neo-bg:#F7F3F0;
  --shadow-sm:2px 2px 0px var(--neo-black);
  --shadow-md:4px 4px 0px var(--neo-black);
  --shadow-lg:6px 6px 0px var(--neo-black);
  --shadow-xl:8px 8px 0px var(--neo-black);
}

body { font-family:'Space Grotesk', monospace; background:var(--neo-bg); color:var(--neo-black); line-height:1.5; }
.app-container{ min-height:100vh; padding:20px; background:var(--neo-bg); }
.content-wrapper{ max-width:1400px; margin:0 auto; }

/* ===== header + buttons ================================================== */
.header{ background:var(--neo-white); border:3px solid var(--neo-black); padding:30px; margin-bottom:30px; box-shadow:var(--shadow-lg); }
.header-top{ display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; flex-wrap:wrap; gap:20px; }
.logo-section{ display:flex; align-items:center; gap:20px; }
.logo-icon{ width:60px; height:60px; background:var(--neo-yellow); border:3px solid var(--neo-black); display:flex; align-items:center; justify-content:center; font-size:28px; transform:rotate(-5deg); box-shadow:var(--shadow-md); }
h1{ font-size:2.5rem; font-weight:700; text-transform:uppercase; letter-spacing:-1px; }
.week-info{ font-size:1rem; font-weight:500; opacity:.8; margin-top:5px; }

.btn{ background:var(--neo-white); border:3px solid var(--neo-black); padding:12px 24px; font-family:'Space Grotesk', monospace; font-weight:700; font-size:1rem; text-transform:uppercase; cursor:pointer; transition:.1s; box-shadow:var(--shadow-md); display:inline-flex; align-items:center; gap:10px; }
.btn:hover{ transform:translate(-2px,-2px); box-shadow:6px 6px 0 var(--neo-black); }
.btn:active{ transform:none; box-shadow:var(--shadow-sm); }
.btn-primary{ background:var(--neo-purple); color:var(--neo-white); }
.btn-success{ background:var(--neo-green); }
.btn-danger{ background:var(--neo-pink); color:var(--neo-white); }
.btn-warning{ background:var(--neo-yellow); }
.btn-info{ background:var(--neo-cyan); }
.btn-icon{ width:50px; height:50px; padding:0; display:flex; align-items:center; justify-content:center; }
.btn-group{ display:flex; gap:15px; flex-wrap:wrap; }

/* ===== family bar ======================================================== */
.family-bar{ background:var(--neo-white); border:3px solid var(--neo-black); padding:20px; margin-bottom:25px; display:flex; justify-content:space-between; align-items:center; box-shadow:var(--shadow-md); flex-wrap:wrap; gap:20px; }
.family-members{ display:flex; gap:20px; flex-wrap:wrap; }
.member-badge{ background:var(--neo-white); border:2px solid var(--neo-black); padding:8px 16px; display:flex; align-items:center; gap:8px; font-weight:700; box-shadow:3px 3px 0 var(--neo-black); transition:.1s; }
.member-badge:hover{ transform:translate(-1px,-1px); box-shadow:4px 4px 0 var(--neo-black); }
.member-dot{ width:20px; height:20px; border:2px solid var(--neo-black); display:inline-block; }

/* ===== week nav + picker ================================================== */
.week-nav{ background:var(--neo-white); border:3px solid var(--neo-black); padding:20px; margin-bottom:30px; box-shadow:var(--shadow-md); }
.week-nav-content{ display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px; }
.week-picker{ background:var(--neo-bg); border:3px solid var(--neo-black); padding:20px; margin-top:20px; box-shadow:var(--shadow-md); }
.week-picker-header{ display:flex; align-items:center; gap:15px; margin-bottom:20px; }
.year-selector{ display:flex; align-items:center; gap:10px; }
.week-picker-grid{ display:grid; grid-template-columns:repeat(13,1fr); gap:8px; margin-top:15px; }
.week-picker-btn{ padding:10px; border:2px solid var(--neo-black); background:var(--neo-white); font-weight:700; cursor:pointer; transition:.1s; }
.week-picker-btn:hover{ background:var(--neo-yellow); transform:translate(-1px,-1px); box-shadow:var(--shadow-sm); }
.week-picker-btn.selected{ background:var(--neo-purple); color:var(--neo-white); }
.week-picker-btn.current{ background:var(--neo-green); }

/* ===== notices =========================================================== */
.notice-banner{ background:var(--neo-yellow); border:3px solid var(--neo-black); padding:15px; margin-bottom:20px; display:flex; align-items:center; gap:10px; font-weight:700; box-shadow:var(--shadow-md); }
.conflict-banner{ background:var(--neo-pink); color:var(--neo-white); }

/* ===== schedule grid ===================================================== */
.schedule-container{ background:var(--neo-white); border:3px solid var(--neo-black); box-shadow:var(--shadow-xl); overflow:auto; }
.schedule-grid{ display:grid; min-width:800px; }
.time-column{ background:var(--neo-yellow); border-right:3px solid var(--neo-black); position:sticky; left:0; z-index:10; }
.time-header{ height:80px; border-bottom:3px solid var(--neo-black); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1.2rem; background:var(--neo-purple); color:var(--neo-white); }
.time-slot{ height:60px; border-bottom:2px solid var(--neo-black); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:.9rem; }
.day-column{ border-right:2px solid var(--neo-black); position:relative; background:var(--neo-white); }
.day-column:last-child{ border-right:none; }
.day-header{ height:80px; border-bottom:3px solid var(--neo-black); display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:700; background:var(--neo-cyan); position:relative; overflow:hidden; }
.day-header.today{ background:var(--neo-pink); color:var(--neo-white); }
.day-name{ font-size:1.3rem; text-transform:uppercase; z-index:1; }
.day-date{ font-size:.9rem; opacity:.8; z-index:1; }
.day-content{ position:relative; }

/* ===== activity blocks ==================================================== */
.activity-block{ position:absolute; border:2px solid var(--neo-black); padding:8px; cursor:pointer; transition:.1s; font-weight:700; font-size:.85rem; overflow:hidden; display:flex; flex-direction:column; gap:4px; }
.activity-block:hover{ transform:translate(-2px,-2px); box-shadow:4px 4px 0 var(--neo-black); z-index:10; }
.activity-name{ display:flex; align-items:center; gap:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.activity-time{ font-size:.75rem; opacity:.9; }
.activity-participants{ display:flex; gap:4px; flex-wrap:wrap; }

/* ===== modal ============================================================== */
.modal-overlay{ position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px; }
.modal{ background:var(--neo-white); border:4px solid var(--neo-black); max-width:600px; width:100%; max-height:90vh; overflow-y:auto; box-shadow:var(--shadow-xl); }
.modal-header{ background:var(--neo-purple); color:var(--neo-white); padding:20px; border-bottom:3px solid var(--neo-black); display:flex; justify-content:space-between; align-items:center; }
.modal-title{ font-size:1.5rem; font-weight:700; text-transform:uppercase; }
.modal-close{ width:40px; height:40px; background:var(--neo-white); color:var(--neo-black); border:2px solid var(--neo-black); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:.1s; }
.modal-close:hover{ background:var(--neo-yellow); transform:scale(1.1); }
.modal-body{ padding:30px; }
.form-group{ margin-bottom:25px; }
.form-label{ display:block; font-weight:700; margin-bottom:10px; text-transform:uppercase; font-size:.9rem; }
.form-input,.form-select,.form-textarea{ width:100%; padding:12px; border:3px solid var(--neo-black); font-family:'Space Grotesk', monospace; font-size:1rem; font-weight:500; background:var(--neo-white); box-shadow:var(--shadow-sm); transition:.1s; }
.form-input:focus,.form-select:focus,.form-textarea:focus{ outline:none; background:var(--neo-yellow); transform:translate(-2px,-2px); box-shadow:var(--shadow-md); }
.modal-footer{ padding:20px; border-top:3px solid var(--neo-black); display:flex; justify-content:space-between; gap:15px; background:var(--neo-bg); }

.day-selector{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
.day-checkbox{ background:var(--neo-white); border:3px solid var(--neo-black); padding:15px; text-align:center; cursor:pointer; font-weight:700; transition:.1s; box-shadow:var(--shadow-sm); }
.day-checkbox:hover{ background:var(--neo-yellow); transform:translate(-2px,-2px); box-shadow:var(--shadow-md); }
.day-checkbox.selected{ background:var(--neo-green); }
.day-checkbox.disabled{ opacity:.5; cursor:not-allowed; }

.participants-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:10px; }
.participant-option{ background:var(--neo-white); border:2px solid var(--neo-black); padding:10px; cursor:pointer; display:flex; align-items:center; gap:8px; font-weight:700; transition:.1s; box-shadow:var(--shadow-sm); }
.participant-option:hover{ transform:translate(-2px,-2px); box-shadow:var(--shadow-md); }
.participant-option.selected{ background:var(--neo-green); }

.time-inputs{ display:grid; grid-template-columns:1fr 1fr; gap:15px; }

.recurring-section{ background:var(--neo-bg); border:2px solid var(--neo-black); padding:15px; margin-top:10px; }
.checkbox-label{ display:flex; align-items:center; gap:10px; font-weight:700; cursor:pointer; }
.checkbox-input{ width:20px; height:20px; cursor:pointer; }

@media(max-width:768px){
  h1{ font-size:1.8rem; }
  .schedule-grid{ grid-template-columns:60px repeat(5,150px); }
  .day-name{ font-size:.9rem; }
  .btn{ padding:10px 16px; font-size:.9rem; }
  .day-selector{ grid-template-columns:repeat(2,1fr); }
}
`;

/* ---------------------------------------------------------------------------
   2.  HELPERS
--------------------------------------------------------------------------- */
const generateTimeSlots = (startHour = 7, endHour = 18) => {
  const slots = [];
  for (let h = startHour; h <= endHour; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
  }
  return slots;
};

const calculatePosition = (start, end, hourHeight = 60, base = 7) => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const top = ((sh - base) * 60 + sm) / 60 * hourHeight;
  const height = ((eh - sh) * 60 + (em - sm)) / 60 * hourHeight;
  return { top, height };
};

// Improved ISO week calculation
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// Get number of weeks in a year
const getWeeksInYear = (year) => {
  const lastDay = new Date(year, 11, 31);
  const week = getWeekNumber(lastDay);
  return week === 1 ? getWeekNumber(new Date(year, 11, 24)) : week;
};

const getWeekDateRange = (weekNumber, year, datesCount = 5) => {
  const jan4 = new Date(year, 0, 4);
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const monday = new Date(mondayWeek1);
  monday.setDate(mondayWeek1.getDate() + (weekNumber - 1) * 7);

  const dates = [];
  for (let i = 0; i < datesCount; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const formatWeekRange = (dates) => {
  const months = ['januari','februari','mars','april','maj','juni','juli','augusti','september','oktober','november','december'];
  const s = dates[0], e = dates[dates.length - 1];
  return s.getMonth() === e.getMonth()
    ? `${s.getDate()}-${e.getDate()} ${months[s.getMonth()]}`
    : `${s.getDate()} ${months[s.getMonth()]} ‑ ${e.getDate()} ${months[e.getMonth()]}`;
};

const overlaps = (a,b) =>
  !(a.endTime <= b.startTime || b.endTime <= a.startTime);

// Calculate overlap groups for side-by-side layout
const calculateOverlapGroups = (activities) => {
  const sorted = [...activities].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const groups = [];
  
  sorted.forEach(activity => {
    let placed = false;
    for (const group of groups) {
      if (!group.some(item => overlaps(item, activity))) {
        group.push(activity);
        placed = true;
        break;
      }
    }
    if (!placed) {
      groups.push([activity]);
    }
  });
  
  return groups;
};

/* ---------------------------------------------------------------------------
   3.  FOCUS TRAP HOOK
--------------------------------------------------------------------------- */
const useFocusTrap = (ref, isActive) => {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => element.removeEventListener('keydown', handleTabKey);
  }, [ref, isActive]);
};

/* ---------------------------------------------------------------------------
   4.  DEFAULT DATA
--------------------------------------------------------------------------- */
const defaultFamilyMembers = [
  { id:'rut', name:'Rut',   color:'#FF6B6B', icon:'👧' },
  { id:'pim', name:'Pim',   color:'#4E9FFF', icon:'👦' },
  { id:'siv', name:'Siv',   color:'#6BCF7F', icon:'👧' },
  { id:'mamma', name:'Mamma', color:'#A020F0', icon:'👩' },
  { id:'pappa', name:'Pappa', color:'#FF9F45', icon:'👨' },
];
const activityColors = ['#FFD93D','#6BCF7F','#FF6B6B','#4E9FFF','#A020F0','#FF9F45','#00D9FF','#FF4757'];

/* ---------------------------------------------------------------------------
   5.  MAIN COMPONENT
--------------------------------------------------------------------------- */
export default function App() {
  /* ---------- refs for focus trap ---------- */
  const modalRef = useRef(null);
  const settingsModalRef = useRef(null);

  /* ---------- persistence ---------------- */
  const STORAGE_KEY = 'familjens-schema-activities';
  const SETTINGS_KEY = 'familjens-schema-settings';

  const [activities,setActivities] = useState([]);
  const [settings,setSettings] = useState(() =>
    JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { showWeekends:false, dayStart:7, dayEnd:18 }
  );

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try { setActivities(JSON.parse(cached)); } catch {}
    }
  }, []);
  useEffect(()=> localStorage.setItem(STORAGE_KEY, JSON.stringify(activities)),[activities]);
  useEffect(()=> localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)),[settings]);

  /* ---------- calendar navigation -------- */
  const [selectedWeek,setSelectedWeek] = useState(getWeekNumber(new Date()));
  const [selectedYear,setSelectedYear] = useState(new Date().getFullYear());
  const currentWeek = getWeekNumber(new Date());
  const currentYear = new Date().getFullYear();
  const isCurrentWeek = selectedWeek===currentWeek && selectedYear===currentYear;
  const weeksInSelectedYear = getWeeksInYear(selectedYear);

  /* ---------- ui state ------------------- */
  const [modalOpen,setModalOpen] = useState(false);
  const [editingActivity,setEditingActivity] = useState(null);
  const [showWeekPicker,setShowWeekPicker] = useState(false);
  const [showConflict,setShowConflict] = useState(false);

  const [clipboardWeek,setClipboardWeek] = useState(null);
  const [settingsOpen,setSettingsOpen] = useState(false);

  /* ---------- form state ----------------- */
  const blankForm = { name:'', icon:'🎯', days:[], participants:[], startTime:'09:00', endTime:'10:00', location:'', notes:'', recurring:false, recurringEndDate:'' };
  const [formData,setFormData] = useState(blankForm);

  useEffect(()=>{
    if(!modalOpen) return;
    if(editingActivity){
      setFormData({...editingActivity, days:[editingActivity.day], recurring:false});
    }else{
      setFormData(blankForm);
    }
  },[modalOpen,editingActivity]);

  /* ---------- ESC key handler ------------ */
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (modalOpen) setModalOpen(false);
        if (settingsOpen) setSettingsOpen(false);
        if (showWeekPicker) setShowWeekPicker(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [modalOpen, settingsOpen, showWeekPicker]);

  /* ---------- focus traps ---------------- */
  useFocusTrap(modalRef, modalOpen);
  useFocusTrap(settingsModalRef, settingsOpen);

  /* ---------- derived data --------------- */
  const days = settings.showWeekends
    ? ['Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag','Söndag']
    : ['Måndag','Tisdag','Onsdag','Torsdag','Fredag'];

  const timeSlots = generateTimeSlots(settings.dayStart, settings.dayEnd);
  const weekDates = getWeekDateRange(selectedWeek, selectedYear, days.length);

  /* ---------- helpers -------------------- */
  const getActivitiesForDay = (day) =>
    activities
      .filter(a=>a.day===day && a.week===selectedWeek && a.year===selectedYear)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const navigateWeek = (dir) => {
    const monday = getWeekDateRange(selectedWeek, selectedYear, 1)[0];
    monday.setDate(monday.getDate() + dir * 7);
    setSelectedWeek(getWeekNumber(monday));
    setSelectedYear(monday.getFullYear());
  };

  const isToday = (date) => (new Date()).toDateString()===date.toDateString();

  // Check if selected week is in past or future
  const isWeekInPast = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return weekDates[weekDates.length - 1] < today;
  };

  const isWeekInFuture = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return weekDates[0] > today;
  };

  /* ---------- validation & save ---------- */
  const conflictsExist = (newActs) =>
    newActs.some(nA =>
      activities.some(oA =>
        oA.id !== nA.id &&
        oA.day === nA.day &&
        oA.week === nA.week &&
        oA.year === nA.year &&
        overlaps(oA, nA) &&
        nA.participants.some(p => oA.participants.includes(p))
      )
    );

  const handleSaveActivity = () => {
    if(!formData.name || formData.days.length===0 || formData.participants.length===0){
      alert('Fyll i alla obligatoriska fält!'); return;
    }
    if(formData.endTime<=formData.startTime){
      alert('Sluttid måste vara efter starttid.'); return;
    }
    let newActivities=[];
    if(editingActivity){
      newActivities=[{...formData,id:editingActivity.id,day:formData.days[0],week:selectedWeek,year:selectedYear}];
    }else{
      if(formData.recurring && formData.recurringEndDate){
        const end = new Date(formData.recurringEndDate);
        const cursor = new Date(weekDates[0]); // monday of current selected week
        const listWeeks=[];
        while(cursor<=end){
          listWeeks.push({week:getWeekNumber(cursor), year:cursor.getFullYear()});
          cursor.setDate(cursor.getDate()+7);
        }
        listWeeks.forEach(({week,year})=>{
          formData.days.forEach(day=>{
            newActivities.push({
              ...formData, id:crypto?.randomUUID?.()||`a-${Date.now()}-${Math.random()}`,
              day, week, year, color:activityColors[Math.floor(Math.random()*activityColors.length)]
            });
          });
        });
      }else{
        formData.days.forEach(day=>{
          newActivities.push({
            ...formData, id:crypto?.randomUUID?.()||`a-${Date.now()}-${Math.random()}`,
            day, week:selectedWeek, year:selectedYear,
            color:activityColors[Math.floor(Math.random()*activityColors.length)]
          });
        });
      }
    }
    if(conflictsExist(newActivities)){ setShowConflict(true); setTimeout(()=>setShowConflict(false), 5000); return; }
    setShowConflict(false);
    setActivities(prev=>{
      if(editingActivity){
        return prev.map(a=>a.id===editingActivity.id?newActivities[0]:a);
      }
      return [...prev,...newActivities];
    });
    setModalOpen(false); setEditingActivity(null);
  };

  const handleDeleteActivity = () => {
    if(editingActivity){
      setActivities(prev=>prev.filter(a=>a.id!==editingActivity.id));
      setModalOpen(false); setEditingActivity(null);
    }
  };

  /* ---------- copy / paste / export ------ */
  const handleCopyWeek = () => setClipboardWeek({week:selectedWeek,year:selectedYear});
  const handlePasteWeek = () => {
    if(!clipboardWeek) return;
    const copied = activities
      .filter(a=>a.week===clipboardWeek.week && a.year===clipboardWeek.year)
      .map(a=>({...a, id:crypto?.randomUUID?.()||`p-${Date.now()}-${Math.random()}`, week:selectedWeek, year:selectedYear}));
    if(conflictsExist(copied)){ setShowConflict(true); setTimeout(()=>setShowConflict(false), 5000); return; }
    setShowConflict(false);
    setActivities(prev=>[...prev,...copied]);
    setClipboardWeek(null);
  };
  const downloadICS = () => {
    const pad=n=>n.toString().padStart(2,'0');
    const toICS=(d,t)=>{const[h,m]=t.split(':');return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${h}${m}00`;}
    const evs=activities.filter(a=>a.week===selectedWeek&&a.year===selectedYear);
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//FamiljensSchema//SE'];
    evs.forEach(ev=>{
      const idx=days.indexOf(ev.day);
      const date=weekDates[idx];
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${ev.id}`);
      lines.push(`DTSTAMP:${toICS(new Date(),'0000')}`);
      lines.push(`DTSTART:${toICS(date,ev.startTime)}`);
      lines.push(`DTEND:${toICS(date,ev.endTime)}`);
      lines.push(`SUMMARY:${ev.icon} ${ev.name}`);
      if(ev.location) lines.push(`LOCATION:${ev.location}`);
      lines.push('END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    const blob=new Blob([lines.join('\r\n')],{type:'text/calendar'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download=`vecka-${selectedWeek}.ics`; a.click();
    URL.revokeObjectURL(url);
  };

  /* ----------------------------------------------------------------------- */
  return (
    <>
      <style>{styles}</style>

      <div className="app-container">
        <div className="content-wrapper">

          {/* -------- header ------------------------------------------------- */}
          <div className="header">
            <div className="header-top">
              <div className="logo-section">
                <div className="logo-icon">📅</div>
                <div>
                  <h1>Familjens Schema</h1>
                  <div className="week-info">
                    Vecka {selectedWeek} • {formatWeekRange(weekDates)} {selectedYear}
                  </div>
                </div>
              </div>

              <div className="btn-group">
                <button 
                  className="btn btn-primary" 
                  onClick={()=>{setEditingActivity(null); setModalOpen(true);}}
                  aria-label="Skapa ny aktivitet"
                >
                  <Plus size={20}/> Ny Aktivitet
                </button>
                <button 
                  className="btn btn-warning" 
                  onClick={()=>setSettingsOpen(true)}
                  aria-label="Öppna inställningar"
                >
                  <Settings size={20}/> Inställningar
                </button>
              </div>
            </div>
          </div>

          {/* -------- family bar ------------------------------------------- */}
          <div className="family-bar" role="region" aria-label="Familjemedlemmar">
            <div className="family-members">
              {defaultFamilyMembers.map(m=>(
                <div key={m.id} className="member-badge">
                  <span role="img" aria-label={m.name}>{m.icon}</span>
                  <span className="member-dot" style={{background:m.color}}></span>
                  <span>{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* -------- week nav --------------------------------------------- */}
          <nav className="week-nav" aria-label="Veckonavigering">
            <div className="week-nav-content">

              <div className="btn-group">
                <button 
                  className="btn btn-icon" 
                  onClick={()=>navigateWeek(-1)}
                  aria-label="Föregående vecka"
                >
                  <ChevronLeft size={24}/>
                </button>
                <button
                  className={`btn ${isCurrentWeek?'btn-success':''}`}
                  onClick={()=>{setSelectedWeek(currentWeek); setSelectedYear(currentYear);}}
                  disabled={isCurrentWeek}
                  aria-label="Gå till nuvarande vecka"
                >
                  <Home size={20}/> Denna Vecka
                </button>
                <button 
                  className="btn btn-icon" 
                  onClick={()=>navigateWeek(1)}
                  aria-label="Nästa vecka"
                >
                  <ChevronRight size={24}/>
                </button>
                <button 
                  className="btn btn-info" 
                  onClick={()=>setShowWeekPicker(!showWeekPicker)}
                  aria-label="Öppna veckoväljare"
                >
                  <Calendar size={20}/> Välj Vecka
                </button>
              </div>

              <div className="btn-group">
                <button 
                  className="btn btn-info" 
                  onClick={handleCopyWeek}
                  aria-label="Kopiera denna vecka"
                >
                  <Copy size={20}/> Kopiera
                </button>
                {clipboardWeek &&
                  (clipboardWeek.week!==selectedWeek||clipboardWeek.year!==selectedYear) && (
                  <button 
                    className="btn btn-success" 
                    onClick={handlePasteWeek}
                    aria-label="Klistra in kopierad vecka"
                  >
                    <Upload size={20}/> Klistra in
                  </button>
                )}
                <button 
                  className="btn btn-success" 
                  onClick={downloadICS}
                  aria-label="Exportera vecka som ICS"
                >
                  <Download size={20}/> Exportera
                </button>
              </div>

            </div>
          </nav>

          {/* -------- week picker with year selector ---------------------- */}
          {showWeekPicker && (
            <div className="week-picker" role="dialog" aria-label="Välj vecka och år">
              <div className="week-picker-header">
                <h3 style={{textTransform:'uppercase'}}>Välj Vecka</h3>
                <div className="year-selector">
                  <button 
                    className="btn btn-icon" 
                    onClick={()=>setSelectedYear(prev=>prev-1)}
                    aria-label="Föregående år"
                  >
                    <ChevronLeft size={20}/>
                  </button>
                  <span style={{padding:'0 15px',fontWeight:'700',fontSize:'1.2rem'}}>{selectedYear}</span>
                  <button 
                    className="btn btn-icon" 
                    onClick={()=>setSelectedYear(prev=>prev+1)}
                    aria-label="Nästa år"
                  >
                    <ChevronRight size={20}/>
                  </button>
                </div>
              </div>
              <div className="week-picker-grid">
                {[...Array(weeksInSelectedYear)].map((_,i)=>{
                  const w=i+1;
                  const selected=w===selectedWeek && selectedYear===selectedYear;
                  const current=w===currentWeek && selectedYear===currentYear;
                  return(
                    <button key={w}
                      className={`week-picker-btn ${selected?'selected':''} ${current?'current':''}`}
                      onClick={()=>{setSelectedWeek(w); setShowWeekPicker(false);}}
                      aria-label={`Vecka ${w}`}>
                      {w}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* -------- notices --------------------------------------------- */}
          {!isCurrentWeek && (
            <div className="notice-banner" role="alert">
              <AlertCircle size={24}/>
              Du tittar på {isWeekInPast() ? 'en tidigare' : isWeekInFuture() ? 'en kommande' : 'en annan'} vecka
            </div>
          )}
          {showConflict && (
            <div className="notice-banner conflict-banner" role="alert">
              <AlertCircle size={24}/> Tidskonflikt! En deltagare är redan upptagen.
            </div>
          )}

          {/* -------- schedule grid with overlap handling ----------------- */}
          <main className="schedule-container" role="main" aria-label="Veckans schema">
            <div className="schedule-grid"
                 style={{gridTemplateColumns:`80px repeat(${days.length},1fr)`}}>
              {/* time column */}
              <div className="time-column">
                <div className="time-header">TID</div>
                {timeSlots.map(t=><div key={t} className="time-slot">{t}</div>)}
              </div>

              {/* day columns with overlap handling */}
              {days.map((day,i)=>{
                const date=weekDates[i];
                const acts=getActivitiesForDay(day);
                const overlapGroups = calculateOverlapGroups(acts);
                const numColumns = overlapGroups.length;
                
                return(
                  <div key={day} className="day-column">
                    <div className={`day-header ${isToday(date)?'today':''}`}>
                      <span className="day-name">{day}</span>
                      <span className="day-date">
                        {date.getDate()} {['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'][date.getMonth()]}
                      </span>
                    </div>
                    <div className="day-content" style={{height:`${timeSlots.length*60}px`}}>
                      {overlapGroups.map((group, groupIndex) => 
                        group.map(act => {
                          const {top,height}=calculatePosition(act.startTime,act.endTime,60,settings.dayStart);
                          const part=act.participants.map(id=>defaultFamilyMembers.find(m=>m.id===id)).filter(Boolean);
                          const width = numColumns > 1 ? `${100/numColumns}%` : 'calc(100% - 8px)';
                          const left = numColumns > 1 ? `${(100/numColumns) * groupIndex}%` : '4px';
                          
                          return(
                            <div key={act.id}
                              className="activity-block"
                              style={{
                                top, 
                                height, 
                                background:act.color,
                                left,
                                width,
                                right: 'auto'
                              }}
                              onClick={()=>{setEditingActivity(act); setModalOpen(true);}}
                              role="button"
                              tabIndex={0}
                              aria-label={`${act.name} från ${act.startTime} till ${act.endTime}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setEditingActivity(act);
                                  setModalOpen(true);
                                }
                              }}
                            >
                              <div className="activity-name"><span>{act.icon}</span>{act.name}</div>
                              <div className="activity-time">{act.startTime} – {act.endTime}</div>
                              <div className="activity-participants">
                                {part.map(p=><span key={p.id} aria-label={p.name}>{p.icon}</span>)}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </main>

          {/* -----------------------------------------------------------------
               ACTIVITY MODAL with focus trap and accessibility
          ----------------------------------------------------------------- */}
          {modalOpen && (
            <div 
              className="modal-overlay" 
              onClick={(e)=>e.target===e.currentTarget&&setModalOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <div className="modal" ref={modalRef}>
                <div className="modal-header">
                  <h2 id="modal-title" className="modal-title">{editingActivity?'Redigera Aktivitet':'Ny Aktivitet'}</h2>
                  <button 
                    className="modal-close" 
                    onClick={()=>setModalOpen(false)}
                    aria-label="Stäng modal"
                  >
                    <X size={24}/>
                  </button>
                </div>
                <div className="modal-body">

                  {/* name + icon */}
                  <div className="form-group">
                    <label htmlFor="activity-icon" className="form-label">Aktivitetsnamn *</label>
                    <div style={{display:'flex',gap:'10px'}}>
                      <input 
                        id="activity-icon"
                        type="text" 
                        className="form-input" 
                        style={{width:'60px',textAlign:'center',fontSize:'1.5rem'}}
                        value={formData.icon} 
                        onChange={e=>setFormData({...formData,icon:e.target.value})}
                        aria-label="Aktivitetsikon"
                      />
                      <input 
                        id="activity-name"
                        type="text" 
                        className="form-input" 
                        placeholder="T.ex. Fotboll"
                        value={formData.name} 
                        onChange={e=>setFormData({...formData,name:e.target.value})}
                        aria-label="Aktivitetsnamn"
                        aria-required="true"
                      />
                    </div>
                  </div>

                  {/* days */}
                  <div className="form-group">
                    <label className="form-label">Välj Dagar *</label>
                    <div 
                      className="day-selector" 
                      style={{gridTemplateColumns:`repeat(${days.length<=3?days.length:3},1fr)`}}
                      role="group"
                      aria-label="Välj veckodagar"
                    >
                      {days.map(d=>(
                        <div key={d}
                          className={`day-checkbox ${formData.days.includes(d)?'selected':''} ${editingActivity?'disabled':''}`}
                          onClick={()=>{
                            if(editingActivity) return;
                            setFormData(prev=>({
                              ...prev,
                              days:prev.days.includes(d)?prev.days.filter(x=>x!==d):[...prev.days,d]
                            }));
                          }}
                          role="checkbox"
                          aria-checked={formData.days.includes(d)}
                          tabIndex={editingActivity ? -1 : 0}
                          onKeyDown={(e) => {
                            if (!editingActivity && (e.key === 'Enter' || e.key === ' ')) {
                              e.preventDefault();
                              setFormData(prev=>({
                                ...prev,
                                days:prev.days.includes(d)?prev.days.filter(x=>x!==d):[...prev.days,d]
                              }));
                            }
                          }}
                        >
                          {d.substring(0,3).toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* participants */}
                  <div className="form-group">
                    <label className="form-label">Deltagare *</label>
                    <div 
                      className="participants-grid"
                      role="group"
                      aria-label="Välj deltagare"
                    >
                      {defaultFamilyMembers.map(m=>(
                        <div key={m.id}
                          className={`participant-option ${formData.participants.includes(m.id)?'selected':''}`}
                          onClick={()=>setFormData(prev=>({
                            ...prev,
                            participants:prev.participants.includes(m.id)?prev.participants.filter(p=>p!==m.id):[...prev.participants,m.id]
                          }))}
                          role="checkbox"
                          aria-checked={formData.participants.includes(m.id)}
                          aria-label={m.name}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setFormData(prev=>({
                                ...prev,
                                participants:prev.participants.includes(m.id)?prev.participants.filter(p=>p!==m.id):[...prev.participants,m.id]
                              }));
                            }
                          }}
                        >
                          <span>{m.icon}</span><span>{m.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* time */}
                  <div className="form-group">
                    <label className="form-label">Tid *</label>
                    <div className="time-inputs">
                      <input 
                        type="time" 
                        className="form-input" 
                        value={formData.startTime}
                        onChange={e=>setFormData({...formData,startTime:e.target.value})}
                        aria-label="Starttid"
                        aria-required="true"
                      />
                      <input 
                        type="time" 
                        className="form-input" 
                        value={formData.endTime}
                        onChange={e=>setFormData({...formData,endTime:e.target.value})}
                        aria-label="Sluttid"
                        aria-required="true"
                      />
                    </div>
                  </div>

                  {/* location */}
                  <div className="form-group">
                    <label htmlFor="activity-location" className="form-label">Plats</label>
                    <input 
                      id="activity-location"
                      type="text" 
                      className="form-input" 
                      placeholder="T.ex. Sporthallen"
                      value={formData.location} 
                      onChange={e=>setFormData({...formData,location:e.target.value})}
                    />
                  </div>

                  {/* notes */}
                  <div className="form-group">
                    <label htmlFor="activity-notes" className="form-label">Anteckningar</label>
                    <textarea 
                      id="activity-notes"
                      rows="3" 
                      className="form-textarea"
                      placeholder="Ytterligare information..."
                      value={formData.notes} 
                      onChange={e=>setFormData({...formData,notes:e.target.value})}
                    />
                  </div>

                  {!editingActivity && (
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input 
                          type="checkbox" 
                          className="checkbox-input"
                          checked={formData.recurring}
                          onChange={e=>setFormData({...formData,recurring:e.target.checked})}
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
                            onChange={e=>setFormData({...formData,recurringEndDate:e.target.value})}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      )}
                    </div>
                  )}

                </div>
                <div className="modal-footer">
                  {editingActivity && (
                    <button 
                      className="btn btn-danger" 
                      onClick={handleDeleteActivity}
                      aria-label="Ta bort aktivitet"
                    >
                      <Trash2 size={20}/> Ta bort
                    </button>
                  )}
                  <div style={{marginLeft:'auto',display:'flex',gap:'15px'}}>
                    <button className="btn" onClick={()=>setModalOpen(false)}>Avbryt</button>
                    <button 
                      className="btn btn-success" 
                      onClick={handleSaveActivity}
                      aria-label="Spara aktivitet"
                    >
                      <Save size={20}/> Spara
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
               SETTINGS MODAL with focus trap and accessibility
          ----------------------------------------------------------------- */}
          {settingsOpen && (
            <div 
              className="modal-overlay" 
              onClick={(e)=>e.target===e.currentTarget&&setSettingsOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="settings-title"
            >
              <div className="modal" ref={settingsModalRef}>
                <div className="modal-header">
                  <h2 id="settings-title" className="modal-title">Inställningar</h2>
                  <button 
                    className="modal-close" 
                    onClick={()=>setSettingsOpen(false)}
                    aria-label="Stäng inställningar"
                  >
                    <X size={24}/>
                  </button>
                </div>
                <div className="modal-body">

                  {/* weekends */}
                  <div className="form-group">
                    <label className="form-label">Arbetsdagar</label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        className="checkbox-input"
                        checked={settings.showWeekends}
                        onChange={e=>setSettings({...settings,showWeekends:e.target.checked})}
                        aria-label="Inkludera helger"
                      />
                      Inkludera lör/sön
                    </label>
                  </div>

                  {/* hour range */}
                  <div className="form-group">
                    <label className="form-label">Tidsintervall (start–slut)</label>
                    <div style={{display:'flex',gap:'10px'}}>
                      <input 
                        type="number" 
                        className="form-input"
                        value={settings.dayStart} 
                        min="0" 
                        max="23"
                        onChange={e=>setSettings({...settings,dayStart:+e.target.value})}
                        aria-label="Starttimme"
                      />
                      <input 
                        type="number" 
                        className="form-input"
                        value={settings.dayEnd} 
                        min={settings.dayStart+1} 
                        max="23"
                        onChange={e=>setSettings({...settings,dayEnd:+e.target.value})}
                        aria-label="Sluttimme"
                      />
                    </div>
                  </div>

                </div>
                <div className="modal-footer">
                  <button 
                    className="btn btn-success" 
                    onClick={()=>setSettingsOpen(false)}
                    aria-label="Spara inställningar"
                  >
                    <Save size={20}/> Spara
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}