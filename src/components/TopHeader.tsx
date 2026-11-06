import React, { useState } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  ChevronDown, 
  PanelLeftClose, 
  PanelLeft, 
  Maximize2, 
  Minimize2,
  Calendar as CalendarIcon
} from 'lucide-react';
import { UserProfile, ViewMode } from '../types';
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
}) => {
  const [isCalendarPickerOpen, setIsCalendarPickerOpen] = useState(false);
  const monthWeeks = getMonthWeeks(selectedDate, selectedDate);

  const handlePrevMonth = () => {
    onSelectDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    onSelectDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  return (
    <header className={`py-2 md:py-2.5 px-3 sm:px-4 md:px-5 border-b border-teal-800/30 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-2 gap-x-2 sm:gap-3 bg-gradient-to-r from-[#005a50] via-[#00796b] to-[#008d7c] text-white select-none shrink-0 relative z-20 transform-gpu ${
      isFullscreen ? 'rounded-none' : 'rounded-t-[36px] md:rounded-t-[28px]'
    }`}>
      {/* Zone 1 (Desktop only — on Mobile rendered outside via MobileTopBar): Sidebar Toggle + Month Navigator */}
      <div className="hidden md:flex order-1 items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Toggle Sidebar Button */}
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Hide Calendar & Outlines" : "Open Calendar & Outlines"}
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

      {/* Zone 2 (Full-Width on Mobile inside green bar, Center-Left on Desktop): View Switcher */}
      <div className="order-1 md:order-2 w-full md:w-auto flex items-center justify-between md:justify-start gap-2 md:mr-auto">
        {/* View Switcher: Daily, Weekly, Monthly (Only active has white pill background, inactive has NO background) */}
        <div className="flex-1 md:flex-initial grid grid-cols-3 md:flex items-center gap-1 p-0.5">
          <button
            onClick={() => onSelectView('daily')}
            className={`px-3.5 py-1.5 text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap text-center ${
              viewMode === 'daily'
                ? 'bg-white text-[#00796b] shadow-sm font-extrabold'
                : 'bg-transparent text-white/85 hover:text-white font-semibold'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => onSelectView('weekly')}
            className={`px-3.5 py-1.5 text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap text-center ${
              viewMode === 'weekly'
                ? 'bg-white text-[#00796b] shadow-sm font-extrabold'
                : 'bg-transparent text-white/85 hover:text-white font-semibold'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => onSelectView('monthly')}
            className={`px-3.5 py-1.5 text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap text-center ${
              viewMode === 'monthly'
                ? 'bg-white text-[#00796b] shadow-sm font-extrabold'
                : 'bg-transparent text-white/85 hover:text-white font-semibold'
            }`}
          >
            Monthly
          </button>
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
