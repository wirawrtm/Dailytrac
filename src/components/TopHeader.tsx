import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  ChevronDown, 
  PanelLeftClose, 
  PanelLeft, 
  Maximize2, 
  Minimize2,
  Calendar as CalendarIcon,
  Check,
  Layers,
  Clock,
  CalendarDays,
  LayoutGrid,
  Search,
  MessageSquare,
  Bell
} from 'lucide-react';
import { UserProfile, ViewMode } from '../types';
import { formatMonthYear, MONTH_NAMES } from '../utils/dateUtils';
import { MonthCalendarPicker } from './MonthCalendarPicker';

interface TopHeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  user: UserProfile;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onOpenProfileMenu: () => void;
  isProfileMenuOpen: boolean;
  onResetData: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  
  // Controls moved to top bar next to Buka Kalender
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  viewMode: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onOpenCreateModal?: () => void;

  // Outline filter dropdown props
  outlineFilter?: 'all' | 'Work' | 'Improvement' | 'Buy';
  onSelectOutline?: (outline: 'all' | 'Work' | 'Improvement' | 'Buy') => void;
  isMobileHidden?: boolean;
}

export const MobileTopBar: React.FC<TopHeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  onSelectDate,
}) => {
  return (
    <div
      className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-3 min-h-[56px] pt-2.5 pb-3 px-4 mb-2 select-none text-slate-900 bg-white/40 backdrop-blur-lg backdrop-saturate-150 border-b border-slate-200/40 shrink-0"
    >
      {/* Left: Sidebar Toggle + App Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Hide Calendar Sidebar" : "Open Calendar Sidebar"}
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200/80 active:scale-95 text-slate-700 transition-all cursor-pointer flex items-center justify-center shrink-0"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-[18px] h-[18px] stroke-[2.2]" />
          ) : (
            <PanelLeft className="w-[18px] h-[18px] stroke-[2.2]" />
          )}
        </button>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight truncate">
          Task Review
        </h1>
      </div>

      {/* Right: Quick Jump to Today */}
      <button
        type="button"
        onClick={() => onSelectDate(new Date())}
        title="Kembali ke Hari Ini"
        className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 active:scale-95 text-[#0284c7] border border-sky-200/80 text-xs font-bold transition-all cursor-pointer shrink-0"
      >
        Hari Ini
      </button>
    </div>
  );
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  user,
  onOpenProfileMenu,
  isProfileMenuOpen,
  onResetData,
  isSidebarOpen,
  onToggleSidebar,
  isFullscreen,
  onToggleFullscreen,
  selectedDate,
  onSelectDate,
  viewMode,
  onSelectView,
  outlineFilter = 'all',
  onSelectOutline,
  isMobileHidden = false,
}) => {
  const [isCalendarPickerOpen, setIsCalendarPickerOpen] = useState(false);
  const [isOutlineDropdownOpen, setIsOutlineDropdownOpen] = useState(false);

  const outlineDropdownRef = useRef<HTMLDivElement>(null);
  const calendarPickerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (outlineDropdownRef.current && !outlineDropdownRef.current.contains(e.target as Node)) {
        setIsOutlineDropdownOpen(false);
      }
      if (calendarPickerRef.current && !calendarPickerRef.current.contains(e.target as Node)) {
        setIsCalendarPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    onSelectDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    onSelectDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const currentOutlineLabel =
    outlineFilter === 'Work' ? 'Work' :
    outlineFilter === 'Improvement' ? 'Improvement' :
    outlineFilter === 'Buy' ? 'Buy' : 'Semua Outline';

  const shortMonthYear = `${MONTH_NAMES[selectedDate.getMonth()].slice(0, 3)} ${selectedDate.getFullYear()}`;

  return (
    <header className={`py-2.5 md:py-4 px-3.5 sm:px-6 md:px-8 border-b border-slate-100 flex flex-wrap md:flex-nowrap items-center justify-between gap-2 sm:gap-3 bg-slate-50/70 md:bg-white text-slate-900 select-none shrink-0 relative z-25 md:z-30 ${
      isFullscreen ? 'rounded-none' : 'rounded-none md:rounded-t-[28px]'
    }`}>
      {/* Left: Sidebar Toggle & Dashboard Title */}
      <div className="hidden md:flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Hide Calendar Sidebar" : "Open Calendar Sidebar"}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center justify-center shrink-0"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4 stroke-[2.2]" />
          ) : (
            <PanelLeft className="w-4 h-4 stroke-[2.2]" />
          )}
        </button>

        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Dashboard
        </h1>
      </div>

      {/* Zone 2: Mobile Single-Row (Month Picker + View Dropdown + Outline Dropdown), Desktop (View + Outline) */}
      <div className="order-1 md:order-2 w-full md:w-auto flex items-center justify-between md:justify-start gap-1.5 sm:gap-2 md:mr-auto">
        <div className="flex items-center flex-nowrap gap-1.5 sm:gap-2 w-full md:w-auto">
          {/* Mobile Month Navigator + Calendar Picker (Left of Weekly button, 1 row) */}
          <div
            ref={calendarPickerRef}
            className={`md:hidden h-9 flex items-center gap-0.5 shrink-0 relative rounded-xl px-0.5 sm:px-1 border transition-all ${
              isCalendarPickerOpen
                ? 'bg-[#0ea5e9] border-[#0ea5e9] ring-2 ring-sky-200 shadow-md shadow-sky-500/25 text-white'
                : 'bg-[#38bdf8] border-[#38bdf8] shadow-sm shadow-sky-500/20 text-white'
            }`}
          >
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Bulan Sebelumnya"
              className="w-6 h-7 sm:w-7 flex items-center justify-center rounded-lg text-white/90 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsCalendarPickerOpen((prev) => !prev);
                setIsOutlineDropdownOpen(false);
              }}
              title="Klik untuk melihat kalender & memilih bulan"
              className="flex items-center gap-0.5 sm:gap-1 px-1 py-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
            >
              <span className="text-[11px] sm:text-xs font-bold text-white tracking-tight whitespace-nowrap sm:hidden">
                {shortMonthYear}
              </span>
              <span className="text-xs font-bold text-white tracking-tight whitespace-nowrap hidden sm:inline">
                {formatMonthYear(selectedDate)}
              </span>
              <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-white stroke-[2.5] transition-transform duration-200 ${isCalendarPickerOpen ? 'rotate-180' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleNextMonth}
              title="Bulan Berikutnya"
              className="w-6 h-7 sm:w-7 flex items-center justify-center rounded-lg text-white/90 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            {isCalendarPickerOpen && (
              <MonthCalendarPicker
                selectedDate={selectedDate}
                onSelectDate={onSelectDate}
                onClose={() => setIsCalendarPickerOpen(false)}
                align="left"
              />
            )}
          </div>

          {/* Dropdown Outline: Work, Improvement, Buy */}
          <div className="relative min-w-0 flex-1 md:flex-none" ref={outlineDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsOutlineDropdownOpen((prev) => !prev);
                setIsCalendarPickerOpen(false);
              }}
              title="Pilih filter Outline (Work, Improvement, Buy)"
              className={`h-9 md:h-auto w-full md:w-auto flex items-center justify-between md:justify-start gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                isOutlineDropdownOpen 
                  ? 'bg-[#0ea5e9] text-white border-[#0ea5e9] ring-2 ring-sky-200 shadow-md shadow-sky-500/25' 
                  : 'bg-[#38bdf8] hover:bg-[#0ea5e9] text-white border-[#38bdf8] shadow-sm shadow-sky-500/20'
              }`}
            >
              <span className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                {outlineFilter === 'Work' ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-white/80 shrink-0" />
                ) : outlineFilter === 'Improvement' ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-400 border border-white/80 shrink-0" />
                ) : outlineFilter === 'Buy' ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white/80 shrink-0" />
                ) : (
                  <Layers className="w-3.5 h-3.5 text-white shrink-0" />
                )}
                <span className="truncate">{currentOutlineLabel}</span>
              </span>
              <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-white shrink-0 transition-transform duration-200 ${isOutlineDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {/* Outline Popover Dropdown */}
            {isOutlineDropdownOpen && (
              <div className="absolute right-0 md:left-0 md:right-auto mt-1.5 w-52 bg-white rounded-2xl shadow-2xl shadow-sky-500/10 border border-sky-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-800">
                <div className="px-3.5 py-1 text-[10px] font-bold text-[#0284c7] uppercase tracking-wider">
                  Filter Outline
                </div>

                {/* Semua Outline */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectOutline?.('all');
                    setIsOutlineDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left cursor-pointer transition-colors ${
                    outlineFilter === 'all'
                      ? 'bg-sky-50 font-bold text-[#0284c7]'
                      : 'hover:bg-slate-50 font-medium text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <div>
                      <span className="block font-bold">Semua Outline</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Tampilkan semua task</span>
                    </div>
                  </span>
                  {outlineFilter === 'all' && <Check className="w-3.5 h-3.5 text-[#0ea5e9] stroke-[2.5]" />}
                </button>

                {/* Work Outline */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectOutline?.('Work');
                    setIsOutlineDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left cursor-pointer transition-colors ${
                    outlineFilter === 'Work'
                      ? 'bg-amber-50 font-bold text-amber-800'
                      : 'hover:bg-slate-50 font-medium text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-100 shrink-0" />
                    <div>
                      <span className="block font-bold">Work</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Daily & Operations</span>
                    </div>
                  </span>
                  {outlineFilter === 'Work' && <Check className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />}
                </button>

                {/* Improvement Outline */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectOutline?.('Improvement');
                    setIsOutlineDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left cursor-pointer transition-colors ${
                    outlineFilter === 'Improvement'
                      ? 'bg-violet-50 font-bold text-violet-800'
                      : 'hover:bg-slate-50 font-medium text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-500 ring-2 ring-violet-100 shrink-0" />
                    <div>
                      <span className="block font-bold">Improvement</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Innovation & Upgrade</span>
                    </div>
                  </span>
                  {outlineFilter === 'Improvement' && <Check className="w-3.5 h-3.5 text-violet-600 stroke-[2.5]" />}
                </button>

                {/* Buy Outline */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectOutline?.('Buy');
                    setIsOutlineDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left cursor-pointer transition-colors ${
                    outlineFilter === 'Buy'
                      ? 'bg-emerald-50 font-bold text-emerald-800'
                      : 'hover:bg-slate-50 font-medium text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 shrink-0" />
                    <div>
                      <span className="block font-bold">Buy</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Procurement & Purchasing</span>
                    </div>
                  </span>
                  {outlineFilter === 'Buy' && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zone 3 (Desktop only): Clean Fullscreen Button */}
      <div className="hidden md:flex order-2 md:order-3 items-center gap-2 shrink-0">
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          className="inline-flex p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
