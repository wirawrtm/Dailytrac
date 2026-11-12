import React, { useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Plus, 
  Calendar as CalendarIcon,
  Plane,
  Building2,
  Trees,
  Utensils,
  Camera,
  ShoppingBag,
  Sparkles,
  Briefcase,
  Clock,
  Check,
  MapPin
} from 'lucide-react';
import { TaskEvent, ViewMode, DepartmentItem } from '../types';
import { DEFAULT_DEPARTMENTS, getEventOutline } from '../data/initialData';
import { formatDateToISO } from '../utils/dateUtils';

interface DailyScheduleViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onChangeView?: (view: ViewMode) => void;
  events: TaskEvent[];
  departments?: DepartmentItem[];
  onOpenCreateModal: (defaultDate?: string, defaultHour?: number) => void;
  onSelectEvent: (event: TaskEvent) => void;
  onToggleEventStatus?: (eventId: string) => void;
  onToggleSubtask?: (eventId: string, subtaskId: string) => void;
}

// Pastel icon styling system matching IMG_1007
const getEventIconConfig = (event: TaskEvent, outline: string, index: number) => {
  const normTitle = (event.title || '').toLowerCase();
  const normDept = (event.department || event.subtitle || '').toLowerCase();

  // 1. Flight / Travel / Buy
  if (normTitle.includes('vol') || normTitle.includes('flight') || normTitle.includes('tiket') || normTitle.includes('trip') || outline === 'Buy' || normDept.includes('shopee') || normDept.includes('procurement')) {
    return {
      bg: 'bg-[#e6f4f2]',
      color: 'text-[#4fa397]',
      icon: outline === 'Buy' ? ShoppingBag : Plane
    };
  }

  // 2. Hotel / Office / Operations / Finance
  if (normTitle.includes('h\u00e9bergement') || normTitle.includes('hotel') || normTitle.includes('stay') || normDept.includes('finance') || normDept.includes('operat')) {
    return {
      bg: 'bg-[#fef4e2]',
      color: 'text-[#d4973b]',
      icon: normDept.includes('finance') ? Building2 : Briefcase
    };
  }

  // 3. Park / Meeting / Strategy / Improvement
  if (normTitle.includes('parc') || normTitle.includes('park') || normTitle.includes('meet') || outline === 'Improvement' || normDept.includes('eng')) {
    return {
      bg: 'bg-[#e8f6ec]',
      color: 'text-[#4ba866]',
      icon: outline === 'Improvement' ? Sparkles : Trees
    };
  }

  // 4. Dining / Coffee / Food / Breaks
  if (normTitle.includes('d\u00eener') || normTitle.includes('lunch') || normTitle.includes('makan') || normTitle.includes('coffee') || normTitle.includes('food')) {
    return {
      bg: 'bg-[#f1eafa]',
      color: 'text-[#8e6db7]',
      icon: Utensils
    };
  }

  // 5. Sightseeing / Review / Presentation / Sales
  if (normTitle.includes('port') || normTitle.includes('visit') || normTitle.includes('review') || normTitle.includes('snop') || normDept.includes('sales')) {
    return {
      bg: 'bg-[#e7f1f9]',
      color: 'text-[#4d8fc7]',
      icon: Camera
    };
  }

  // Fallback palette cycling based on index
  const fallbacks = [
    { bg: 'bg-[#e6f4f2]', color: 'text-[#4fa397]', icon: Plane },
    { bg: 'bg-[#fef4e2]', color: 'text-[#d4973b]', icon: Briefcase },
    { bg: 'bg-[#e8f6ec]', color: 'text-[#4ba866]', icon: Trees },
    { bg: 'bg-[#f1eafa]', color: 'text-[#8e6db7]', icon: Utensils },
    { bg: 'bg-[#e7f1f9]', color: 'text-[#4d8fc7]', icon: Camera },
  ];
  return fallbacks[index % fallbacks.length];
};

export const DailyScheduleView: React.FC<DailyScheduleViewProps> = ({
  selectedDate,
  onSelectDate,
  events,
  departments = DEFAULT_DEPARTMENTS,
  onOpenCreateModal,
  onSelectEvent,
  onToggleEventStatus,
}) => {
  const selectedIso = formatDateToISO(selectedDate);
  const dayEvents = useMemo(() => {
    return events.filter((e) => e.date === selectedIso);
  }, [events, selectedIso]);

  // Sliding 3-day window for Jour 1, Jour 2, Jour 3 tabs
  const daysTabs = useMemo(() => {
    const tabs: { date: Date; iso: string; dayIndex: number; label: string; dateStr: string }[] = [];
    const base = new Date(selectedDate);
    // Display 3 days starting from current selectedDate or anchor
    for (let i = 0; i < 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = formatDateToISO(d);
      const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      tabs.push({
        date: d,
        iso,
        dayIndex: i + 1,
        label: `Hari ${i + 1}`,
        dateStr
      });
    }
    return tabs;
  }, [selectedDate]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onSelectDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onSelectDate(d);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#fbfcfb] overflow-hidden select-none relative h-full">
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 sm:py-7 flex flex-col gap-6 max-w-2xl mx-auto w-full min-w-0">
        
        {/* Top Header: Back Button + Title ("Planificateur de voyage" style) */}
        <div className="flex items-start gap-4 shrink-0 pt-1">
          <button
            type="button"
            onClick={handlePrevDay}
            title="Hari Sebelumnya"
            className="w-11 h-11 rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Perencana
              <br />
              Aktivitas Harian
            </h1>
          </div>
        </div>

        {/* Day Navigation Tabs ("Jour 1 / 15 juin", "Jour 2", "Jour 3", ">") */}
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 shrink-0 pt-1">
          <div className="flex items-center gap-6 sm:gap-10">
            {daysTabs.map((tab, idx) => {
              const isActive = tab.iso === selectedIso;
              return (
                <button
                  key={tab.iso}
                  type="button"
                  onClick={() => onSelectDate(tab.date)}
                  className="flex flex-col items-center group cursor-pointer text-center relative"
                >
                  <span className={`text-xs sm:text-sm font-bold transition-colors ${
                    isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-700'
                  }`}>
                    {tab.label}
                  </span>
                  <span className={`text-[11px] sm:text-xs transition-colors mt-0.5 ${
                    isActive ? 'text-slate-500 font-medium' : 'text-slate-400 group-hover:text-slate-600'
                  }`}>
                    {tab.dateStr}
                  </span>
                  {isActive && (
                    <div className="h-0.5 w-10 bg-[#4fa397] rounded-full mt-2 animate-in fade-in duration-200" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Next Day Arrow */}
          <button
            type="button"
            onClick={handleNextDay}
            title="Hari Berikutnya"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-black/5 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Timeline & Cards Section */}
        {dayEvents.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center my-auto">
            <div className="w-16 h-16 rounded-3xl bg-[#e6f4f2] text-[#4fa397] flex items-center justify-center mb-3.5 shadow-xs">
              <CalendarIcon className="w-8 h-8 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Tidak ada agenda pada hari ini</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              Buat agenda harian Anda teratur dan produktif dengan menambahkan tugas baru.
            </p>
          </div>
        ) : (
          <div className="relative pl-7 sm:pl-9 py-2 flex flex-col gap-4 sm:gap-5">
            {/* Continuous Vertical Dashed Line */}
            <div 
              className="absolute left-[11px] sm:left-[15px] top-6 bottom-6 w-0 border-l-2 border-dashed border-[#8bc3ba]/70 z-0" 
              aria-hidden="true" 
            />

            {/* Event Cards Attached to Timeline Nodes */}
            {dayEvents.map((event, index) => {
              const evOutline = getEventOutline(event, departments);
              const isFirst = index === 0;
              const iconConfig = getEventIconConfig(event, evOutline, index);
              const IconComponent = iconConfig.icon;
              const isCompleted = event.status === 'completed';

              const titleText = (event.title && event.title.trim()) || 
                                (event as any).task || 
                                (event as any).name || 
                                (event.description && event.description.trim()) || 
                                'Tugas Tanpa Judul';
              
              const deptName = event.department || event.subtitle || 'Operasional';
              const displayTime = event.startTime || `${String(event.startHour || 8).padStart(2, '0')}:00`;

              return (
                <div key={event.id} className="relative flex items-center group">
                  {/* Timeline Node Icon (Dashed line connector) */}
                  <div className="absolute -left-7 sm:-left-9 flex items-center justify-center z-10">
                    {isFirst ? (
                      <div className="w-4 h-4 rounded-full bg-[#4fa397] ring-4 ring-[#e6f4f2] shadow-xs" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-[#8bc3ba] bg-white shadow-2xs" />
                    )}
                  </div>

                  {/* Modern Floating Card matching IMG_1013 soft ambient shadow */}
                  <div
                    onClick={() => onSelectEvent(event)}
                    className="flex-1 bg-white rounded-[24px] p-4 sm:p-5 shadow-[0_10px_25px_-4px_rgba(0,0,0,0.06),0_4px_10px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_32px_-4px_rgba(0,0,0,0.10),0_6px_14px_-2px_rgba(0,0,0,0.04)] transition-all cursor-pointer flex items-center justify-between gap-3.5 sm:gap-4.5 min-w-0 hover:-translate-y-0.5"
                  >
                    {/* Left: Pastel Icon Circle */}
                    <div className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center shrink-0 ${iconConfig.bg} ${iconConfig.color}`}>
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                    </div>

                    {/* Middle: Title, Subtitle, Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-normal text-slate-900 leading-snug truncate">
                          {titleText}
                        </h4>
                        {isCompleted && (
                          <span className="text-[#4fa397] inline-flex items-center shrink-0" title="Selesai">
                            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-medium">
                        <span className="capitalize">{deptName}</span>
                        <span>&middot;</span>
                        <span className="uppercase text-[10.5px] font-bold text-slate-400">{evOutline}</span>
                      </div>

                      {event.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {event.description}
                        </p>
                      )}
                    </div>

                    {/* Right: Time, Status / Action */}
                    <div className="flex flex-col items-end shrink-0 gap-1 text-right">
                      <span className="text-xs font-semibold text-slate-400 font-mono">
                        {displayTime}
                      </span>

                      {onToggleEventStatus ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleEventStatus(event.id);
                          }}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer active:scale-95 ${
                            isCompleted 
                              ? 'bg-[#e6f4f2] text-[#4fa397]' 
                              : 'bg-slate-100 text-slate-600 hover:bg-[#4fa397] hover:text-white'
                          }`}
                        >
                          {isCompleted ? 'Selesai' : 'Pending'}
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-slate-700">
                          {event.location || deptName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Spacing so button doesn't block last card */}
        <div className="h-20 shrink-0" />
      </div>

      {/* Bottom Sticky Action Button ("Organiser mon voyage" style) */}
      <div className="sticky bottom-0 left-0 right-0 p-4 sm:p-5 bg-gradient-to-t from-[#fbfcfb] via-[#fbfcfb]/95 to-transparent shrink-0 flex justify-center z-20">
        <button
          type="button"
          onClick={() => onOpenCreateModal(selectedIso, 9)}
          className="w-full max-w-sm py-4 px-8 rounded-full bg-[#4fa397] hover:bg-[#439285] text-white font-bold text-base shadow-lg shadow-[#4fa397]/25 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Buat Tugas Baru</span>
        </button>
      </div>
    </div>
  );
};
