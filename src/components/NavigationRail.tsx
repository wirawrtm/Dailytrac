import React from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Settings, 
  Plus,
  Database,
  LayoutDashboard,
  BarChart3,
  Clock,
  User,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { ViewMode } from '../types';

interface NavigationRailProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onOpenSettings: () => void;
  isFullscreen?: boolean;
  onOpenCreateModal?: () => void;
  isMobileHidden?: boolean;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  currentView,
  onSelectView,
  onOpenSettings,
  isFullscreen = false,
  onOpenCreateModal,
  isMobileHidden = false,
}) => {
  return (
    <div className={`max-md:fixed max-md:z-30 max-md:inset-x-4 max-md:max-w-[440px] max-md:mx-auto max-md:flex max-md:items-center max-md:gap-3 max-md:pointer-events-none md:contents ${
      isFullscreen ? 'max-md:bottom-3' : 'max-md:bottom-4'
    }`}>
      <aside className={`pointer-events-auto order-1 md:w-[60px] md:h-full shrink-0 bg-white/70 md:bg-white/80 backdrop-blur-xl backdrop-saturate-150 flex flex-row md:flex-col items-center px-3 max-md:py-1.5 md:px-0 md:py-4 justify-around md:justify-between select-none max-md:flex-1 max-md:h-14 md:z-20 ${
        isFullscreen
          ? 'border border-white/60 ring-1 ring-slate-900/5 rounded-full shadow-xl shadow-slate-900/10 md:ring-0 md:border-y-0 md:border-l-0 md:border-r md:border-slate-100 md:rounded-none md:shadow-none'
          : 'border border-white/60 ring-1 ring-slate-900/5 rounded-full shadow-xl shadow-slate-900/10 md:ring-0 md:border-y md:border-r md:border-l-0 md:border-slate-200/80 md:rounded-l-none md:rounded-r-[32px] md:shadow-xl'
      }`}>
        {/* Top Branding Logo Box & Create Button */}
        <div className="contents md:flex md:flex-col items-center md:gap-3.5">
          {/* Brand Logo Box */}
          <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-xl bg-[#38bdf8] text-white shadow-md shadow-sky-500/30 cursor-pointer hover:scale-105 transition-transform" title="Tasklio Dashboard">
            <span className="text-base font-black">?</span>
          </div>

          <button 
            onClick={onOpenCreateModal}
            title="Create New Task (+)"
            className="hidden md:flex group relative items-center justify-center w-9 h-9 rounded-2xl bg-[#38bdf8] hover:bg-[#0ea5e9] text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.75] text-white transition-transform group-hover:rotate-90 duration-300" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-300 ring-2 ring-white"></span>
          </button>

        {/* Navigation Items */}
        <nav className="contents md:flex md:flex-col items-center md:gap-1.5">
          {/* Dashboard / Calendar View */}
          <button
            onClick={() => onSelectView('daily')}
            title="Dashboard / Calendar Schedule"
            className={`w-8 h-8 md:w-9 md:h-9 rounded-full md:rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
              currentView === 'weekly' || currentView === 'daily' || currentView === 'monthly'
                ? 'bg-[#38bdf8] text-white shadow-sm font-semibold ring-2 ring-sky-100'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Daily Task Tracker / Board */}
          <button
            onClick={() => onSelectView('tasks')}
            title="Daily Task Tracker"
            className={`w-8 h-8 md:w-9 md:h-9 rounded-full md:rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
              currentView === 'tasks'
                ? 'bg-[#38bdf8] text-white shadow-sm font-semibold ring-2 ring-sky-100'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <CheckSquare className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Analytics / Charts */}
          <button
            onClick={() => onSelectView('database')}
            title="Database & Analytics"
            className={`w-8 h-8 md:w-9 md:h-9 rounded-full md:rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
              currentView === 'database'
                ? 'bg-[#38bdf8] text-white shadow-sm font-semibold ring-2 ring-sky-100'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Clock / Activity */}
          <button
            onClick={() => onSelectView('weekly')}
            title="Weekly Timeline"
            className="w-8 h-8 md:w-9 md:h-9 rounded-full md:rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all duration-200 cursor-pointer shrink-0"
          >
            <Clock className="w-4 h-4 stroke-[2]" />
          </button>
        </nav>
      </div>

      {/* Bottom Actions: Settings & Help */}
      <div className="contents md:flex md:flex-col items-center md:gap-1.5">
        <button
          onClick={() => {
            onSelectView('settings');
            onOpenSettings();
          }}
          title="Settings"
          className={`w-8 h-8 md:w-9 md:h-9 rounded-full md:rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
            currentView === 'settings'
              ? 'bg-[#38bdf8] text-white shadow-sm font-semibold ring-2 ring-sky-100'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4 stroke-[2]" />
        </button>

        <button
          onClick={() => {
            onSelectView('settings');
            onOpenSettings();
          }}
          title="Help & Info"
          className="w-8 h-8 md:w-9 md:h-9 rounded-full md:rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all duration-200 cursor-pointer shrink-0 hidden md:flex"
        >
          <HelpCircle className="w-4 h-4 stroke-[2]" />
        </button>
        </div>
      </aside>

      {/* Standalone Create New Task (+) Button on Mobile Right */}
      <button
        type="button"
        onClick={onOpenCreateModal}
        title="Create New Task (+)"
        className="md:hidden order-2 pointer-events-auto group relative flex items-center justify-center w-14 h-14 rounded-full bg-linear-30 from-[#38bdf8] to-[#0ea5e9] text-white shadow-xl shadow-sky-500/30 ring-2 ring-white/75 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
      >
        <Plus className="w-5 h-5 stroke-[2.75] text-white transition-transform group-hover:rotate-90 duration-300" />
        <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-amber-300 ring-2 ring-white"></span>
      </button>
    </div>
  );
};

export default NavigationRail;
