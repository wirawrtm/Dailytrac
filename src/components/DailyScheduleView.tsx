import React, { useMemo, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
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
  totalEventsCount?: number;
  isLoading?: boolean;
  isMobileBarsHidden?: boolean;
  onResetOutlineFilter?: () => void;
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
  onChangeView,
  events,
  totalEventsCount,
  isLoading = false,
  isMobileBarsHidden = false,
  onResetOutlineFilter,
  departments = DEFAULT_DEPARTMENTS,
  onOpenCreateModal,
  onSelectEvent,
  onToggleEventStatus,
}) => {
  const selectedIso = formatDateToISO(selectedDate);
  const allCount = totalEventsCount ?? events.length;
  const dayEvents = useMemo(() => {
    return events.filter((e) => e.date === selectedIso);
  }, [events, selectedIso]);

  const nearestDateInfo = useMemo(() => {
    if (events.length === 0) return null;
    const uniqueDates = Array.from(
      new Set(events.map((e) => e.date).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)))
    ).sort();
    if (uniqueDates.length === 0) return null;

    const pastOrSame = uniqueDates.filter((d) => d < selectedIso);
    const targetIso =
      pastOrSame.length > 0
        ? pastOrSame[pastOrSame.length - 1]
        : uniqueDates.find((d) => d > selectedIso) || uniqueDates[uniqueDates.length - 1];

    if (!targetIso || targetIso === selectedIso) return null;
    const [y, m, day] = targetIso.split('-').map(Number);
    const targetDate = new Date(y, m - 1, day);
    const tasksOnDate = events.filter((e) => e.date === targetIso);
    return {
      iso: targetIso,
      date: targetDate,
      label: targetDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      tasks: tasksOnDate,
    };
  }, [events, selectedIso]);

  // Sliding 3-day window for Hari 1, Hari 2, Hari 3 tabs
  const daysTabs = useMemo(() => {
    const tabs: { date: Date; iso: string; dayIndex: number; label: string; dateStr: string; count: number }[] = [];
    const base = new Date(selectedDate);
    for (let i = 0; i < 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = formatDateToISO(d);
      const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const count = events.filter((e) => e.date === iso).length;
      tabs.push({
        date: d,
        iso,
        dayIndex: i + 1,
        label: `Hari ${i + 1}`,
        dateStr,
        count,
      });
    }
    return tabs;
  }, [selectedDate, events]);

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

  const ribbonRef = useRef<HTMLDivElement | null>(null);
  const selectedDayRef = useRef<HTMLDivElement | null>(null);
  const hasMountedRibbonRef = useRef(false);

  // Scrollable date ribbon covering all days of the selected month
  const dateRibbon = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const taskCountsByDate: Record<string, number> = {};
    events.forEach((ev) => {
      if (ev.date) {
        taskCountsByDate[ev.date] = (taskCountsByDate[ev.date] || 0) + 1;
      }
    });

    const ribbon = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const iso = formatDateToISO(d);
      const dayNum = d.getDate();
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      ribbon.push({
        date: d,
        iso,
        dayNum,
        dayName,
        taskCount: taskCountsByDate[iso] || 0,
        isSelected: iso === selectedIso,
      });
    }
    return ribbon;
  }, [selectedDate, selectedIso, events]);

  useEffect(() => {
    const el = selectedDayRef.current;
    const container = ribbonRef.current;
    if (!el || !container) return;

    const targetLeft =
      el.offsetLeft - container.clientWidth / 2 + el.offsetWidth / 2;
    container.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: hasMountedRibbonRef.current ? 'smooth' : 'auto',
    });
    hasMountedRibbonRef.current = true;
  }, [selectedIso]);

  const capsuleColors = [
    'bg-[#2dd4bf] text-white shadow-teal-500/20', // Teal
    'bg-[#f87171] text-white shadow-rose-500/20', // Pink/Red
    'bg-[#38bdf8] text-white shadow-sky-500/20',  // Blue
    'bg-[#fbbf24] text-white shadow-amber-500/20', // Orange
    'bg-[#818cf8] text-white shadow-indigo-500/20',// Purple
  ];

  return (
    <div className="max-md:flex-auto md:flex-1 flex flex-col min-w-0 md:min-h-0 bg-[#fbfcfb] max-md:overflow-visible md:overflow-hidden select-none relative md:h-full">
      {/* Scrollable Container */}
      <div className="max-md:flex-auto md:flex-1 md:min-h-0 md:overflow-y-auto md:overflow-x-hidden max-md:overflow-visible overscroll-y-contain touch-pan-y [-webkit-overflow-scrolling:touch] px-3.5 sm:px-8 max-md:pt-4 max-md:pb-4 md:py-7 flex flex-col gap-5 sm:gap-6 max-w-5xl mx-auto w-full min-w-0">
        
        {/* Top Header: Date Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 shrink-0 pt-1 border-b border-slate-100 pb-3.5 sm:pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
            <ChevronDown className="w-4 h-4 text-slate-500 stroke-[2.5]" />
          </div>
        </div>

        {/* Date Ribbon Pill Cards (Horizontally scrollable month strip with full shadow clearance) */}
        <div
          ref={ribbonRef}
          className="flex flex-row items-center gap-2 sm:gap-2.5 shrink-0 select-none pt-3 pb-6 -mb-4 -mx-2 px-2 sm:-mx-3 sm:px-3 overflow-x-auto touch-pan-x snap-x snap-proximity [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {dateRibbon.map((item) => (
            <div
              key={item.iso}
              ref={item.isSelected ? selectedDayRef : undefined}
              onClick={() => onSelectDate(item.date)}
              className={`shrink-0 snap-center flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all ${
                item.isSelected
                  ? 'w-[64px] sm:w-[82px] py-3 px-1.5 sm:py-4 sm:px-2.5 bg-[#38bdf8] text-white shadow-lg shadow-sky-500/30 scale-[1.04] font-bold'
                  : 'w-[56px] sm:w-[70px] py-2 px-1 sm:py-3 sm:px-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-xs'
              }`}
            >
              <span
                className={`font-black font-mono leading-tight ${
                  item.isSelected
                    ? 'text-base sm:text-2xl text-white'
                    : 'text-sm sm:text-xl text-slate-900'
                }`}
              >
                {item.dayNum}
              </span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span
                  className={`text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider leading-none ${
                    item.isSelected ? 'text-sky-50' : 'text-slate-400'
                  }`}
                >
                  {item.dayName}
                </span>
                <span
                  className={`inline-flex items-center justify-center min-w-[14px] h-[14px] sm:min-w-[16px] sm:h-[16px] px-1 rounded-full text-[8px] sm:text-[10px] font-bold font-mono leading-none ${
                    item.isSelected
                      ? item.taskCount > 0
                        ? 'bg-white/25 text-white'
                        : 'bg-white/15 text-sky-50/85'
                      : item.taskCount > 0
                        ? 'bg-sky-50 text-[#0284c7]'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {item.taskCount}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline & Capsule Task Bars Section */}
        {isLoading && events.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center my-auto">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0ea5e9] flex items-center justify-center mb-3.5 animate-pulse">
              <Clock className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Memuat data dari Firebase...</h3>
          </div>
        ) : dayEvents.length === 0 ? (
          <div className="py-10 sm:py-12 text-center flex flex-col items-center justify-center my-auto gap-4">
            <div className="w-14 h-14 rounded-3xl bg-sky-50 text-[#0ea5e9] flex items-center justify-center shadow-xs">
              <CalendarIcon className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Tidak ada agenda pada hari ini</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                Buat tugas baru untuk hari ini agar timeline terisi.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenCreateModal(selectedIso, 10)}
              className="mt-2 px-6 py-2.5 rounded-full bg-[#38bdf8] hover:bg-[#0ea5e9] text-white text-xs font-bold cursor-pointer shadow-md shadow-sky-500/20"
            >
              + Buat Tugas Baru
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5 py-2">
            {dayEvents.map((event, index) => {
              const capsuleBg = capsuleColors[index % capsuleColors.length];
              const titleText = event.title || 'Tugas Tanpa Judul';
              const isCompleted = event.status === 'completed';
              const progressPct = isCompleted ? '100%' : `${70 + (index * 7) % 25}%`;

              return (
                <div
                  key={event.id}
                  onClick={() => onSelectEvent(event)}
                  className={`w-full py-3.5 px-4 sm:py-4 sm:px-5 rounded-3xl shadow-md flex items-start sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer transition-all hover:scale-[1.01] ${capsuleBg}`}
                >
                  {/* Left: Avatar / Icon & Title */}
                  <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 text-white font-bold text-xs ring-2 ring-white/40 shadow-xs">
                      {titleText.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1 pt-1 sm:pt-0">
                      <h4 className="text-sm sm:text-base font-bold text-white break-words whitespace-normal leading-snug tracking-tight">
                        {titleText}
                      </h4>
                    </div>
                  </div>

                  {/* Right: Percentage Badge or Checkmark */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-bold bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-white shadow-2xs">
                      {progressPct}
                    </span>
                    {isCompleted && (
                      <span className="w-6 h-6 rounded-full bg-white text-emerald-700 flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Team Legend matching IMG_1033 */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-6 pb-2 border-t border-slate-100 text-xs font-semibold text-slate-600 shrink-0 select-none">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#2dd4bf]"></span><span>Business Team</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f87171]"></span><span>Creative Team</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]"></span><span>Technology Team</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]"></span><span>Startup Team</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#818cf8]"></span><span>Finance Team</span></div>
        </div>

        {/* Bottom Spacing (Desktop only) */}
        <div className="hidden md:block h-20 shrink-0" />
      </div>

      {/* Bottom Action Button (In-flow above bottom nav on Mobile, Sticky on Desktop) */}
      <div className="max-md:relative md:sticky bottom-0 left-0 right-0 px-4 pt-2 max-md:pb-24 md:p-4 md:bg-gradient-to-t md:from-[#fbfcfb] md:via-[#fbfcfb]/95 md:to-transparent shrink-0 flex justify-center z-25 pointer-events-none">
        <button
          type="button"
          onClick={() => onOpenCreateModal(selectedIso, 9)}
          className="pointer-events-auto w-full max-w-sm py-3.5 px-8 rounded-full bg-[#38bdf8] hover:bg-[#0ea5e9] text-white font-bold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
          <span>Buat Tugas Baru</span>
        </button>
      </div>
    </div>
  );
};

export default DailyScheduleView;
