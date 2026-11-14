import React, { useState, useEffect } from 'react';
import { 
  ChevronRight,
  ChevronDown,
  Plus, 
  CheckCircle2, 
  Check,
  Circle,
  Calendar as CalendarIcon
} from 'lucide-react';
import { TaskEvent, ViewMode, DepartmentItem } from '../types';
import { DEFAULT_DEPARTMENTS, getEventOutline } from '../data/initialData';
import { 
  getMonthWeeks, 
  getWeekDaysSeninMinggu,
  WEEKDAYS_SENIN_MINGGU,
  formatDateToISO,
  WeekRow 
} from '../utils/dateUtils';

interface WeeklyScheduleViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
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
  // Mode inside Weekly:
  // 'month_weeks': Matrix where Y-axis is Week 1, Week 2, Week 3, Week 4, Week 5; X-axis is Senin - Minggu
  // 'single_week_hours': Single week showing Senin - Minggu with hourly time slots
  const [weeklyMode, setWeeklyMode] = useState<'month_weeks' | 'single_week_hours'>('month_weeks');

  const selectedIso = formatDateToISO(selectedDate);
  const monthWeeks = getMonthWeeks(selectedDate, selectedDate);
  const currentSelectedWeek = monthWeeks.find((w) => w.isCurrentWeek) || monthWeeks[0];

  // Which week button is selected to focus on:
  // Default to the current active week containing selectedDate (e.g. Week 4)
  const [focusedWeekNumber, setFocusedWeekNumber] = useState<number | 'all'>(() => currentSelectedWeek?.weekNumber ?? 1);

  // Sync focused week whenever selectedDate changes externally
  useEffect(() => {
    if (currentSelectedWeek && focusedWeekNumber !== 'all') {
      setFocusedWeekNumber(currentSelectedWeek.weekNumber);
    }
  }, [selectedIso]);

  // Month navigation
  const handlePrevMonth = () => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() - 1);
    onSelectDate(d);
  };

  const handleNextMonth = () => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() + 1);
    onSelectDate(d);
  };

  // Week selection handler: activates focus on that specific weekly
  const handleSelectWeek = (week: WeekRow) => {
    setFocusedWeekNumber(week.weekNumber);
    // Automatically select the active/first day of that week
    const targetDay = week.days.find((d) => d.isCurrentMonth) || week.days[0];
    if (targetDay) {
      onSelectDate(targetDay.date);
    }
  };

  // Previous week button
  const handlePrevWeek = () => {
    if (focusedWeekNumber === 'all') {
      handlePrevMonth();
      return;
    }
    const currentIndex = monthWeeks.findIndex((w) => w.weekNumber === focusedWeekNumber);
    if (currentIndex > 0) {
      handleSelectWeek(monthWeeks[currentIndex - 1]);
    } else {
      const prevDate = new Date(selectedDate);
      prevDate.setDate(prevDate.getDate() - 7);
      onSelectDate(prevDate);
    }
  };

  // Next week button
  const handleNextWeek = () => {
    if (focusedWeekNumber === 'all') {
      handleNextMonth();
      return;
    }
    const currentIndex = monthWeeks.findIndex((w) => w.weekNumber === focusedWeekNumber);
    if (currentIndex < monthWeeks.length - 1) {
      handleSelectWeek(monthWeeks[currentIndex + 1]);
    } else {
      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + 7);
      onSelectDate(nextDate);
    }
  };

  // The active focused week object
  const focusedWeek = monthWeeks.find((w) => w.weekNumber === focusedWeekNumber) || currentSelectedWeek;
  const focusedWeekEvents = focusedWeek 
    ? events.filter((e) => focusedWeek.days.some((d) => d.iso === e.date))
    : [];

  const singleWeekDays = getWeekDaysSeninMinggu(selectedDate);
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  const formatHourLabel = (hour: number) => {
    if (hour === 12) return '12 PM';
    if (hour > 12) return `${String(hour - 12).padStart(2, '0')} PM`;
    return `${String(hour).padStart(2, '0')} AM`;
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden select-none h-full">

      {/* 2. WEEKLY BUTTONS TOOLBAR (Tombol Weekly untuk fokus ke week yang dipilih) */}
      {weeklyMode === 'month_weeks' && (
        <div className="px-3 sm:px-4 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto py-0.5 w-full">
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider pr-2 border-r border-slate-200 shrink-0">
              <CalendarIcon className="w-3.5 h-3.5 text-[#00897b]" />
              <span>Weekly:</span>
            </div>

            {/* Individual Weekly Buttons */}
            <div className="flex items-center gap-1.5 shrink-0 px-0.5">
              {monthWeeks.map((week) => {
                const isFocused = focusedWeekNumber === week.weekNumber;
                const weekEventsCount = events.filter((e) =>
                  week.days.some((d) => d.iso === e.date)
                ).length;

                return (
                  <button
                    key={week.weekNumber}
                    ref={(el) => {
                      if (isFocused && el && typeof window !== 'undefined' && window.innerWidth < 768) {
                        el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                      }
                    }}
                    onClick={() => handleSelectWeek(week)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full sm:rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isFocused
                        ? 'bg-[#00897b] text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 hover:border-slate-300'
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
                        isFocused ? 'bg-white text-[#00897b]' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {weekEventsCount}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* View all weeks overview matrix button */}
              <button
                onClick={() => setFocusedWeekNumber('all')}
                className={`px-3 py-1.5 rounded-full sm:rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  focusedWeekNumber === 'all'
                    ? 'bg-[#00897b] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-500 border border-slate-200/80'
                }`}
                title="Tampilkan semua minggu sekaligus"
              >
                Semua Minggu
              </button>
            </div>
          </div>

          {/* Quick Dashboard Highlight / Summary Pill */}
          <div className="hidden xl:flex items-center gap-2 shrink-0 pl-2 border-l border-slate-200">
            <span className="text-[10px] font-bold text-[#00796b] uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00897b]"></span>
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
      )}

      {/* 3. MAIN CONTENT: FOKUS MENAMPILKAN WEEKLY YANG DIPILIH */}
      {weeklyMode === 'month_weeks' && focusedWeekNumber !== 'all' && focusedWeek && (
        <div className="flex-1 min-w-0 min-h-0 flex flex-col p-2.5 pt-2 md:p-0">
          <div
            className={`flex-1 min-w-0 min-h-0 bg-[#f5f7f6] rounded-3xl md:rounded-[36px] border border-slate-200/70 md:border md:border-slate-200/80 shadow-2xs flex flex-col ${
              isSidebarOpen
                ? 'overflow-y-auto md:overflow-x-auto md:overflow-y-hidden'
                : 'overflow-y-auto md:overflow-hidden'
            }`}
          >
          <div
            className={`divide-y-0 w-full h-auto md:h-full md:flex-1 ${
              isSidebarOpen
                ? 'flex flex-col md:flex-row md:min-w-[1050px]'
                : 'flex flex-col md:grid md:grid-cols-7 md:min-w-0'
            }`}
          >
            {focusedWeek.days.map((day) => {
              const isSelected = day.iso === selectedIso;
              const dayEvents = events.filter((e) => e.date === day.iso);

              return (
                <div
                  key={day.iso}
                  onClick={() => onSelectDate(day.date)}
                  className={`shrink-0 flex flex-col md:h-full md:overflow-hidden transition-colors cursor-pointer group ${
                    isSidebarOpen
                      ? 'w-full md:w-[150px] md:min-w-[150px] md:flex-1'
                      : 'w-full md:shrink md:min-w-0'
                  } ${
                    isSelected
                      ? 'bg-teal-50/20'
                      : day.isCurrentMonth
                      ? 'bg-[#f5f7f6] hover:bg-slate-100/50'
                      : 'bg-slate-100/60'
                  }`}
                >
                  {/* Day Column Header matching Menu Navbar green (#4fa397) without borders */}
                  <div
                    className={`flex items-center justify-between gap-1 shrink-0 bg-[#4fa397] text-white whitespace-nowrap ${
                      isSidebarOpen
                        ? 'px-4 py-3 md:px-3 md:py-2.5'
                        : 'px-4 py-3 md:px-2.5 md:py-2'
                    }`}
                  >
                    <div className="flex items-center gap-2 md:gap-1.5 min-w-0">
                      <span
                        className={`font-bold text-white capitalize truncate ${
                          isSidebarOpen ? 'text-sm' : 'text-sm md:text-xs lg:text-sm'
                        }`}
                      >
                        {day.dayNameId}
                      </span>
                      <span
                        className={`rounded-full flex items-center justify-center font-bold shrink-0 transition-all ${
                          isSidebarOpen
                            ? 'w-7 h-7 text-sm'
                            : 'w-7 h-7 md:w-6 md:h-6 lg:w-7 lg:h-7 text-sm md:text-xs lg:text-sm'
                        } ${
                          isSelected || day.isToday
                            ? 'bg-white text-[#4fa397] shadow-2xs font-extrabold ring-2 ring-white/40'
                            : 'bg-white/20 text-white'
                        }`}
                      >
                        {day.dayNumber}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="md:hidden text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white font-mono">
                          {dayEvents.length} task
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCreateModal(day.iso, 10);
                      }}
                      title={`Add task on ${day.dayNameId} ${day.dayNumber}`}
                      className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer shrink-0 opacity-100 md:opacity-80 group-hover:opacity-100"
                    >
                      <Plus className="w-4 h-4 md:w-3.5 md:h-3.5" />
                    </button>
                  </div>

                  {/* Day Tasks List with Vertical Timeline Track Centered Directly on Node Circles */}
                  <div
                    className={`relative md:flex-1 flex flex-col ${
                      isSidebarOpen
                        ? 'md:overflow-y-auto pt-3 pb-3 pr-2.5 pl-3 sm:pl-3.5 gap-3 md:gap-2.5'
                        : 'md:overflow-hidden pt-3 pb-3 pr-2 pl-3 sm:pl-3.5 gap-3 md:gap-2'
                    }`}
                  >
                    {/* Vertical timeline dashed line centered precisely through the node circles */}
                    {dayEvents.length > 0 && (
                      <div className="absolute left-[24px] sm:left-[26px] top-3 bottom-5 w-0 border-l-2 border-dashed border-teal-300 pointer-events-none z-0 -translate-x-1/2" />
                    )}

                    {dayEvents.map((event) => {
                      const evOutline = getEventOutline(event, departments);
                      const titleText = (event.title && event.title.trim()) || 
                                        (event as any).task || 
                                        (event as any).name || 
                                        (event.description && event.description.trim()) || 
                                        'Tugas Tanpa Judul';
                      const isCompleted = event.status === 'completed';

                      return (
                        <div key={event.id} className="relative flex items-start gap-2 sm:gap-2.5 group/item w-full min-w-0 z-10">
                          {/* Timeline node circle wrapper centered at 12px from start of item */}
                          <div className="w-6 h-6 flex items-center justify-center shrink-0 z-10 mt-1 sm:mt-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onToggleEventStatus) {
                                  onToggleEventStatus(event.id);
                                }
                              }}
                              title={isCompleted ? "Tandai Belum Selesai (Pending)" : "Tandai Selesai (Complete)"}
                              className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                isCompleted
                                  ? 'bg-[#00897b] text-white shadow-2xs hover:bg-[#00796b] ring-2 ring-teal-50'
                                  : 'border-2 border-rose-500 hover:border-rose-600 bg-white hover:bg-rose-50 text-rose-500 shadow-2xs'
                              }`}
                            >
                              <Check className={`w-3 h-3 ${isCompleted ? 'stroke-[3] text-white' : 'stroke-[2.5] stroke-rose-500 text-rose-500'}`} />
                            </button>
                          </div>

                          {/* Floating White Timeline Card matching IMG_1013 soft ambient shadow */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectEvent(event);
                            }}
                            className={`flex-1 rounded-2xl bg-white shadow-[0_10px_25px_-4px_rgba(0,0,0,0.06),0_4px_10px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_32px_-4px_rgba(0,0,0,0.10),0_6px_14px_-2px_rgba(0,0,0,0.04)] transition-all duration-200 cursor-pointer p-2.5 sm:p-3 flex flex-col group/card shrink-0 min-w-0 ${
                              isCompleted ? 'bg-slate-50/60 shadow-xs' : 'hover:-translate-y-0.5'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-normal text-slate-900 leading-snug break-words">
                                {titleText}
                              </h4>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {dayEvents.length === 0 && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCreateModal(day.iso, 10);
                        }}
                        className={`rounded-2xl border border-dashed border-slate-200 hover:border-teal-300 hover:bg-teal-50/20 flex flex-row md:flex-col items-center justify-center gap-1.5 md:gap-0 text-slate-400 hover:text-teal-700 transition-all cursor-pointer p-2 text-center shrink-0 ${
                          isSidebarOpen ? 'h-11 md:h-24' : 'h-11 md:h-20'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5 md:mb-1 text-slate-300 group-hover:text-teal-600" />
                        <span className="text-[11px] font-semibold">+ Add Task</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      )}

      {/* 4. ALTERNATIVE: SEMUA MINGGU MATRIX (Jika user mengklik tombol 'Semua Minggu') */}
      {weeklyMode === 'month_weeks' && focusedWeekNumber === 'all' && (
        <div className="flex-1 min-w-0 min-h-0 overflow-auto flex flex-col bg-slate-50/20">
          {/* Top Columns Header (SENIN - MINGGU) */}
          <div className="grid grid-cols-[105px_repeat(7,minmax(140px,1fr))] min-w-[1085px] border-b border-slate-200/80 sticky top-0 bg-white z-20 shadow-2xs">
            <div className="p-2 text-[10px] font-bold text-slate-400 font-mono flex items-center justify-center border-r border-slate-100 bg-slate-50/60">
              <span>WEEKS \ DAYS</span>
            </div>

            {WEEKDAYS_SENIN_MINGGU.map((day) => (
              <div
                key={day.id}
                className="p-2 text-center border-r border-slate-100 last:border-r-0 bg-white"
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs font-bold text-slate-800 capitalize">
                    {day.nameId}
                  </span>
                  <span className="text-[9.5px] font-medium text-slate-400 uppercase hidden sm:inline">
                    ({day.shortEn})
                  </span>
                </div>
                <span className="text-[9.5px] text-slate-400 block font-mono">
                  {day.nameEn}
                </span>
              </div>
            ))}
          </div>

          {/* Rows: All weeks */}
          <div className="flex-1 flex flex-col divide-y divide-slate-100 min-w-[1085px]">
            {monthWeeks.map((week) => {
              const weekEvents = events.filter((e) =>
                week.days.some((d) => d.iso === e.date)
              );
              const isSelectedWeek = week.isCurrentWeek;

              if (!isSelectedWeek) {
                return (
                  <div
                    key={week.weekNumber}
                    onClick={() => handleSelectWeek(week)}
                    className="grid grid-cols-[105px_repeat(7,minmax(140px,1fr))] h-11 border-b border-slate-100 bg-white hover:bg-teal-50/20 transition-all cursor-pointer group select-none"
                    title={`Klik untuk membuka dan fokus ke ${week.weekLabelId} (${week.dateRangeLabel})`}
                  >
                    <div className="px-2.5 py-1.5 border-r border-slate-100 flex items-center justify-between bg-slate-50/40 group-hover:bg-teal-50/40 transition-colors">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00897b] transition-transform group-hover:translate-x-0.5 shrink-0" />
                        <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 truncate">
                          {week.weekLabelId}
                        </span>
                      </div>
                      {weekEvents.length > 0 && (
                        <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 bg-slate-100 group-hover:bg-white text-slate-600 group-hover:text-[#00897b] rounded-full shrink-0 border border-slate-200/50">
                          {weekEvents.length}
                        </span>
                      )}
                    </div>

                    {week.days.map((day) => {
                      const dayEvents = events.filter((e) => e.date === day.iso);

                      return (
                        <div
                          key={day.iso}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDate(day.date);
                          }}
                          className={`px-2 py-1 border-r border-slate-100 last:border-r-0 flex items-center justify-center relative transition-colors ${
                            day.isCurrentMonth
                              ? 'text-slate-700 hover:bg-teal-50/30'
                              : 'text-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                                day.isToday
                                  ? 'bg-slate-900 text-white font-bold'
                                  : day.isCurrentMonth
                                  ? 'text-slate-700 group-hover:text-slate-900'
                                  : 'text-slate-300'
                              }`}
                            >
                              {day.dayNumber}
                            </span>
                            {dayEvents.length > 0 && (
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-[#00897b] shrink-0"
                                title={`${dayEvents.length} task`}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              // Selected week expanded in matrix view
              return (
                <div
                  key={week.weekNumber}
                  className="grid grid-cols-[105px_repeat(7,minmax(140px,1fr))] min-h-[200px] transition-colors bg-teal-50/15 border-b border-teal-100/60 shadow-2xs"
                >
                  <div className="p-2.5 border-r border-teal-200/60 flex flex-col justify-between bg-teal-50/60 select-none">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold tracking-tight text-[#00897b]">
                            {week.weekLabelId}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00897b] animate-pulse"></span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-[#00897b]" />
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 block mt-1">
                        {week.dateRangeLabel}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-col gap-1">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9.5px] font-bold font-mono bg-white text-[#00897b] shadow-2xs border border-teal-200/80 text-center">
                        {weekEvents.length} tasks
                      </span>
                      <button
                        onClick={() => handleSelectWeek(week)}
                        className="text-[10px] font-bold text-[#00897b] hover:underline text-left cursor-pointer mt-0.5"
                      >
                        Fokus Minggu Ini →
                      </button>
                    </div>
                  </div>

                  {week.days.map((day) => {
                    const isSelected = day.iso === selectedIso;
                    const dayEvents = events.filter((e) => e.date === day.iso);

                    return (
                      <div
                        key={day.iso}
                        onClick={() => onSelectDate(day.date)}
                        className={`p-2 border-r border-slate-100 last:border-r-0 flex flex-col justify-between transition-colors cursor-pointer group relative ${
                          isSelected
                            ? 'bg-teal-50/40 ring-1 ring-inset ring-[#00897b]/40'
                            : day.isCurrentMonth
                            ? 'bg-white hover:bg-slate-50/70'
                            : 'bg-slate-50/40 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-100/60">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-[#00897b] text-white shadow-2xs ring-2 ring-[#00897b]/20'
                                : day.isToday
                                ? 'bg-slate-900 text-white font-bold'
                                : day.isCurrentMonth
                                ? 'text-slate-800'
                                : 'text-slate-400'
                            }`}
                          >
                            {day.dayNumber}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenCreateModal(day.iso, 10);
                            }}
                            className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                          >
                            <Plus className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        </div>

                        <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[160px] pr-0.5">
                          {dayEvents.map((event) => {
                            const evOutline = getEventOutline(event, departments);
                            const isImprovement = evOutline === 'Improvement';
                            const isBuy = evOutline === 'Buy';
                            const titleText = (event.title && event.title.trim()) || 
                                              (event as any).task || 
                                              (event as any).name || 
                                              (event.description && event.description.trim()) || 
                                              'Tugas Tanpa Judul';
                            const isCompleted = event.status === 'completed';

                            return (
                              <div
                                key={event.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectEvent(event);
                                }}
                                className={`p-1.5 px-2 rounded-xl bg-white shadow-[0_4px_18px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition-all cursor-pointer flex items-center gap-1.5 group/card ${
                                  isCompleted ? 'opacity-80 bg-slate-50/50' : 'hover:-translate-y-0.5'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onToggleEventStatus) {
                                      onToggleEventStatus(event.id);
                                    }
                                  }}
                                  title={isCompleted ? "Tandai Belum Selesai" : "Tandai Selesai"}
                                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                    isCompleted
                                      ? 'bg-[#00897b] text-white shadow-2xs'
                                      : 'border border-slate-300 hover:border-[#00897b] text-slate-300 hover:text-[#00897b]'
                                  }`}
                                >
                                  <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                                </button>
                                <h4
                                  className={`text-xs font-normal leading-snug break-words whitespace-normal flex-1 truncate ${
                                    isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'
                                  }`}
                                >
                                  {titleText}
                                </h4>
                              </div>
                            );
                          })}

                          {dayEvents.length === 0 && (
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenCreateModal(day.iso, 10);
                              }}
                              className="h-full min-h-[46px] rounded-lg border border-dashed border-transparent group-hover:border-slate-200 flex items-center justify-center text-[10px] text-slate-300 group-hover:text-slate-400 transition-colors"
                            >
                              <span className="opacity-0 group-hover:opacity-100">+ Tambah</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. TIMELINE JAM VIEW (Single Week with Hourly Timeline) */}
      {weeklyMode === 'single_week_hours' && (
        <div className="flex-1 min-w-0 min-h-0 overflow-auto flex flex-col">
          {/* Header 7 Days (Senin - Minggu) */}
          <div className="grid grid-cols-[80px_repeat(7,minmax(140px,1fr))] min-w-[1060px] border-b border-slate-100 sticky top-0 bg-white z-20 shadow-2xs">
            <div className="p-3 text-[11px] font-bold text-slate-400 font-mono flex items-center justify-center border-r border-slate-100 bg-slate-50/60">
              {timezone}
            </div>

            {singleWeekDays.map((day) => {
              const isSelected = day.iso === selectedIso;
              return (
                <button
                  key={day.iso}
                  onClick={() => onSelectDate(day.date)}
                  className={`p-3 text-center transition-colors cursor-pointer border-r border-slate-100 last:border-r-0 ${
                    isSelected ? 'bg-teal-50/40 ring-1 ring-inset ring-[#00897b]' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 capitalize">
                      {day.dayNameId}
                    </span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-[#00897b] text-white shadow-2xs' : 'text-slate-800'
                    }`}>
                      {day.dayNumber}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Hourly Timeline Canvas */}
          <div className="flex-1 relative min-h-[720px] min-w-[1060px]">
            <div className="absolute inset-0 grid grid-rows-9 pointer-events-none">
              {hours.map((hour) => (
                <div key={hour} className="border-b border-slate-100/90 h-[80px]" />
              ))}
            </div>

            <div className="relative z-10 grid grid-cols-[80px_repeat(7,minmax(140px,1fr))] h-full">
              <div className="flex flex-col border-r border-slate-100/80 bg-slate-50/30">
                {hours.map((hour) => (
                  <div 
                    key={hour}
                    className="h-[80px] text-[11px] font-medium text-slate-400 px-2 pt-1 flex items-start justify-center font-mono"
                  >
                    {formatHourLabel(hour)}
                  </div>
                ))}
              </div>

              {singleWeekDays.map((day) => {
                const dayIso = day.iso;
                const isSelected = dayIso === selectedIso;
                const dayEvents = events.filter((e) => e.date === dayIso);

                return (
                  <div
                    key={dayIso}
                    className={`relative border-r border-slate-100 last:border-r-0 min-h-[720px] ${
                      isSelected ? 'bg-teal-50/15' : ''
                    }`}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickY = e.clientY - rect.top;
                      const calculatedHour = Math.min(17, Math.max(9, Math.floor(clickY / 80) + 9));
                      onOpenCreateModal(dayIso, calculatedHour);
                    }}
                  >
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="h-[80px] hover:bg-slate-50/60 transition-colors group relative cursor-pointer"
                        title={`Klik untuk menjadwalkan pada ${day.dayNameId} ${formatHourLabel(hour)}`}
                      >
                        <span className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 text-[10px] text-slate-400 font-mono">
                          +
                        </span>
                      </div>
                    ))}

                    <div className="absolute inset-0 pointer-events-none p-1.5 flex flex-col gap-2">
                      {dayEvents.map((event) => {
                        const evOutline = getEventOutline(event, departments);
                        const isImprovement = evOutline === 'Improvement';
                        const isBuy = evOutline === 'Buy';
                        const topOffset = Math.max(0, (event.startHour - 9) * 80);
                        const height = Math.max(54, event.durationHours * 80 - 8);
                        const titleText = (event.title && event.title.trim()) || 
                                          (event as any).task || 
                                          (event as any).name || 
                                          (event.description && event.description.trim()) || 
                                          'Tugas Tanpa Judul';
                        const isCompleted = event.status === 'completed';

                        return (
                          <div
                            key={event.id}
                            style={{
                              top: `${topOffset}px`,
                              height: `${height}px`,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectEvent(event);
                            }}
                            className={`absolute left-1.5 right-1.5 bg-white shadow-[0_10px_25px_-4px_rgba(0,0,0,0.06),0_4px_10px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_32px_-4px_rgba(0,0,0,0.10),0_6px_14px_-2px_rgba(0,0,0,0.04)] p-2.5 px-3 rounded-2xl transition-all cursor-pointer pointer-events-auto flex items-start gap-2 overflow-hidden group ${
                              isCompleted ? 'opacity-80 bg-slate-50/50 shadow-xs' : 'hover:-translate-y-0.5'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onToggleEventStatus) {
                                  onToggleEventStatus(event.id);
                                }
                              }}
                              title={isCompleted ? "Belum Selesai" : "Tandai Selesai"}
                              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                                isCompleted
                                  ? 'bg-[#00897b] text-white shadow-2xs'
                                  : 'border border-slate-300 hover:border-[#00897b] text-slate-300 hover:text-[#00897b]'
                              }`}
                            >
                              <Check className="w-3 h-3 stroke-[2.5]" />
                            </button>
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-xs font-normal leading-snug break-words whitespace-normal ${
                                isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'
                              }`}>
                                {titleText}
                              </h4>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
