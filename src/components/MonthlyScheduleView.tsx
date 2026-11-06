import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { TaskEvent, ViewMode, DepartmentItem } from '../types';
import { DEFAULT_DEPARTMENTS, getEventOutline } from '../data/initialData';
import { 
  generateMonthGrid, 
  DAYS_SHORT, 
  formatDateToISO 
} from '../utils/dateUtils';

interface MonthlyScheduleViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onChangeView?: (view: ViewMode) => void;
  events: TaskEvent[];
  departments?: DepartmentItem[];
  onOpenCreateModal: (defaultDate?: string) => void;
  onSelectEvent: (event: TaskEvent) => void;
}

export const MonthlyScheduleView: React.FC<MonthlyScheduleViewProps> = ({
  selectedDate,
  onSelectDate,
  events,
  departments = DEFAULT_DEPARTMENTS,
  onSelectEvent,
}) => {
  const monthGrid = generateMonthGrid(selectedDate, selectedDate);
  const selectedIso = formatDateToISO(selectedDate);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden select-none">

      {/* Week days labels */}
      <div className="grid grid-cols-7 border-b border-slate-100 text-center py-2.5 bg-slate-50/50">
        {DAYS_SHORT.map((day, idx) => (
          <div key={idx} className="text-xs font-bold text-slate-400">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto">
        {monthGrid.map((item, idx) => {
          const isSelected = item.iso === selectedIso;
          const dayEvents = events.filter((e) => e.date === item.iso);

          return (
            <div
              key={idx}
              onClick={() => {
                onSelectDate(item.date);
              }}
              className={`min-h-[76px] sm:min-h-[96px] p-1 sm:p-2 border-b border-r border-slate-100 flex flex-col justify-between transition-colors cursor-pointer group ${
                isSelected
                  ? 'bg-slate-50/80 ring-1 ring-inset ring-[#00897b]'
                  : item.isCurrentMonth
                  ? 'bg-white hover:bg-slate-50/40'
                  : 'bg-slate-50/30 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#00897b] text-white shadow-2xs'
                      : item.isCurrentMonth
                      ? 'text-slate-800'
                      : 'text-slate-300'
                  }`}
                >
                  {item.dayNumber}
                </span>

                {dayEvents.length > 0 && (
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 font-mono">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {/* Event indicators / pills */}
              <div className="flex flex-col gap-0.5 sm:gap-1 mt-1 overflow-hidden">
                {dayEvents.slice(0, 2).map((ev) => {
                  const isImprovement = getEventOutline(ev, departments) === 'Improvement';
                  return (
                    <div
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(ev);
                      }}
                      className={`px-1 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold truncate border transition-opacity flex items-center justify-between gap-1 ${
                        isImprovement
                          ? 'bg-violet-100 text-violet-950 border-violet-300 hover:bg-violet-200/70'
                          : 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200/70'
                      }`}
                      title={ev.title}
                    >
                      <span className="truncate">{ev.title}</span>
                      {ev.status === 'completed' && (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 stroke-[2.5]" />
                      )}
                    </div>
                  );
                })}
                {dayEvents.length > 2 && (
                  <span className="text-[9px] font-medium text-slate-400 pl-0.5 sm:pl-1">
                    +{dayEvents.length - 2}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
