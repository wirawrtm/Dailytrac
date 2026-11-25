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
    <aside className={`order-2 md:order-1 md:w-[60px] md:h-full shrink-0 bg-white flex flex-row md:flex-col items-center px-3 max-md:py-0 md:px-0 md:py-4 justify-around md:justify-between select-none max-md:fixed max-md:h-12 max-md:z-30 md:z-20 max-md:transition-[transform,opacity] max-md:duration-200 max-md:ease-out motion-reduce:transition-none ${
      isMobileHidden
        ? 'max-md:translate-y-[calc(100%+32px)] max-md:opacity-0 max-md:pointer-events-none'
        : 'max-md:translate-y-0 max-md:opacity-100'
    } ${
      isFullscreen
        ? 'max-md:bottom-0 max-md:left-0 max-md:right-0 border-t md:border-t-0 md:border-r border-slate-100 rounded-none'
        : 'max-md:bottom-5 max-md:left-6 max-md:right-6 max-md:max-w-[340px] max-md:mx-auto border border-slate-200/80 rounded-full shadow-lg md:border-y md:border-r md:border-l-0 md:border-slate-200/80 md:rounded-l-none md:rounded-r-[32px] md:shadow-xl'
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
          className="group relative flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full md:rounded-2xl bg-[#38bdf8] hover:bg-[#0ea5e9] text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
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
  );
};

export default NavigationRail;
