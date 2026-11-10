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
  LayoutGrid
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
}

export const MobileTopBar: React.FC<TopHeaderProps> = ({
  user,
  onOpenProfileMenu,
  isProfileMenuOpen,
  onResetData,
  isSidebarOpen,
  onToggleSidebar,
  selectedDate,
  onSelectDate,
  onSelectView,
}) => {
  const [isCalendarPickerOpen, setIsCalendarPickerOpen] = useState(false);

  const handlePrevMonth = () => {
    onSelectDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    onSelectDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  return (
    <div className="md:hidden flex items-center justify-between px-2 pt-1 pb-1.5 bg-transparent text-slate-900 select-none shrink-0 relative z-30">
      {/* Left: Sidebar Toggle + Month Navigator (Month click opens calendar picker) */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Hide Calendar & Outlines" : "Open Calendar & Outlines"}
          className="w-9 h-9 rounded-2xl bg-transparent hover:bg-black/5 text-slate-800 transition-colors cursor-pointer flex items-center justify-center shrink-0"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-5 h-5 stroke-[2.2]" />
          ) : (
            <PanelLeft className="w-5 h-5 stroke-[2.2]" />
          )}
        </button>

        <div className="flex items-center gap-0.5 shrink-0 relative">
          <button
            onClick={handlePrevMonth}
            title="Bulan Sebelumnya"
            className="p-1.5 rounded-xl bg-transparent text-slate-700 hover:text-slate-950 hover:bg-black/5 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Month Text (Clickable to open Calendar Picker) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCalendarPickerOpen(!isCalendarPickerOpen)}
              title="Klik untuk melihat kalender & memilih bulan"
              className="flex items-center gap-1 px-2 py-1 rounded-xl hover:bg-black/5 transition-colors cursor-pointer group"
            >
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight whitespace-nowrap group-hover:text-[#00796b]">
                {formatMonthYear(selectedDate)}
              </h2>
              <ChevronDown className="w-3.5 h-3.5 text-slate-600 stroke-[2.5] transition-transform duration-200 group-hover:translate-y-0.5" />
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

          <button
            onClick={handleNextMonth}
            title="Bulan Berikutnya"
            className="p-1.5 rounded-xl bg-transparent text-slate-700 hover:text-slate-950 hover:bg-black/5 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Right: Enlarged User Profile (Male Avatar Icon) */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="relative">
          <button
            onClick={onOpenProfileMenu}
            className="flex items-center gap-1 p-1 rounded-full bg-transparent hover:bg-black/5 transition-all cursor-pointer group"
            title="Profil Pengguna"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-9.5 h-9.5 rounded-full object-cover ring-2 ring-[#00796b]/30 shadow-sm transition-transform group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <ChevronDown className="w-4 h-4 text-slate-700 stroke-[2.5]" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-3xl shadow-2xl border border-slate-100 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-[#00796b]/30 shadow-xs"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] text-[#00897b] font-semibold bg-teal-50 px-2 py-0.5 rounded-full">
                    {user.role} ({user.timezone})
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onSelectView('appscript');
                    onOpenProfileMenu();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer font-semibold"
                >
                  <span className="flex items-center gap-1.5">
                    <span>Apps Script Hub</span>
                    <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-full uppercase">TMP</span>
                  </span>
                </button>
                <button
                  onClick={() => {
                    onSelectView('settings');
                    onOpenProfileMenu();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer font-semibold"
                >
                  <span>Halaman Setting</span>
                </button>
                <button
                  onClick={onResetData}
                  className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center justify-between cursor-pointer font-medium"
                >
                  <span>Reset Demo Events</span>
                </button>
              </div>
            </div>
          )}
        </div>
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
    viewMode === 'monthly' ? 'Monthly' : 'Weekly';

  const currentOutlineLabel =
    outlineFilter === 'Work' ? 'Work' :
    outlineFilter === 'Improvement' ? 'Improvement' :
    outlineFilter === 'Buy' ? 'Buy' : 'Semua Outline';

  return (
    <header className={`py-2 md:py-2.5 px-3 sm:px-4 md:px-5 border-b border-teal-800/30 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-2 gap-x-2 sm:gap-3 bg-gradient-to-r from-[#005a50] via-[#00796b] to-[#008d7c] text-white select-none shrink-0 relative z-20 transform-gpu ${
      isFullscreen ? 'rounded-none' : 'rounded-t-[36px] md:rounded-t-[28px]'
    }`}>
      {/* Zone 1 (Desktop only — on Mobile rendered outside via MobileTopBar): Sidebar Toggle + Month Navigator */}
      <div className="hidden md:flex order-1 items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Toggle Sidebar Button */}
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Hide Calendar" : "Open Calendar"}
          className={`w-8 h-8 sm:w-auto sm:h-auto sm:p-2 rounded-2xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
            isSidebarOpen 
              ? 'bg-white/15 border-white/25 text-white hover:bg-white/25' 
              : 'bg-white text-[#00796b] border-white shadow-2xs hover:bg-teal-50'
          }`}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeft className="w-4 h-4" />
          )}
        </button>

        {/* Date Switcher */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 relative">
          <button
            onClick={handlePrevMonth}
            title="Previous Month"
            className="p-1.5 rounded-xl text-teal-100 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="relative flex items-center gap-1.5 px-0.5 sm:px-1">
            <button
              type="button"
              onClick={() => setIsCalendarPickerOpen(!isCalendarPickerOpen)}
              title="Klik untuk melihat kalender & memilih bulan"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl hover:bg-white/15 transition-colors cursor-pointer group"
            >
              <h2 className="text-sm font-extrabold text-white tracking-tight whitespace-nowrap">
                {formatMonthYear(selectedDate)}
              </h2>
              <ChevronDown className="w-3.5 h-3.5 text-teal-100 transition-transform duration-200 group-hover:translate-y-0.5" />
            </button>

            <span className="hidden lg:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/25">
              {monthWeeks.length} Weeks
            </span>

            {isCalendarPickerOpen && (
              <MonthCalendarPicker
                selectedDate={selectedDate}
                onSelectDate={onSelectDate}
                onClose={() => setIsCalendarPickerOpen(false)}
                align="left"
              />
            )}
          </div>

          <button
            onClick={handleNextMonth}
            title="Next Month"
            className="p-1.5 rounded-xl text-teal-100 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Zone 2 (Full-Width on Mobile inside green bar, Center-Left on Desktop): View Dropdown & Outline Dropdown */}
      <div className="order-1 md:order-2 w-full md:w-auto flex items-center justify-between md:justify-start gap-2 md:mr-auto">
        <div className="flex items-center gap-2">
          {/* 1. Dropdown View Mode: Daily, Weekly, Monthly */}
          <div className="relative" ref={viewDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsViewDropdownOpen((prev) => !prev);
                setIsOutlineDropdownOpen(false);
              }}
              title="Pilih tampilan jadwal (Daily, Weekly, Monthly)"
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap border ${
                isViewDropdownOpen 
                  ? 'bg-white text-[#00796b] border-white shadow-md' 
                  : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
              }`}
            >
              {viewMode === 'daily' ? (
                <Clock className="w-3.5 h-3.5" />
              ) : viewMode === 'monthly' ? (
                <LayoutGrid className="w-3.5 h-3.5" />
              ) : (
                <CalendarDays className="w-3.5 h-3.5" />
              )}
              <span>{currentViewLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isViewDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* View Mode Popover Dropdown */}
            {isViewDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-800">
                <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Tampilan Jadwal
                </div>

                {/* Daily option */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectView('daily');
                    setIsViewDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left cursor-pointer transition-colors ${
                    viewMode === 'daily'
                      ? 'bg-teal-50 font-bold text-[#00796b]'
                      : 'hover:bg-slate-50 font-medium text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <div>
                      <span className="block font-bold">Daily</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Tampilan per jam harian</span>
                    </div>
                  </span>
                  {viewMode === 'daily' && <Check className="w-3.5 h-3.5 text-[#00796b] stroke-[2.5]" />}
                </button>

                {/* Weekly option */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectView('weekly');
                    setIsViewDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left cursor-pointer transition-colors ${
                    viewMode === 'weekly'
                      ? 'bg-teal-50 font-bold text-[#00796b]'
                      : 'hover:bg-slate-50 font-medium text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                    <div>
                      <span className="block font-bold">Weekly</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Tampilan matriks mingguan</span>
                    </div>
                  </span>
                  {viewMode === 'weekly' && <Check className="w-3.5 h-3.5 text-[#00796b] stroke-[2.5]" />}
                </button>

                {/* Monthly option */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectView('monthly');
                    setIsViewDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left cursor-pointer transition-colors ${
                    viewMode === 'monthly'
                      ? 'bg-teal-50 font-bold text-[#00796b]'
                      : 'hover:bg-slate-50 font-medium text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
                    <div>
                      <span className="block font-bold">Monthly</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Kalender agenda bulanan</span>
                    </div>
                  </span>
                  {viewMode === 'monthly' && <Check className="w-3.5 h-3.5 text-[#00796b] stroke-[2.5]" />}
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
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap border ${
                isOutlineDropdownOpen 
                  ? 'bg-white text-[#00796b] border-white shadow-md' 
                  : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
              }`}
            >
              {outlineFilter === 'Work' ? (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-white/60 shrink-0" />
              ) : outlineFilter === 'Improvement' ? (
                <span className="w-2.5 h-2.5 rounded-full bg-violet-400 border border-white/60 shrink-0" />
              ) : outlineFilter === 'Buy' ? (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white/60 shrink-0" />
              ) : (
                <Layers className="w-3.5 h-3.5 text-teal-100 shrink-0" />
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
                      ? 'bg-teal-50 font-bold text-[#00796b]'
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
                  {outlineFilter === 'all' && <Check className="w-3.5 h-3.5 text-[#00796b] stroke-[2.5]" />}
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

      {/* Zone 3 (Desktop only — on Mobile rendered outside via MobileTopBar): Fullscreen + Profile */}
      <div className="hidden md:flex order-2 md:order-3 items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Fullscreen Button */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          className="hidden sm:inline-flex p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={onOpenProfileMenu}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 transition-all cursor-pointer border border-white/20 shadow-xs"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8.5 h-8.5 rounded-full object-cover ring-2 ring-white/40 shadow-xs"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="text-xs font-bold text-white whitespace-nowrap hidden md:inline">
              {user.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-teal-100" />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-3xl shadow-2xl border border-slate-100 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-[#00796b]/30 shadow-xs"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] text-[#00897b] font-semibold bg-teal-50 px-2 py-0.5 rounded-full">
                    {user.role} ({user.timezone})
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onSelectView('appscript');
                    onOpenProfileMenu();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer font-semibold"
                >
                  <span className="flex items-center gap-1.5">
                    <span>Apps Script Hub</span>
                    <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-full uppercase">TMP</span>
                  </span>
                </button>
                <button
                  onClick={() => {
                    onSelectView('settings');
                    onOpenProfileMenu();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer font-semibold"
                >
                  <span>Halaman Setting</span>
                </button>
                <button
                  onClick={onResetData}
                  className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center justify-between cursor-pointer font-medium"
                >
                  <span>Reset Demo Events</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
