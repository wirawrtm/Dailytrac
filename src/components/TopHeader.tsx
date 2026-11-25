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
import { UserProfile, ViewMode, WorkOutline } from '../types';
import { formatMonthYear, getMonthWeeks } from '../utils/dateUtils';
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
  isFullscreen = false,
  selectedDate,
  onSelectDate,
  isMobileHidden = false,
}) => {
  const [isCalendarPickerOpen, setIsCalendarPickerOpen] = useState(false);

  const handlePrevMonth = () => {
    onSelectDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    onSelectDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  return (
    <div
      className="md:hidden relative z-30 flex items-center justify-between gap-2 min-h-[52px] pt-3 pb-2 px-4 select-none text-slate-900 bg-white shrink-0"
    >
      {/* Left: Sidebar Toggle + Dashboard Title */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Hide Calendar Sidebar" : "Open Calendar Sidebar"}
          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors cursor-pointer flex items-center justify-center shrink-0"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4 stroke-[2.2]" />
          ) : (
            <PanelLeft className="w-4 h-4 stroke-[2.2]" />
          )}
        </button>

        <h1 className="text-[17px] font-extrabold text-slate-900 tracking-tight truncate">
          Dashboard
        </h1>
      </div>

      {/* Right: Sleek Pill Month Navigator + Calendar Picker */}
      <div className="flex items-center gap-0.5 shrink-0 relative bg-slate-50 border border-slate-200/80 rounded-xl p-0.5 shadow-2xs">
        <button
          onClick={handlePrevMonth}
          title="Bulan Sebelumnya"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5 stroke-[2.4]" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCalendarPickerOpen(!isCalendarPickerOpen)}
            title="Klik untuk melihat kalender & memilih bulan"
            className="flex items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-white transition-colors cursor-pointer group"
          >
            <span className="text-[11px] sm:text-xs font-bold text-slate-800 tracking-tight whitespace-nowrap group-hover:text-[#0ea5e9]">
              {formatMonthYear(selectedDate)}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-500 stroke-[2.5] transition-transform duration-200 group-hover:translate-y-0.5" />
          </button>

          {isCalendarPickerOpen && (
            <MonthCalendarPicker
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
              onClose={() => setIsCalendarPickerOpen(false)}
              align="right"
            />
          )}
        </div>

        <button
          onClick={handleNextMonth}
          title="Bulan Berikutnya"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.4]" />
        </button>
      </div>
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
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [isOutlineDropdownOpen, setIsOutlineDropdownOpen] = useState(false);

  const viewDropdownRef = useRef<HTMLDivElement>(null);
  const outlineDropdownRef = useRef<HTMLDivElement>(null);

  const monthWeeks = getMonthWeeks(selectedDate, selectedDate);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(e.target as Node)) {
        setIsViewDropdownOpen(false);
      }
      if (outlineDropdownRef.current && !outlineDropdownRef.current.contains(e.target as Node)) {
        setIsOutlineDropdownOpen(false);
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

  const currentViewLabel = 
    viewMode === 'daily' ? 'Daily' :
    viewMode === 'weekly' ? 'Weekly' :
    viewMode === 'monthly' ? 'Monthly' :
    viewMode === 'tasks' ? 'Tasks Board' :
    viewMode === 'database' ? 'Database' : 'Settings';

  const currentOutlineLabel =
    outlineFilter === 'Work' ? 'Work' :
    outlineFilter === 'Improvement' ? 'Improvement' :
    outlineFilter === 'Buy' ? 'Buy' : 'Semua Outline';

  return (
    <header className={`pt-1.5 pb-3 md:py-4 px-4 sm:px-6 md:px-8 border-b border-slate-100 flex flex-wrap md:flex-nowrap items-center justify-between gap-2.5 sm:gap-3 bg-white text-slate-900 select-none shrink-0 relative z-20 ${
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



      {/* Zone 2 (Full-Width on Mobile inside green bar, Center-Left on Desktop): View Dropdown & Outline Dropdown */}
      <div className="order-1 md:order-2 w-full md:w-auto flex items-center justify-between md:justify-start gap-2 md:mr-auto">
        <div className="flex items-center gap-2">
          {/* 1. View Mode Dropdown */}
          <div className="relative" ref={viewDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsViewDropdownOpen((prev) => !prev);
                setIsOutlineDropdownOpen(false);
              }}
              title="Pilih Tampilan (Day, Week, Month)"
              className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs whitespace-nowrap border ${
                isViewDropdownOpen 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200/80'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{currentViewLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isViewDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isViewDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-800">
                <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Mode Tampilan
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSelectView('daily');
                    setIsViewDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left cursor-pointer transition-colors ${
                    viewMode === 'daily' ? 'bg-sky-50 font-bold text-[#0284c7]' : 'hover:bg-slate-50 font-medium text-slate-700'
                  }`}
                >
                  <span>Day (Harian)</span>
                  {viewMode === 'daily' && <Check className="w-3.5 h-3.5 text-[#0ea5e9] stroke-[2.5]" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectView('weekly');
                    setIsViewDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left cursor-pointer transition-colors ${
                    viewMode === 'weekly' ? 'bg-sky-50 font-bold text-[#0284c7]' : 'hover:bg-slate-50 font-medium text-slate-700'
                  }`}
                >
                  <span>Week (Mingguan)</span>
                  {viewMode === 'weekly' && <Check className="w-3.5 h-3.5 text-[#0ea5e9] stroke-[2.5]" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectView('monthly');
                    setIsViewDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left cursor-pointer transition-colors ${
                    viewMode === 'monthly' ? 'bg-sky-50 font-bold text-[#0284c7]' : 'hover:bg-slate-50 font-medium text-slate-700'
                  }`}
                >
                  <span>Month (Bulanan)</span>
                  {viewMode === 'monthly' && <Check className="w-3.5 h-3.5 text-[#0ea5e9] stroke-[2.5]" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectView('tasks');
                    setIsViewDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left cursor-pointer transition-colors ${
                    viewMode === 'tasks' ? 'bg-sky-50 font-bold text-[#0284c7]' : 'hover:bg-slate-50 font-medium text-slate-700'
                  }`}
                >
                  <span>Tasks Board</span>
                  {viewMode === 'tasks' && <Check className="w-3.5 h-3.5 text-[#0ea5e9] stroke-[2.5]" />}
                </button>
              </div>
            )}
          </div>

          {/* 2. Dropdown Outline: Work, Improvement, Buy */}
          <div className="relative" ref={outlineDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsOutlineDropdownOpen((prev) => !prev);
                setIsViewDropdownOpen(false);
              }}
              title="Pilih filter Outline (Work, Improvement, Buy)"
              className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs whitespace-nowrap border ${
                isOutlineDropdownOpen 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200/80'
              }`}
            >
              {outlineFilter === 'Work' ? (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-white/60 shrink-0" />
              ) : outlineFilter === 'Improvement' ? (
                <span className="w-2.5 h-2.5 rounded-full bg-violet-400 border border-white/60 shrink-0" />
              ) : outlineFilter === 'Buy' ? (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white/60 shrink-0" />
              ) : (
                <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
              <span>{currentOutlineLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOutlineDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {/* Outline Popover Dropdown */}
            {isOutlineDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-800">
                <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
