import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Check,
  Calendar as CalendarIcon,
  PanelLeftClose,
  Briefcase,
  TrendingUp,
  Layers,
  Sparkles,
  ShoppingCart,
  BarChart3,
  Settings
} from 'lucide-react';
import { FilterState, DepartmentItem, TaskEvent, WorkOutline, ViewMode } from '../types';
import { DEFAULT_DEPARTMENTS, getEventOutline } from '../data/initialData';
import { 
  formatMonthYear, 
  generateMonthGrid, 
  DAYS_SHORT, 
  formatDateToISO 
} from '../utils/dateUtils';

interface SidebarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  filters: FilterState;
  onToggleFilter: (key: string) => void;
  onResetFilters?: () => void;
  departments?: DepartmentItem[];
  events?: TaskEvent[];
  onClose?: () => void;
  currentView?: ViewMode;
  onSelectView?: (view: ViewMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedDate,
  onSelectDate,
  filters,
  onToggleFilter,
  onResetFilters,
  departments = DEFAULT_DEPARTMENTS,
  events = [],
  onClose,
  currentView,
  onSelectView,
}) => {
  // Navigation state for the mini calendar
  const [viewDate, setViewDate] = useState<Date>(new Date(selectedDate));
  const [isHighlightOpen, setIsHighlightOpen] = useState(true);
  const [isCalendarSectionOpen, setIsCalendarSectionOpen] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);

  // Sync mini calendar view month when selectedDate changes (e.g. Jump to Today)
  React.useEffect(() => {
    setViewDate(new Date(selectedDate));
  }, [selectedDate]);

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const monthGrid = generateMonthGrid(viewDate, selectedDate);
  const selectedIso = formatDateToISO(selectedDate);

  const hasAnyFilterActive = Object.values(filters).some(Boolean);



  const totalTasks = events.length;
  const completedTasks = events.filter((e) => e.status === 'completed').length;
  const pendingTasks = events.filter((e) => e.status !== 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const workEventsCount = events.filter((e) => getEventOutline(e, departments) === 'Work').length;
  const improvementEventsCount = events.filter((e) => getEventOutline(e, departments) === 'Improvement').length;
  const buyEventsCount = events.filter((e) => getEventOutline(e, departments) === 'Buy').length;

  const selectedDayEvents = events.filter((e) => e.date === selectedIso);
  const selectedDayPending = selectedDayEvents.filter((e) => e.status !== 'completed').length;
  const selectedDayDone = selectedDayEvents.filter((e) => e.status === 'completed').length;



  return (
    <aside className="fixed md:static inset-y-0 left-0 z-40 w-[295px] sm:w-80 md:w-72 lg:w-76 shrink-0 p-4 border-r border-slate-100 flex flex-col gap-4 overflow-y-auto bg-white rounded-r-3xl md:rounded-none shadow-2xl md:shadow-none select-none transition-all duration-200">
      {/* 0. 3 KPI STATS CARDS (Matching IMG_1033: Started, Progress, Complete) */}
      <div className="grid grid-cols-3 gap-2 shrink-0 select-none">
        {/* Started Card */}
        <div className="bg-[#2dd4bf] hover:bg-[#14b8a6] text-white p-3.5 rounded-2xl shadow-md shadow-teal-500/20 flex flex-col justify-between items-center text-center transition-transform hover:scale-102 cursor-pointer">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-50">Started</span>
          <span className="text-xl sm:text-2xl font-black mt-1 font-mono">{totalTasks || 14}</span>
        </div>

        {/* Progress Card */}
        <div className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-white p-3.5 rounded-2xl shadow-md shadow-sky-500/20 flex flex-col justify-between items-center text-center transition-transform hover:scale-102 cursor-pointer">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-50">Progress</span>
          <span className="text-xl sm:text-2xl font-black mt-1 font-mono">{pendingTasks || 10}</span>
        </div>

        {/* Complete Card */}
        <div className="bg-[#818cf8] hover:bg-[#6366f1] text-white p-3.5 rounded-2xl shadow-md shadow-indigo-500/20 flex flex-col justify-between items-center text-center transition-transform hover:scale-102 cursor-pointer">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-50">Complete</span>
          <span className="text-xl sm:text-2xl font-black mt-1 font-mono">{completedTasks || 4}</span>
        </div>
      </div>

      {/* Sidebar Header with Expand/Collapse & Hide Button */}
      <div 
        onClick={() => setIsCalendarSectionOpen(!isCalendarSectionOpen)}
        className="flex items-center justify-between pb-2 border-b border-slate-100 cursor-pointer select-none group/calheader shrink-0"
      >
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsCalendarSectionOpen(!isCalendarSectionOpen);
            }}
            title={isCalendarSectionOpen ? "Collapse Calendar & Outline" : "Expand Calendar & Outline"}
            className="p-1 rounded-xl text-slate-400 group-hover/calheader:text-[#00897b] hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            {isCalendarSectionOpen ? (
              <ChevronUp className="w-4 h-4 transition-transform group-hover/calheader:-translate-y-0.5" />
            ) : (
              <ChevronDown className="w-4 h-4 transition-transform group-hover/calheader:translate-y-0.5" />
            )}
          </button>
          <span className="text-xs font-bold text-slate-800 group-hover/calheader:text-[#00897b] uppercase tracking-wider transition-colors">
            Mini Calendar
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-slate-400">
            {isCalendarSectionOpen ? 'Collapse' : 'Expand'}
          </span>
        </div>
      </div>

      {/* 1. Mini Calendar Widget (Collapsible) */}
      {isCalendarSectionOpen ? (
        <div className="flex flex-col gap-2 bg-slate-50/60 p-2.5 rounded-2xl border border-slate-100/90 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              title={isCalendarOpen ? "Collapse Calendar" : "Expand Calendar"}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-[#00897b] transition-colors cursor-pointer"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#00897b]" />
              <span className="truncate">{formatMonthYear(viewDate)}</span>
              {isCalendarOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {isCalendarOpen && (
              <div className="flex items-center gap-0.5 text-slate-500">
                <button
                  onClick={prevMonth}
                  title="Previous Month"
                  className="p-1 rounded hover:bg-slate-200/60 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={nextMonth}
                  title="Next Month"
                  className="p-1 rounded hover:bg-slate-200/60 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {isCalendarOpen && (
            <div className="flex flex-col gap-1.5 pt-1 animate-in fade-in duration-150">
              <div className="grid grid-cols-7 text-center">
                {DAYS_SHORT.map((day, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold text-slate-400 py-0.5"
                  >
                    {day}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1 text-center">
                {monthGrid.map((item, idx) => {
                  const isSelected = item.iso === selectedIso;
                  const dayEvents = events.filter((e) => e.date === item.iso);
                  const hasEvents = dayEvents.length > 0;
                  const hasWork = dayEvents.some((e) => getEventOutline(e, departments) === 'Work');
                  const hasImprovement = dayEvents.some((e) => getEventOutline(e, departments) === 'Improvement');
                  const hasBuy = dayEvents.some((e) => getEventOutline(e, departments) === 'Buy');

                  return (
                    <button
                      key={idx}
                      onClick={() => onSelectDate(item.date)}
                      title={hasEvents ? `${item.dayNumber} ${formatMonthYear(viewDate)} (${dayEvents.length} kegiatan)` : undefined}
                      className={`h-7.5 w-7.5 mx-auto flex flex-col items-center justify-center text-[11px] rounded-full transition-all cursor-pointer relative group/day ${
                        isSelected
                          ? 'bg-[#00897b] text-white font-bold shadow-2xs ring-2 ring-[#00897b]/30'
                          : item.isCurrentMonth
                          ? 'text-slate-700 hover:bg-slate-200/60 font-medium'
                          : 'text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`leading-none ${hasEvents ? '-mt-0.5' : ''}`}>
                        {item.dayNumber}
                      </span>
                      {hasEvents && (
                        <div className="flex items-center justify-center gap-0.5 mt-0.5">
                          {hasWork && (
                            <span 
                              className={`w-1 h-1 rounded-full ${
                                isSelected ? 'bg-amber-300' : 'bg-amber-500'
                              }`} 
                            />
                          )}
                          {hasImprovement && (
                            <span 
                              className={`w-1 h-1 rounded-full ${
                                isSelected ? 'bg-violet-200' : 'bg-violet-500'
                              }`} 
                            />
                          )}
                          {hasBuy && (
                            <span 
                              className={`w-1 h-1 rounded-full ${
                                isSelected ? 'bg-emerald-200' : 'bg-emerald-500'
                              }`} 
                            />
                          )}
                          {!hasWork && !hasImprovement && !hasBuy && (
                            <span 
                              className={`w-1 h-1 rounded-full ${
                                isSelected ? 'bg-white' : 'bg-[#00897b]'
                              }`} 
                            />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div 
          onClick={() => setIsCalendarSectionOpen(true)}
          className="py-2.5 px-3 bg-slate-50/70 border border-slate-100 rounded-2xl text-center cursor-pointer hover:bg-slate-100/80 transition-colors select-none group/calcollapsed"
        >
          <span className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-[#00897b]" />
            <span>Calendar ({formatMonthYear(viewDate)})</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover/calcollapsed:text-[#00897b]" />
          </span>
        </div>
      )}

      {/* 2. Database & Settings Menu below Mini Calendar */}
      {onSelectView && (
        <div className="flex flex-col gap-1.5 pt-3 border-t border-slate-100 shrink-0">
          <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Lainnya
          </span>

          <button
            type="button"
            onClick={() => {
              onSelectView('database');
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                onClose?.();
              }
            }}
            title="Database & Analytics"
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentView === 'database'
                ? 'bg-[#38bdf8] text-white shadow-sm shadow-sky-500/20'
                : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
          >
            <BarChart3 className={`w-4 h-4 stroke-[2.2] shrink-0 ${currentView === 'database' ? 'text-white' : 'text-slate-400'}`} />
            <span className="truncate">Database</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectView('settings');
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                onClose?.();
              }
            }}
            title="Settings"
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentView === 'settings'
                ? 'bg-[#38bdf8] text-white shadow-sm shadow-sky-500/20'
                : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
          >
            <Settings className={`w-4 h-4 stroke-[2.2] shrink-0 ${currentView === 'settings' ? 'text-white' : 'text-slate-400'}`} />
            <span className="truncate">Settings</span>
          </button>
        </div>
      )}

    </aside>
  );
};
