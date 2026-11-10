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
  ShoppingCart
} from 'lucide-react';
import { FilterState, DepartmentItem, TaskEvent, WorkOutline } from '../types';
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
      {/* 0. HIGHLIGHT SUMMARY WIDGET (Di atas Calendar & Outlines) */}
      <div className="bg-gradient-to-br from-teal-50/95 via-emerald-50/30 to-amber-50/40 p-4 rounded-3xl border border-teal-200/80 shadow-xs flex flex-col gap-3 shrink-0 select-none">
        {/* Highlight Header */}
        <div 
          onClick={() => setIsHighlightOpen(!isHighlightOpen)}
          className="flex items-center justify-between cursor-pointer group/hl"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#00897b] text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 text-[#f6c445]" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#00796b] uppercase tracking-wider block leading-tight">
                Highlights
              </span>
              <span className="text-sm font-bold text-slate-800 leading-tight">
                Dashboard Summary
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white text-[#00796b] border border-teal-200 shadow-2xs">
              {completionRate}% Done
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsHighlightOpen(!isHighlightOpen);
              }}
              title={isHighlightOpen ? "Collapse Highlights" : "Expand Highlights"}
              className="p-1.5 rounded-xl text-slate-400 group-hover/hl:text-[#00897b] hover:bg-white/80 transition-all cursor-pointer"
            >
              {isHighlightOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Summary Content */}
        {isHighlightOpen ? (
          <div className="flex flex-col gap-2.5 pt-1 animate-in fade-in duration-150">
            {/* Progress Bar with larger metrics */}
            <div className="flex flex-col gap-1.5 bg-white/80 p-2.5 rounded-2xl border border-teal-100/90 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Task Completion</span>
                <span className="font-mono font-bold text-[#00796b]">
                  {completedTasks}/{totalTasks} Tasks ({completionRate}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#00897b] to-emerald-500 transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            {/* Row 1: Pending & Completed (Larger Cards) */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white border border-amber-200/90 rounded-2xl p-2.5 flex flex-col justify-between shadow-2xs min-h-[62px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-700">Pending Task</span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-[10px] text-slate-400 font-medium">To do</span>
                  <span className="text-base font-extrabold font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
                    {pendingTasks}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-emerald-200/90 rounded-2xl p-2.5 flex flex-col justify-between shadow-2xs min-h-[62px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-emerald-700 stroke-[3]" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Complete</span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-[10px] text-slate-400 font-medium">Done</span>
                  <span className="text-base font-extrabold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                    {completedTasks}
                  </span>
                </div>
              </div>
            </div>

            {/* Row 2: Work & Improvement & Buy Outlines Breakdown */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="bg-amber-50/90 border border-amber-300/80 rounded-2xl p-2 px-2 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-[11px] font-bold text-amber-950 truncate">Work</span>
                </div>
                <span className="text-xs font-extrabold font-mono text-amber-900 bg-white/80 px-1 py-0.5 rounded-md border border-amber-200">
                  {workEventsCount}
                </span>
              </div>

              <div className="bg-violet-50/90 border border-violet-300/80 rounded-2xl p-2 px-2 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                  <span className="text-[11px] font-bold text-violet-950 truncate">Improve</span>
                </div>
                <span className="text-xs font-extrabold font-mono text-violet-950 bg-white/80 px-1 py-0.5 rounded-md border border-violet-200">
                  {improvementEventsCount}
                </span>
              </div>

              <div className="bg-emerald-50/90 border border-emerald-300/80 rounded-2xl p-2 px-2 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-[11px] font-bold text-emerald-950 truncate">Buy</span>
                </div>
                <span className="text-xs font-extrabold font-mono text-emerald-900 bg-white/80 px-1 py-0.5 rounded-md border border-emerald-200">
                  {buyEventsCount}
                </span>
              </div>
            </div>

            {/* Row 3: Selected Day Status */}
            <div className="bg-white/85 border border-slate-200/80 rounded-2xl p-2 px-2.5 flex items-center justify-between text-xs text-slate-600 shadow-2xs">
              <span className="font-semibold text-slate-700 truncate">
                Hari Terpilih ({selectedDayEvents.length} Tasks)
              </span>
              <div className="flex items-center gap-1 font-mono text-[11px] font-bold shrink-0">
                <span className="text-amber-700">{selectedDayPending} P</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700">{selectedDayDone} C</span>
              </div>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setIsHighlightOpen(true)}
            className="text-xs font-semibold text-slate-600 flex items-center justify-between pt-1 cursor-pointer hover:text-slate-900 bg-white/60 p-2 rounded-xl"
          >
            <span>{totalTasks} Total ({completedTasks} Selesai, {pendingTasks} Pending)</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#00897b]" />
          </div>
        )}
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
          <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline">
            {isCalendarSectionOpen ? 'Collapse' : 'Expand'}
          </span>
          {onClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              title="Hide Calendar Sidebar"
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          )}
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

    </aside>
  );
};
