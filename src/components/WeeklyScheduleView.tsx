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
import { MonthCalendarPicker } from './MonthCalendarPicker';

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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const focusedWeekBtnRef = useRef<HTMLButtonElement | null>(null);
  const calendarPickerRef = useRef<HTMLDivElement | null>(null);

  // Sync focused week whenever selectedDate changes
  useEffect(() => {
    if (currentSelectedWeek) {
      setFocusedWeekNumber(currentSelectedWeek.weekNumber);
    }
  }, [selectedIso]);

  // Close calendar picker when clicking outside
  useEffect(() => {
    if (!isCalendarOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarPickerRef.current && !calendarPickerRef.current.contains(e.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCalendarOpen]);

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
      <div className="px-3.5 sm:px-4 xl:px-6 py-1 sm:py-1.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0 relative z-30">
        <div className="flex items-center gap-2.5 py-0.5 w-full min-w-0">
          <div ref={calendarPickerRef} className="relative hidden sm:flex items-center pr-3 border-r border-slate-200 shrink-0">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsCalendarOpen((prev) => !prev)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsCalendarOpen((prev) => !prev);
                }
              }}
              title="Klik untuk membuka kalender"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#0ea5e9] uppercase tracking-wider cursor-pointer px-2 py-1 -mx-2 -my-1 rounded-xl hover:bg-sky-50/80 transition-colors"
            >
              <CalendarIcon className="w-4 h-4 text-[#0ea5e9]" />
              <span>{formatMonthYear(selectedDate)}</span>
            </div>

            {isCalendarOpen && (
              <MonthCalendarPicker
                selectedDate={selectedDate}
                onSelectDate={onSelectDate}
                onClose={() => setIsCalendarOpen(false)}
                align="left"
              />
            )}
          </div>

          <div className="flex items-center gap-1.5 xl:gap-2 flex-1 min-w-0 overflow-x-auto touch-pan-x [-webkit-overflow-scrolling:touch]">
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
                  className={`flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isFocused
                      ? 'bg-[#38bdf8] text-white shadow-sm ring-2 ring-sky-100'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                  title={`Fokus ke ${week.weekLabelId} (${dayRangeOnly})`}
                >
                  <span>{week.weekLabelId}</span>
                  <span className={`text-[10px] font-normal hidden xl:inline px-1 py-0.2 rounded-full ${
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
        <div className={`flex-1 min-w-0 md:min-h-0 bg-white ${isSidebarOpen ? 'md:overflow-x-auto xl:overflow-x-hidden' : 'md:overflow-x-hidden'} md:overflow-y-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] px-3.5 py-2.5 sm:px-4 xl:px-6 sm:pt-3 sm:pb-4 max-md:pb-28 flex flex-col gap-6`}>
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

            const GRID_COLS_CLASS: Record<number, string> = {
              1: 'grid-cols-1',
              2: 'grid-cols-2',
              3: 'grid-cols-3',
              4: 'grid-cols-4',
              5: 'grid-cols-5',
              6: 'grid-cols-6',
              7: 'grid-cols-7',
            };

            const hasEventsForDay = weekItem.days.map((day) =>
              weekEvents.some((e) => {
                const start = e.date;
                const end = e.dueDate || e.date;
                return start <= day.iso && end >= day.iso;
              })
            );

            const getClampedSpan = (ev: TaskEvent, minCol: number, maxCol: number) => {
              const start = ev.date;
              const dueDate = ev.dueDate || ev.date;
              const clampedStartIso = start < weekStartIso ? weekStartIso : start;
              const clampedEndIso = dueDate > weekEndIso ? weekEndIso : dueDate;
              const startIdx = weekItem.days.findIndex((d) => d.iso === clampedStartIso);
              const endIdx = weekItem.days.findIndex((d) => d.iso === clampedEndIso);
              const rawStart = startIdx !== -1 ? startIdx : 0;
              const rawEnd = endIdx !== -1 ? endIdx : 6;
              return {
                s: Math.max(minCol, rawStart),
                e: Math.min(maxCol, rawEnd),
              };
            };

            const estimateSinglePx = (ev: TaskEvent) => {
              const len = (ev.title || '').trim().length;
              const lines = Math.max(1, Math.min(4, Math.ceil(len / 11)));
              return 28 + lines * 20;
            };

            const estimateMultiPx = (ev: TaskEvent, colSpan: number) => {
              const len = (ev.title || '').trim().length;
              const charsPerLine = Math.max(12, colSpan * 18);
              const lines = Math.max(1, Math.min(3, Math.ceil(len / charsPerLine)));
              return 54 + lines * 22;
            };

            const estimateRegionColHeights = (
              colStartIdx: number,
              colEndIdx: number,
              evList: TaskEvent[]
            ): number[] => {
              const heights: Record<number, number> = {};
              for (let c = colStartIdx; c <= colEndIdx; c++) heights[c] = 0;

              for (const ev of evList) {
                if (isMultiDayEvent(ev)) {
                  const { s, e } = getClampedSpan(ev, colStartIdx, colEndIdx);
                  const h = estimateMultiPx(ev, e - s + 1);
                  let maxBase = 0;
                  for (let c = s; c <= e; c++) {
                    if (heights[c] > maxBase) maxBase = heights[c];
                  }
                  const nextH = maxBase + (maxBase > 0 ? 12 : 0) + h;
                  for (let c = s; c <= e; c++) heights[c] = nextH;
                } else {
                  const dayIdx = weekItem.days.findIndex((d) => d.iso === ev.date);
                  if (dayIdx >= colStartIdx && dayIdx <= colEndIdx) {
                    const h = estimateSinglePx(ev);
                    heights[dayIdx] += (heights[dayIdx] > 0 ? 12 : 0) + h;
                  }
                }
              }
              return Array.from({ length: colEndIdx - colStartIdx + 1 }, (_, i) => heights[colStartIdx + i]);
            };

            const renderEmptyAddCard = (dayIso: string, key: string) => (
              <div
                key={key}
                onClick={() => onOpenCreateModal(dayIso, 10)}
                className="h-20 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#38bdf8] hover:bg-sky-50/30 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#0284c7] transition-all cursor-pointer p-2 text-center"
              >
                <Plus className="w-4 h-4 text-slate-300" />
                <span className="text-[11px] font-semibold">+ Add Task</span>
              </div>
            );

            const renderSingleTaskCard = (event: TaskEvent) => {
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
                  className={`w-full py-3 xl:py-3.5 px-3 xl:px-4 rounded-3xl shadow-md cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between gap-2 xl:gap-3 ${capsuleBg}`}
                >
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs xl:text-sm font-bold break-words whitespace-normal leading-snug text-white">
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
                    className={`w-5 h-5 xl:w-6 xl:h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isCompleted ? 'bg-white text-emerald-700 shadow-xs' : 'bg-white/30 hover:bg-white/50 text-white'
                    }`}
                  >
                    <Check className="w-3 xl:w-3.5 h-3 xl:h-3.5 stroke-[3]" />
                  </button>
                </div>
              );
            };

            const renderMultiTaskCard = (event: TaskEvent) => {
              const dueDate = event.dueDate || event.date;
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
                  className={`w-full py-3 xl:py-3.5 px-3 xl:px-4 rounded-3xl shadow-md cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between gap-2 xl:gap-3 ${capsuleBg}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase bg-white/25 px-2.5 py-0.5 rounded-full font-bold text-white">
                        {event.date} → {dueDate}
                      </span>
                    </div>
                    <h5 className="text-xs xl:text-base tracking-tight font-bold break-words whitespace-normal leading-snug text-white">
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
                    className={`w-6 h-6 xl:w-7 xl:h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isCompleted ? 'bg-white text-emerald-700 shadow-xs' : 'bg-white/30 hover:bg-white/50 text-white'
                    }`}
                  >
                    <Check className="w-3.5 xl:w-4 h-3.5 xl:h-4 stroke-[3]" />
                  </button>
                </div>
              );
            };

            const renderDesktopCrossingFallback = (
              colStartIdx: number,
              colEndIdx: number,
              regionEvents: TaskEvent[],
              keyPrefix: string,
              showEmptyAdd: boolean
            ): React.ReactNode => {
              const span = colEndIdx - colStartIdx + 1;
              type BucketCell = {
                type: 'single-bucket';
                key: string;
                colStart: number;
                rowStart: number;
                rowEnd: number;
                events: TaskEvent[];
              };
              type MultiCell = {
                type: 'multi-task';
                key: string;
                event: TaskEvent;
                colStart: number;
                colEnd: number;
                rowStart: number;
                rowEnd: number;
              };
              type EmptyCell = {
                type: 'empty-add';
                key: string;
                dayIso: string;
                colStart: number;
                rowStart: number;
                rowEnd: number;
              };

              const cells: (BucketCell | MultiCell | EmptyCell)[] = [];
              const nextRow = Array(span).fill(1);
              const openBucket: (BucketCell | null)[] = Array(span).fill(null);
              const emptyCells: EmptyCell[] = [];

              if (showEmptyAdd) {
                for (let c = colStartIdx; c <= colEndIdx; c++) {
                  if (!hasEventsForDay[c]) {
                    emptyCells.push({
                      type: 'empty-add',
                      key: `${keyPrefix}-empty-${c}`,
                      dayIso: weekItem.days[c].iso,
                      colStart: c - colStartIdx + 1,
                      rowStart: 1,
                      rowEnd: 2,
                    });
                  }
                }
                cells.push(...emptyCells);
              }

              for (const ev of regionEvents) {
                if (isMultiDayEvent(ev)) {
                  const { s, e } = getClampedSpan(ev, colStartIdx, colEndIdx);
                  const relS = s - colStartIdx;
                  const relE = e - colStartIdx;
                  const rowStart = Math.max(...nextRow.slice(relS, relE + 1));

                  for (let rc = relS; rc <= relE; rc++) {
                    const ob = openBucket[rc];
                    if (ob) {
                      ob.rowEnd = rowStart;
                      openBucket[rc] = null;
                    }
                    nextRow[rc] = rowStart + 1;
                  }
                  cells.push({
                    type: 'multi-task',
                    key: `${keyPrefix}-m-${ev.id}`,
                    event: ev,
                    colStart: relS + 1,
                    colEnd: relE + 2,
                    rowStart,
                    rowEnd: rowStart + 1,
                  });
                } else {
                  const dayIdx = weekItem.days.findIndex((d) => d.iso === ev.date);
                  if (dayIdx < colStartIdx || dayIdx > colEndIdx) continue;
                  const rc = dayIdx - colStartIdx;
                  if (openBucket[rc]) {
                    openBucket[rc]!.events.push(ev);
                  } else {
                    const rowStart = nextRow[rc];
                    const bucket: BucketCell = {
                      type: 'single-bucket',
                      key: `${keyPrefix}-b-${rc}-r${rowStart}`,
                      colStart: rc + 1,
                      rowStart,
                      rowEnd: rowStart + 1,
                      events: [ev],
                    };
                    openBucket[rc] = bucket;
                    cells.push(bucket);
                    nextRow[rc] = rowStart + 1;
                  }
                }
              }

              const maxEndRow = Math.max(2, ...nextRow);
              for (const ec of emptyCells) ec.rowEnd = maxEndRow;
              for (const ob of openBucket) {
                if (ob) ob.rowEnd = maxEndRow;
              }

              return (
                <div key={keyPrefix} className={`grid ${GRID_COLS_CLASS[span]} gap-2 xl:gap-3 items-start content-start`}>
                  {cells.map((cell) => {
                    if (cell.type === 'empty-add') {
                      return (
                        <div
                          key={cell.key}
                          style={{
                            gridColumnStart: cell.colStart,
                            gridRowStart: cell.rowStart,
                            gridRowEnd: cell.rowEnd,
                          }}
                          className="self-start"
                        >
                          {renderEmptyAddCard(cell.dayIso, `${cell.key}-card`)}
                        </div>
                      );
                    }
                    if (cell.type === 'single-bucket') {
                      return (
                        <div
                          key={cell.key}
                          style={{
                            gridColumnStart: cell.colStart,
                            gridRowStart: cell.rowStart,
                            gridRowEnd: cell.rowEnd,
                          }}
                          className="flex flex-col gap-2 xl:gap-3 self-start min-w-0"
                        >
                          {cell.events.map(renderSingleTaskCard)}
                        </div>
                      );
                    }
                    return (
                      <div
                        key={cell.key}
                        style={{
                          gridColumnStart: cell.colStart,
                          gridColumnEnd: cell.colEnd,
                          gridRowStart: cell.rowStart,
                          gridRowEnd: cell.rowEnd,
                        }}
                        className="self-start min-w-0"
                      >
                        {renderMultiTaskCard(cell.event)}
                      </div>
                    );
                  })}
                </div>
              );
            };

            const renderDesktopRegion = (
              colStartIdx: number,
              colEndIdx: number,
              regionEvents: TaskEvent[],
              keyPrefix: string,
              showEmptyAdd: boolean
            ): React.ReactNode => {
              const span = colEndIdx - colStartIdx + 1;

              if (span === 1) {
                if (regionEvents.length === 0) {
                  if (showEmptyAdd && !hasEventsForDay[colStartIdx]) {
                    return renderEmptyAddCard(weekItem.days[colStartIdx].iso, `${keyPrefix}-empty`);
                  }
                  return null;
                }
                return (
                  <div key={keyPrefix} className="flex flex-col gap-2 xl:gap-3 min-w-0">
                    {regionEvents.map((ev) =>
                      isMultiDayEvent(ev) ? renderMultiTaskCard(ev) : renderSingleTaskCard(ev)
                    )}
                  </div>
                );
              }

              const multiSpanItems = regionEvents
                .map((ev, orderIdx) => {
                  if (!isMultiDayEvent(ev)) return null;
                  const { s, e } = getClampedSpan(ev, colStartIdx, colEndIdx);
                  if (e <= s) return null;
                  return { event: ev, s, e, spanWidth: e - s + 1, orderIdx };
                })
                .filter((x): x is { event: TaskEvent; s: number; e: number; spanWidth: number; orderIdx: number } => x !== null);

              if (multiSpanItems.length === 0) {
                return (
                  <div key={keyPrefix} className={`grid ${GRID_COLS_CLASS[span]} gap-2 xl:gap-3 items-start`}>
                    {Array.from({ length: span }, (_, offset) => {
                      const c = colStartIdx + offset;
                      const dayIso = weekItem.days[c].iso;
                      const colEvs = regionEvents.filter((ev) => {
                        if (isMultiDayEvent(ev)) {
                          const { s } = getClampedSpan(ev, colStartIdx, colEndIdx);
                          return s === c;
                        }
                        return ev.date === dayIso;
                      });

                      if (colEvs.length === 0) {
                        if (showEmptyAdd && !hasEventsForDay[c]) {
                          return (
                            <div key={`${keyPrefix}-c${c}`} style={{ gridColumnStart: offset + 1 }}>
                              {renderEmptyAddCard(dayIso, `${keyPrefix}-empty-${c}`)}
                            </div>
                          );
                        }
                        return null;
                      }

                      return (
                        <div
                          key={`${keyPrefix}-c${c}`}
                          style={{ gridColumnStart: offset + 1 }}
                          className="flex flex-col gap-2 xl:gap-3 min-w-0"
                        >
                          {colEvs.map((ev) =>
                            isMultiDayEvent(ev) ? renderMultiTaskCard(ev) : renderSingleTaskCard(ev)
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              }

              // Pick widest multi-day task (break ties by earliest starting day, then chronological order)
              const primary = [...multiSpanItems].sort((a, b) => {
                if (b.spanWidth !== a.spanWidth) return b.spanWidth - a.spanWidth;
                if (a.s !== b.s) return a.s - b.s;
                return a.orderIdx - b.orderIdx;
              })[0];

              // Expand component horizontally so no multi-day task crosses component boundaries
              let compStart = primary.s;
              let compEnd = primary.e;
              let expanded = true;
              while (expanded) {
                expanded = false;
                for (const item of multiSpanItems) {
                  if (item.s <= compEnd && item.e >= compStart) {
                    if (item.s < compStart) {
                      compStart = item.s;
                      expanded = true;
                    }
                    if (item.e > compEnd) {
                      compEnd = item.e;
                      expanded = true;
                    }
                  }
                }
              }

              // Split horizontally into independent slices if component is smaller than current region
              if (compStart > colStartIdx || compEnd < colEndIdx) {
                const slices: { s: number; e: number }[] = [];
                if (compStart > colStartIdx) slices.push({ s: colStartIdx, e: compStart - 1 });
                slices.push({ s: compStart, e: compEnd });
                if (compEnd < colEndIdx) slices.push({ s: compEnd + 1, e: colEndIdx });

                return (
                  <div key={keyPrefix} className={`grid ${GRID_COLS_CLASS[span]} gap-2 xl:gap-3 items-start`}>
                    {slices.map((slice) => {
                      const sliceEvs = regionEvents.filter((ev) => {
                        if (isMultiDayEvent(ev)) {
                          const { s, e } = getClampedSpan(ev, colStartIdx, colEndIdx);
                          return s >= slice.s && e <= slice.e;
                        }
                        const dayIdx = weekItem.days.findIndex((d) => d.iso === ev.date);
                        return dayIdx >= slice.s && dayIdx <= slice.e;
                      });

                      const rendered = renderDesktopRegion(
                        slice.s,
                        slice.e,
                        sliceEvs,
                        `${keyPrefix}-s${slice.s}_${slice.e}`,
                        showEmptyAdd
                      );
                      if (!rendered) return null;

                      return (
                        <div
                          key={`${keyPrefix}-wrap-${slice.s}_${slice.e}`}
                          style={{
                            gridColumnStart: slice.s - colStartIdx + 1,
                            gridColumnEnd: slice.e - colStartIdx + 2,
                          }}
                          className="min-w-0"
                        >
                          {rendered}
                        </div>
                      );
                    })}
                  </div>
                );
              }

              // If primary does not span the whole connected component, use crossing grid fallback
              if (primary.s > colStartIdx || primary.e < colEndIdx) {
                return renderDesktopCrossingFallback(colStartIdx, colEndIdx, regionEvents, keyPrefix, showEmptyAdd);
              }

              // Primary spans the entire [colStartIdx .. colEndIdx] region: split Above / Primary / Below
              const mIdx = regionEvents.findIndex((ev) => ev.id === primary.event.id);
              const aboveEvents = regionEvents.slice(0, mIdx);
              const initialBelow = regionEvents.slice(mIdx + 1);
              const belowEvents: TaskEvent[] = [];

              // Pocket-fill empty vertical space above Primary, prioritizing the earliest day first
              const colPx = estimateRegionColHeights(colStartIdx, colEndIdx, aboveEvents);
              const maxAbovePx = Math.max(0, ...colPx);

              const getCandStartCol = (cand: TaskEvent) => {
                if (isMultiDayEvent(cand)) {
                  return getClampedSpan(cand, colStartIdx, colEndIdx).s;
                }
                const dayIdx = weekItem.days.findIndex((d) => d.iso === cand.date);
                return dayIdx !== -1 ? dayIdx : colEndIdx + 1;
              };

              const sortedCandidates = [...initialBelow].sort((a, b) => {
                const colDiff = getCandStartCol(a) - getCandStartCol(b);
                if (colDiff !== 0) return colDiff;
                const timeDiff = getEventStartHour(a) - getEventStartHour(b);
                if (Math.abs(timeDiff) > 0.001) return timeDiff;
                const multiDiff = Number(isMultiDayEvent(a)) - Number(isMultiDayEvent(b));
                if (multiDiff !== 0) return multiDiff;
                return (a.title || '').localeCompare(b.title || '');
              });

              for (const cand of sortedCandidates) {
                if (maxAbovePx <= 0) {
                  belowEvents.push(cand);
                  continue;
                }

                if (isMultiDayEvent(cand)) {
                  const { s, e } = getClampedSpan(cand, colStartIdx, colEndIdx);
                  const candH = estimateMultiPx(cand, e - s + 1);
                  let spanMaxPx = 0;
                  for (let c = s; c <= e; c++) {
                    if (colPx[c - colStartIdx] > spanMaxPx) {
                      spanMaxPx = colPx[c - colStartIdx];
                    }
                  }
                  const projected = spanMaxPx + (spanMaxPx > 0 ? 12 : 0) + candH;
                  if (spanMaxPx === 0 || projected <= maxAbovePx + 24) {
                    aboveEvents.push(cand);
                    for (let c = s; c <= e; c++) {
                      colPx[c - colStartIdx] = projected;
                    }
                  } else {
                    belowEvents.push(cand);
                  }
                } else {
                  const dayIdx = weekItem.days.findIndex((d) => d.iso === cand.date);
                  if (dayIdx < colStartIdx || dayIdx > colEndIdx) {
                    belowEvents.push(cand);
                    continue;
                  }
                  const rel = dayIdx - colStartIdx;
                  const candH = estimateSinglePx(cand);
                  const projected = colPx[rel] + (colPx[rel] > 0 ? 12 : 0) + candH;
                  if (colPx[rel] === 0 || projected <= maxAbovePx + 16) {
                    aboveEvents.push(cand);
                    colPx[rel] = projected;
                  } else {
                    belowEvents.push(cand);
                  }
                }
              }

              // Prioritize earlier day empty slots: if a subsequent column inside primary's span
              // is taller than the first column (hari awal), move trailing single-day tasks from
              // that subsequent column below primary so primary fills the earlier empty slot.
              let balanced = true;
              while (balanced) {
                balanced = false;
                const currentPx = estimateRegionColHeights(colStartIdx, colEndIdx, aboveEvents);
                const firstDayPx = currentPx[0];
                for (let c = colStartIdx + 1; c <= colEndIdx; c++) {
                  const colHeight = currentPx[c - colStartIdx];
                  if (colHeight > firstDayPx + (firstDayPx === 0 ? 0 : 44)) {
                    const dayIso = weekItem.days[c].iso;
                    const orderedAbove = sortEventsByTime(aboveEvents);
                    let targetEv: TaskEvent | null = null;
                    for (let idx = orderedAbove.length - 1; idx >= 0; idx--) {
                      const ev = orderedAbove[idx];
                      if (!isMultiDayEvent(ev) && ev.date === dayIso) {
                        targetEv = ev;
                        break;
                      }
                    }
                    if (targetEv) {
                      const evPx = estimateSinglePx(targetEv);
                      const nextPx = colHeight - evPx - (colHeight > evPx ? 12 : 0);
                      if (firstDayPx === 0 || nextPx >= firstDayPx - 20) {
                        const removeIdx = aboveEvents.findIndex((ev) => ev.id === targetEv!.id);
                        if (removeIdx !== -1) {
                          aboveEvents.splice(removeIdx, 1);
                          belowEvents.push(targetEv);
                          balanced = true;
                          break;
                        }
                      }
                    }
                  }
                }
              }

              const finalAbove = sortEventsByTime(aboveEvents);
              const finalBelow = sortEventsByTime(belowEvents);

              return (
                <div key={keyPrefix} className="flex flex-col gap-2 xl:gap-3 min-w-0">
                  {finalAbove.length > 0 &&
                    renderDesktopRegion(colStartIdx, colEndIdx, finalAbove, `${keyPrefix}-above`, false)}
                  {renderMultiTaskCard(primary.event)}
                  {finalBelow.length > 0 &&
                    renderDesktopRegion(colStartIdx, colEndIdx, finalBelow, `${keyPrefix}-below`, false)}
                </div>
              );
            };

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
                <div className="hidden md:flex flex-col w-full min-w-0">
                  {/* Day Headers Row (Senin, Selasa, Rabu, etc.) */}
                  <div className={`grid grid-cols-7 gap-2 xl:gap-3 w-full ${isSidebarOpen ? 'min-w-[780px] xl:min-w-0' : 'min-w-0'} pb-2.5 border-b border-slate-200 shrink-0`}>
                    {weekItem.days.map((day) => {
                      const isSelected = day.iso === selectedIso;

                      return (
                        <div
                          key={day.iso}
                          onClick={() => onSelectDate(day.date)}
                          className={`px-2 xl:px-3.5 py-1.5 xl:py-2 rounded-2xl flex items-center justify-between gap-1 xl:gap-2 min-w-0 cursor-pointer transition-all ${
                            isSelected ? 'bg-[#38bdf8] text-white shadow-md shadow-sky-500/20' : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-1 xl:gap-2 min-w-0">
                            <span className="font-extrabold text-xs xl:text-sm capitalize truncate">
                              {day.dayNameId}
                            </span>
                            <span className={`w-5 h-5 xl:w-6 xl:h-6 rounded-full flex items-center justify-center font-extrabold text-[11px] xl:text-xs shadow-2xs shrink-0 ${
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
                            className={`p-0.5 xl:p-1 rounded-xl transition-all cursor-pointer shrink-0 ${
                              isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-200/80 text-slate-500'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5 xl:w-4 xl:h-4 stroke-[2.5]" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Weekly Timeline Area with recursive column-slice & pocket-filling layout */}
                  <div className={`flex-1 w-full ${isSidebarOpen ? 'min-w-[780px] xl:min-w-0' : 'min-w-0'} pt-2.5`}>
                    {renderDesktopRegion(0, 6, weekEvents, `w${weekItem.weekNumber}`, true)}
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
