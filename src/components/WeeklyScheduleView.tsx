import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Calendar as CalendarIcon,
  Check
} from 'lucide-react';
import { TaskEvent, ViewMode, DepartmentItem } from '../types';
import { DEFAULT_DEPARTMENTS } from '../data/initialData';
import { formatDateToISO, formatMonthYear, getEventStartHour, getMonthWeeks, WeekRow } from '../utils/dateUtils';
import { getTaskCapsuleClass } from '../utils/themeStyles';

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

  const [focusedWeekNumber, setFocusedWeekNumber] = useState<number>(() => currentSelectedWeek?.weekNumber ?? 1);
  const focusedWeekBtnRef = useRef<HTMLButtonElement | null>(null);

  // Sync focused week whenever selectedDate changes
  useEffect(() => {
    if (currentSelectedWeek) {
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

  return (
    <div className="flex-1 flex flex-col min-w-0 md:min-h-0 bg-white max-md:overflow-visible md:overflow-hidden select-none relative md:h-full">
      
      {/* 1. TOP WEEKLY SELECTOR BAR */}
      <div className="px-3.5 sm:px-6 py-1 sm:py-1.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0 overflow-x-auto touch-pan-x [-webkit-overflow-scrolling:touch]">
        <div className="flex items-center gap-2.5 overflow-x-auto touch-pan-x [-webkit-overflow-scrolling:touch] py-0.5 w-full">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider pr-3 border-r border-slate-200 shrink-0">
            <CalendarIcon className="w-4 h-4 text-[#0ea5e9]" />
            <span>{formatMonthYear(selectedDate)}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {monthWeeks.map((week) => {
              const isFocused = focusedWeekNumber === week.weekNumber;
              const weekEventsCount = events.filter((e) =>
                week.days.some((d) => d.iso === e.date || (e.dueDate && d.iso >= e.date && d.iso <= e.dueDate))
              ).length;
              const dayRangeOnly = `${week.days[0].dayNumber} - ${week.days[6].dayNumber}`;

              return (
                <button
                  key={week.weekNumber}
                  ref={(el) => {
                    if (isFocused) {
                      focusedWeekBtnRef.current = el;
                    }
                  }}
                  onClick={() => handleSelectWeek(week)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isFocused
                      ? 'bg-[#38bdf8] text-white shadow-sm ring-2 ring-sky-100'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                  title={`Fokus ke ${week.weekLabelId} (${dayRangeOnly})`}
                >
                  <span>{week.weekLabelId}</span>
                  <span className={`text-[10px] font-normal hidden lg:inline px-1 py-0.2 rounded-full ${
                    isFocused ? 'bg-white/20 text-white' : 'text-slate-400'
                  }`}>
                    {dayRangeOnly}
                  </span>
                  {weekEventsCount > 0 && (
                    <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                      isFocused ? 'bg-white text-[#0284c7]' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {weekEventsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. SEAMLESS OPEN WEEKLY TIMELINE */}
      {focusedWeek && (
        <div className="flex-1 min-w-0 md:min-h-0 bg-white md:overflow-x-auto md:overflow-y-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] px-3.5 py-2.5 sm:px-6 sm:pt-3 sm:pb-4 max-md:pb-28 flex flex-col gap-6">
          {[focusedWeek].map((weekItem) => {
            const weekStartIso = weekItem.days[0].iso;
            const weekEndIso = weekItem.days[6].iso;

            const isMultiDayEvent = (e: TaskEvent) => (e.dueDate || e.date) > e.date;

            const sortEventsByTime = (list: TaskEvent[]) =>
              [...list].sort((a, b) => {
                const timeDiff = getEventStartHour(a) - getEventStartHour(b);
                if (Math.abs(timeDiff) > 0.001) return timeDiff;
                const multiDiff = Number(isMultiDayEvent(a)) - Number(isMultiDayEvent(b));
                if (multiDiff !== 0) return multiDiff;
                if (a.date !== b.date) return a.date.localeCompare(b.date);
                return (a.title || '').localeCompare(b.title || '');
              });

            const weekEvents = sortEventsByTime(
              events.filter((e) => {
                const start = e.date;
                const end = e.dueDate || e.date;
                return start <= weekEndIso && end >= weekStartIso;
              })
            );

            type EmptyAddItem = {
              type: 'empty-add';
              key: string;
              dayIso: string;
              colStart: number;
              rowStart: number;
              rowEnd: number;
            };

            type SingleBucketItem = {
              type: 'single-bucket';
              key: string;
              colIdx: number;
              colStart: number;
              rowStart: number;
              rowEnd: number;
              events: TaskEvent[];
            };

            type MultiTaskItem = {
              type: 'multi-task';
              key: string;
              event: TaskEvent;
              dueDate: string;
              colStart: number;
              colEnd: number;
              rowStart: number;
              rowEnd: number;
            };

            type PlacedDesktopItem = EmptyAddItem | SingleBucketItem | MultiTaskItem;

            const desktopPlacedItems: PlacedDesktopItem[] = [];
            const nextRowForCol = [1, 1, 1, 1, 1, 1, 1];
            const openBucketForCol: (SingleBucketItem | null)[] = [null, null, null, null, null, null, null];

            const emptyAddItems: EmptyAddItem[] = [];
            weekItem.days.forEach((day, dayIdx) => {
              const hasEventsForDay = weekEvents.some((e) => {
                const start = e.date;
                const end = e.dueDate || e.date;
                return start <= day.iso && end >= day.iso;
              });
              if (!hasEventsForDay) {
                emptyAddItems.push({
                  type: 'empty-add',
                  key: `empty-${day.iso}`,
                  dayIso: day.iso,
                  colStart: dayIdx + 1,
                  rowStart: 1,
                  rowEnd: 2,
                });
              }
            });

            desktopPlacedItems.push(...emptyAddItems);

            for (const event of weekEvents) {
              const start = event.date;
              const dueDate = event.dueDate || event.date;
              const isMultiDay = dueDate > start;

              if (isMultiDay) {
                const clampedStartIso = start < weekStartIso ? weekStartIso : start;
                const clampedEndIso = dueDate > weekEndIso ? weekEndIso : dueDate;
                const startIdx = weekItem.days.findIndex((d) => d.iso === clampedStartIso);
                const endIdx = weekItem.days.findIndex((d) => d.iso === clampedEndIso);
                const validStart = startIdx !== -1 ? startIdx : 0;
                const validEnd = endIdx !== -1 ? endIdx : 6;
                const rowStart = Math.max(...nextRowForCol.slice(validStart, validEnd + 1));

                for (let c = validStart; c <= validEnd; c++) {
                  const openBucket = openBucketForCol[c];
                  if (openBucket) {
                    openBucket.rowEnd = rowStart;
                    openBucketForCol[c] = null;
                  }
                  nextRowForCol[c] = rowStart + 1;
                }

                desktopPlacedItems.push({
                  type: 'multi-task',
                  key: `task-${event.id}`,
                  event,
                  dueDate,
                  colStart: validStart + 1,
                  colEnd: validEnd + 2,
                  rowStart,
                  rowEnd: rowStart + 1,
                });
              } else {
                const dayIdx = weekItem.days.findIndex((d) => d.iso === start);
                if (dayIdx === -1) continue;
                const existingBucket = openBucketForCol[dayIdx];
                if (existingBucket) {
                  existingBucket.events.push(event);
                } else {
                  const rowStart = nextRowForCol[dayIdx];
                  const newBucket: SingleBucketItem = {
                    type: 'single-bucket',
                    key: `bucket-${dayIdx}-r${rowStart}`,
                    colIdx: dayIdx,
                    colStart: dayIdx + 1,
                    rowStart,
                    rowEnd: rowStart + 1,
                    events: [event],
                  };
                  openBucketForCol[dayIdx] = newBucket;
                  desktopPlacedItems.push(newBucket);
                  nextRowForCol[dayIdx] = rowStart + 1;
                }
              }
            }

            const maxGridEndRow = Math.max(2, ...nextRowForCol);
            for (const item of emptyAddItems) {
              item.rowEnd = maxGridEndRow;
            }
            for (let c = 0; c < 7; c++) {
              const openBucket = openBucketForCol[c];
              if (openBucket) {
                openBucket.rowEnd = maxGridEndRow;
              }
            }

            return (
              <div key={weekItem.weekNumber} className="flex flex-col">

                {/* MOBILE VIEW (< md): Clean Full-Width Vertical Weekly Stack sorted by time */}
                <div className="flex md:hidden flex-col gap-4">
                  {/* Day-by-Day Vertical Sections */}
                  {weekItem.days.map((day) => {
                    const isSelected = day.iso === selectedIso;
                    const dayEvents = sortEventsByTime(
                      events.filter((e) => {
                        const start = e.date;
                        const end = e.dueDate || e.date;
                        return start <= day.iso && end >= day.iso;
                      })
                    );

                    return (
                      <div key={day.iso} className="flex flex-col gap-2.5">
                        <div
                          onClick={() => onSelectDate(day.date)}
                          className={`px-3.5 py-2.5 rounded-2xl flex items-center justify-between gap-2 cursor-pointer transition-all ${
                            isSelected ? 'bg-[#38bdf8] text-white shadow-md shadow-sky-500/20' : 'bg-slate-50 text-slate-800 border border-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs shadow-2xs ${
                              isSelected ? 'bg-white text-[#0284c7]' : 'bg-white text-slate-800 border border-slate-200'
                            }`}>
                              {day.dayNumber}
                            </span>
                            <span className="font-extrabold text-sm capitalize">
                              {day.dayNameId}
                            </span>
                            {dayEvents.length > 0 && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'
                              }`}>
                                {dayEvents.length}
                              </span>
                            )}
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

                        {dayEvents.length > 0 && (
                          <div className="flex flex-col gap-2.5 pl-1">
                            {dayEvents.map((event) => {
                              const capsuleBg = getTaskCapsuleClass(event, departments);
                              const titleText = event.title || 'Tugas Tanpa Judul';
                              const isCompleted = event.status === 'completed';
                              const dueDate = event.dueDate || event.date;
                              const isMultiDay = dueDate > event.date;

                              return (
                                <div
                                  key={event.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectEvent(event);
                                  }}
                                  className={`w-full py-3.5 px-4 rounded-3xl shadow-md cursor-pointer transition-all flex items-start justify-between gap-3 ${capsuleBg}`}
                                >
                                  <div className="min-w-0 flex-1">
                                    {isMultiDay && (
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-[10px] font-mono uppercase bg-white/25 px-2.5 py-0.5 rounded-full font-bold text-white">
                                          {event.date} → {dueDate}
                                        </span>
                                      </div>
                                    )}
                                    <h5 className="text-sm font-bold break-words whitespace-normal leading-snug">
                                      {titleText}
                                    </h5>
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
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* DESKTOP VIEW (>= md): 7-Column Grid sorted chronologically by hour */}
                <div className="hidden md:flex flex-col">
                  {/* Day Headers Row (Senin, Selasa, Rabu, etc.) */}
                  <div className="grid grid-cols-7 gap-3 min-w-[1100px] pb-2.5 border-b border-slate-200 shrink-0">
                    {weekItem.days.map((day) => {
                      const isSelected = day.iso === selectedIso;

                      return (
                        <div
                          key={day.iso}
                          onClick={() => onSelectDate(day.date)}
                          className={`px-3.5 py-2 rounded-2xl flex items-center justify-between gap-2 cursor-pointer transition-all ${
                            isSelected ? 'bg-[#38bdf8] text-white shadow-md shadow-sky-500/20' : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm capitalize">
                              {day.dayNameId}
                            </span>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-xs shadow-2xs ${
                              isSelected ? 'bg-white text-[#0284c7]' : 'bg-white text-slate-800 border border-slate-200'
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
                            className={`p-1 rounded-xl transition-all cursor-pointer ${
                              isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-200/80 text-slate-500'
                            }`}
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Weekly Timeline Area with unified 7-column grid (tight per-column stacks + interleaved multi-day bars) */}
                  <div className="flex-1 min-w-[1100px] pt-2.5 grid grid-cols-7 gap-3 items-start content-start">
                    {desktopPlacedItems.map((item) => {
                      if (item.type === 'empty-add') {
                        return (
                          <div
                            key={item.key}
                            style={{
                              gridColumnStart: item.colStart,
                              gridRowStart: item.rowStart,
                              gridRowEnd: item.rowEnd,
                            }}
                            onClick={() => onOpenCreateModal(item.dayIso, 10)}
                            className="h-20 self-start rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#38bdf8] hover:bg-sky-50/30 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#0284c7] transition-all cursor-pointer p-2 text-center"
                          >
                            <Plus className="w-4 h-4 text-slate-300" />
                            <span className="text-[11px] font-semibold">+ Add Task</span>
                          </div>
                        );
                      }

                      if (item.type === 'single-bucket') {
                        return (
                          <div
                            key={item.key}
                            style={{
                              gridColumnStart: item.colStart,
                              gridRowStart: item.rowStart,
                              gridRowEnd: item.rowEnd,
                            }}
                            className="flex flex-col gap-3 self-start min-w-0"
                          >
                            {item.events.map((event) => {
                              const capsuleBg = getTaskCapsuleClass(event, departments);
                              const titleText = event.title || 'Tugas Tanpa Judul';
                              const isCompleted = event.status === 'completed';

                              return (
                                <div
                                  key={`task-${event.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectEvent(event);
                                  }}
                                  className={`w-full py-3.5 px-4 rounded-3xl shadow-md cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between gap-3 ${capsuleBg}`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <h5 className="text-xs sm:text-sm font-bold break-words whitespace-normal leading-snug text-white">
                                      {titleText}
                                    </h5>
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
                          </div>
                        );
                      }

                      const { event, dueDate, colStart, colEnd, rowStart, rowEnd } = item;
                      const capsuleBg = getTaskCapsuleClass(event, departments);
                      const titleText = event.title || 'Tugas Tanpa Judul';
                      const isCompleted = event.status === 'completed';

                      return (
                        <div
                          key={item.key}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent(event);
                          }}
                          style={{
                            gridColumnStart: colStart,
                            gridColumnEnd: colEnd,
                            gridRowStart: rowStart,
                            gridRowEnd: rowEnd,
                          }}
                          className={`w-full self-start py-3.5 px-4 rounded-3xl shadow-md cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between gap-3 ${capsuleBg}`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-mono uppercase bg-white/25 px-2.5 py-0.5 rounded-full font-bold text-white">
                                {event.date} → {dueDate}
                              </span>
                            </div>
                            <h5 className="text-sm sm:text-base tracking-tight font-bold break-words whitespace-normal leading-snug text-white">
                              {titleText}
                            </h5>
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
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WeeklyScheduleView;
