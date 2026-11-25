import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Plus, 
  Calendar as CalendarIcon,
  Check,
  LayoutGrid,
  CalendarDays,
  Clock
} from 'lucide-react';
import { TaskEvent, ViewMode, DepartmentItem } from '../types';
import { DEFAULT_DEPARTMENTS, getEventOutline } from '../data/initialData';
import { formatDateToISO, getMonthWeeks, WeekRow } from '../utils/dateUtils';

interface WeeklyScheduleViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  currentView: ViewMode;
  onChangeView?: (view: ViewMode) => void;
  events: TaskEvent[];
  departments?: DepartmentItem[];
  timezone: string;
  isSidebarOpen?: boolean;
  onOpenCreateModal: (defaultDate?: string, defaultHour?: number) => void;
  onSelectEvent: (event: TaskEvent) => void;
  onToggleEventStatus?: (eventId: string) => void;
}

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  selectedDate,
  onSelectDate,
  currentView,
  onChangeView,
  events,
  departments = DEFAULT_DEPARTMENTS,
  timezone,
  isSidebarOpen = false,
  onOpenCreateModal,
  onSelectEvent,
  onToggleEventStatus,
}) => {
  const selectedIso = formatDateToISO(selectedDate);
  const monthWeeks = getMonthWeeks(selectedDate, selectedDate);
  const currentSelectedWeek = monthWeeks.find((w) => w.isCurrentWeek) || monthWeeks[0];

  const [focusedWeekNumber, setFocusedWeekNumber] = useState<number | 'all'>(() => currentSelectedWeek?.weekNumber ?? 1);
  const focusedWeekBtnRef = useRef<HTMLButtonElement | null>(null);

  // Sync focused week whenever selectedDate changes
  useEffect(() => {
    if (currentSelectedWeek && focusedWeekNumber !== 'all') {
      setFocusedWeekNumber(currentSelectedWeek.weekNumber);
    }
  }, [selectedIso]);

  const handleSelectWeek = (week: WeekRow) => {
    setFocusedWeekNumber(week.weekNumber);
    const targetDay = week.days.find((d) => d.isCurrentMonth) || week.days[0];
    if (targetDay) {
      onSelectDate(targetDay.date);
    }
  };

  const focusedWeek = monthWeeks.find((w) => w.weekNumber === focusedWeekNumber) || currentSelectedWeek;

  const capsuleColors = [
    'bg-[#2dd4bf] text-white shadow-teal-500/20', // Teal
    'bg-[#f87171] text-white shadow-rose-500/20', // Pink/Red
    'bg-[#38bdf8] text-white shadow-sky-500/20',  // Blue
    'bg-[#fbbf24] text-white shadow-amber-500/20', // Orange
    'bg-[#818cf8] text-white shadow-indigo-500/20',// Purple
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden select-none relative h-full">
      
      {/* 1. TOP WEEKLY SELECTOR BAR */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 overflow-x-auto py-1 w-full no-scrollbar">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider pr-3 border-r border-slate-200 shrink-0">
            <CalendarIcon className="w-4 h-4 text-indigo-600" />
            <span>WEEKLY:</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {monthWeeks.map((week) => {
              const isFocused = focusedWeekNumber === week.weekNumber;
              const weekEventsCount = events.filter((e) =>
                week.days.some((d) => d.iso === e.date || (e.dueDate && d.iso >= e.date && d.iso <= e.dueDate))
              ).length;

              return (
                <button
                  key={week.weekNumber}
                  ref={(el) => {
                    if (isFocused) {
                      focusedWeekBtnRef.current = el;
                    }
                  }}
                  onClick={() => handleSelectWeek(week)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isFocused
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-100'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                  title={`Fokus ke ${week.weekLabelId} (${week.dateRangeLabel})`}
                >
                  <span>{week.weekLabelId}</span>
                  <span className={`text-[10px] font-normal hidden lg:inline px-1 py-0.2 rounded-full ${
                    isFocused ? 'bg-white/20 text-white' : 'text-slate-400'
                  }`}>
                    {week.dateRangeLabel}
                  </span>
                  {weekEventsCount > 0 && (
                    <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                      isFocused ? 'bg-white text-indigo-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {weekEventsCount}
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => setFocusedWeekNumber('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                focusedWeekNumber === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-500 border border-slate-200/80'
              }`}
            >
              Semua Minggu
            </button>
          </div>
        </div>

        {/* Quick Pending / Done Summary Pill */}
        <div className="hidden xl:flex items-center gap-2 shrink-0 pl-3 border-l border-slate-200">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            Highlight:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/90 text-[10.5px] font-bold font-mono">
              {events.filter((e) => e.status !== 'completed').length} Pending
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200/90 text-[10.5px] font-bold font-mono">
              {events.filter((e) => e.status === 'completed').length} Done
            </span>
          </div>
        </div>
      </div>

      {/* 3. SEAMLESS OPEN WEEKLY TIMELINE (Multi-day spanning capsule bars clamped strictly to actual dueDate using grid grid-cols-7) */}
      {focusedWeekNumber !== 'all' && focusedWeek && (
        <div className="flex-1 min-w-0 min-h-0 bg-white overflow-x-auto overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] p-4 sm:p-6 flex flex-col">
          
          {/* Day Headers Row (Senin, Selasa, Rabu, etc.) */}
          <div className="grid grid-cols-7 gap-3 min-w-[1100px] pb-4 border-b border-slate-200 shrink-0">
            {focusedWeek.days.map((day) => {
              const isSelected = day.iso === selectedIso;

              return (
                <div
                  key={day.iso}
                  onClick={() => onSelectDate(day.date)}
                  className={`px-4 py-3 rounded-2xl flex items-center justify-between gap-2 cursor-pointer transition-all ${
                    isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm capitalize">
                      {day.dayNameId}
                    </span>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs shadow-2xs ${
                      isSelected ? 'bg-white text-indigo-700' : 'bg-white text-slate-800 border border-slate-200'
                    }`}>
                      {day.dayNumber}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCreateModal(day.iso, 10);
                    }}
                    title={`Tambah tugas pada ${day.dayNameId} ${day.dayNumber}`}
                    className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                      isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-200/80 text-slate-500'
                    }`}
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Weekly Timeline Area with 7-column grid container */}
          <div className="flex-1 min-w-[1100px] pt-4 flex flex-col gap-3">
            {/* 1. Multi-Day Spanning Tasks Grid Container */}
            {(() => {
              const weekStartIso = focusedWeek.days[0].iso;
              const weekEndIso = focusedWeek.days[6].iso;

              const multiDayEvents = events.filter((e) => {
                const start = e.date;
                const end = e.dueDate || e.date;
                return end > start && start <= weekEndIso && end >= weekStartIso;
              });

              return multiDayEvents.map((event, eventIdx) => {
                const capsuleBg = capsuleColors[(event.id.charCodeAt(0) + eventIdx) % capsuleColors.length];
                const titleText = event.title || 'Tugas Tanpa Judul';
                const isCompleted = event.status === 'completed';

                const startIso = event.date < weekStartIso ? weekStartIso : event.date;
                const dueDate = event.dueDate || event.date;
                const endIso = dueDate > weekEndIso ? weekEndIso : dueDate;

                const startIndex = focusedWeek.days.findIndex(d => d.iso === startIso);
                const endIndex = focusedWeek.days.findIndex(d => d.iso === endIso);

                const validStart = startIndex !== -1 ? startIndex : 0;
                const validEnd = endIndex !== -1 ? endIndex : 6;

                return (
                  <div
                    key={event.id}
                    className="grid grid-cols-7 gap-3 w-full"
                  >
                    <div
                      onClick={() => onSelectEvent(event)}
                      style={{
                        gridColumnStart: validStart + 1,
                        gridColumnEnd: validEnd + 2,
                      }}
                      className={`w-full py-3.5 px-4 rounded-3xl shadow-md cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between gap-3 ${
                        isCompleted ? 'bg-[#38bdf8] text-white shadow-sky-500/20' : capsuleBg
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono uppercase bg-white/25 px-2.5 py-0.5 rounded-full font-bold">
                            {event.date} → {dueDate}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold truncate tracking-tight text-white">
                          {titleText}
                        </h4>
                        {event.department && (
                          <p className="text-xs text-white/90 truncate mt-0.5 font-medium">
                            {event.department}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleEventStatus) {
                            onToggleEventStatus(event.id);
                          }
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          isCompleted ? 'bg-white text-emerald-700 shadow-xs' : 'bg-white/30 hover:bg-white/50 text-white'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                );
              });
            })()}

            {/* 2. Single-Day Tasks Grid (Rendered in their respective day columns) */}
            <div className="grid grid-cols-7 gap-3 pt-2">
              {focusedWeek.days.map((day, dayIndex) => {
                const dayEvents = events.filter((e) => {
                  const start = e.date;
                  const end = e.dueDate || e.date;
                  return start === end && start === day.iso;
                });

                return (
                  <div key={day.iso} className="flex flex-col gap-3 min-h-[300px]">
                    {dayEvents.map((event, eventIdx) => {
                      const capsuleBg = capsuleColors[(event.id.charCodeAt(0) + eventIdx) % capsuleColors.length];
                      const titleText = event.title || 'Tugas Tanpa Judul';
                      const isCompleted = event.status === 'completed';

                      return (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent(event);
                          }}
                          className={`w-full py-3.5 px-4 rounded-3xl shadow-md cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between gap-3 ${
                            isCompleted ? 'bg-[#38bdf8] text-white shadow-sky-500/20' : capsuleBg
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs sm:text-sm font-bold truncate leading-snug">
                              {titleText}
                            </h5>
                            {event.department && (
                              <p className="text-[10.5px] opacity-90 truncate mt-0.5">
                                {event.department}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onToggleEventStatus) {
                                onToggleEventStatus(event.id);
                              }
                            }}
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              isCompleted ? 'bg-white text-emerald-700 shadow-xs' : 'bg-white/30 hover:bg-white/50 text-white'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        </div>
                      );
                    })}

                    {dayEvents.length === 0 && (
                      <div
                        onClick={() => onOpenCreateModal(day.iso, 10)}
                        className="h-20 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-indigo-700 transition-all cursor-pointer p-2 text-center"
                      >
                        <Plus className="w-4 h-4 text-slate-300" />
                        <span className="text-[11px] font-semibold">+ Add Task</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Spacing */}
      <div className="h-16 shrink-0" />
    </div>
  );
};

export default WeeklyScheduleView;
