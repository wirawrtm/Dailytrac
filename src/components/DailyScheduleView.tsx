import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Calendar as CalendarIcon 
} from 'lucide-react';
import { TaskEvent, ViewMode, DepartmentItem } from '../types';
import { DEFAULT_DEPARTMENTS, getEventOutline } from '../data/initialData';
import { formatHeaderDate, formatDateToISO } from '../utils/dateUtils';

interface DailyScheduleViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onChangeView: (view: ViewMode) => void;
  events: TaskEvent[];
  departments?: DepartmentItem[];
  onOpenCreateModal: (defaultDate?: string, defaultHour?: number) => void;
  onSelectEvent: (event: TaskEvent) => void;
  onToggleEventStatus?: (eventId: string) => void;
  onToggleSubtask?: (eventId: string, subtaskId: string) => void;
}

export const DailyScheduleView: React.FC<DailyScheduleViewProps> = ({
  selectedDate,
  onSelectDate,
  events,
  departments = DEFAULT_DEPARTMENTS,
  onOpenCreateModal,
  onSelectEvent,
}) => {
  const selectedIso = formatDateToISO(selectedDate);
  const dayEvents = events.filter((e) => e.date === selectedIso);

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onSelectDate(d);
  };

  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onSelectDate(d);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden select-none">
      {/* Header bar: Day Navigator */}
      <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={prevDay}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {formatHeaderDate(selectedDate)}
          </h2>

          <button
            onClick={nextDay}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Daily Content */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-4 sm:gap-6">
          {/* Day Summary Pill */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 sm:p-4 bg-slate-50 rounded-3xl border border-slate-100">
            <div>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500">Day Overview</p>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                {dayEvents.length} {dayEvents.length === 1 ? 'task' : 'tasks'} for today
              </h3>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="px-2.5 sm:px-3 py-1 bg-amber-100/80 text-amber-900 text-[11px] sm:text-xs font-bold rounded-full border border-amber-300">
                {dayEvents.filter(e => getEventOutline(e, departments) === 'Work').length} Work
              </span>
              <span className="px-2.5 sm:px-3 py-1 bg-violet-100/80 text-violet-900 text-[11px] sm:text-xs font-bold rounded-full border border-violet-300">
                {dayEvents.filter(e => getEventOutline(e, departments) === 'Improvement').length} Improvement
              </span>
            </div>
          </div>

          {/* Events List */}
          {dayEvents.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <CalendarIcon className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">No tasks scheduled for this day</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Keep your day productive by scheduling tasks and action items.
              </p>
              <button
                onClick={() => onOpenCreateModal(selectedIso, 10)}
                className="mt-4 px-4 py-2 bg-[#f6c445] text-slate-900 text-xs font-bold rounded-full hover:bg-[#eab32f] transition-all cursor-pointer"
              >
                + Add Task
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {dayEvents.map((event) => {
                const isImprovement = getEventOutline(event, departments) === 'Improvement';

                return (
                  <div
                    key={event.id}
                    onClick={() => onSelectEvent(event)}
                    className={`px-5 py-3.5 rounded-2xl border transition-all hover:shadow-xs cursor-pointer flex items-center justify-between gap-4 group ${
                      isImprovement
                        ? 'bg-violet-50/95 border-violet-300 hover:bg-violet-100/85'
                        : 'bg-amber-50/95 border-amber-300 hover:bg-amber-100/85'
                    }`}
                  >
                    <div className="flex items-center justify-between min-w-0 flex-1 gap-3">
                      <span
                        className={`text-sm sm:text-base font-semibold break-words whitespace-normal flex-1 ${
                          isImprovement
                            ? 'text-violet-950'
                            : 'text-slate-900'
                        }`}
                      >
                        <span>{event.title}</span>
                        {event.status === 'completed' && (
                          <span className="inline-flex items-center ml-1.5 align-middle text-emerald-600 shrink-0" title="Tugas Selesai (Completed)">
                            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                          </span>
                        )}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shrink-0 ${
                          isImprovement
                            ? 'bg-violet-200/80 text-violet-900'
                            : 'bg-amber-200/80 text-amber-900'
                        }`}
                      >
                        {isImprovement ? 'Improvement' : 'Work'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
