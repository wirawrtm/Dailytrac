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
    <aside className={`order-2 md:order-1 md:w-[78px] md:h-full shrink-0 bg-white flex flex-row md:flex-col items-center px-4 max-md:py-0 md:px-0 md:py-6 justify-around md:justify-between select-none max-md:fixed max-md:h-16 max-md:z-30 md:z-20 max-md:transition-[transform,opacity] max-md:duration-200 max-md:ease-out motion-reduce:transition-none ${
      isMobileHidden
        ? 'max-md:translate-y-[calc(100%+24px)] max-md:opacity-0 max-md:pointer-events-none'
        : 'max-md:translate-y-0 max-md:opacity-100'
    } ${
      isFullscreen
        ? 'max-md:bottom-0 max-md:left-0 max-md:right-0 border-t md:border-t-0 md:border-r border-slate-100 rounded-none'
        : 'max-md:bottom-2.5 max-md:left-2.5 max-md:right-2.5 border border-slate-200/80 rounded-[24px] shadow-xl md:border-y md:border-r md:border-l-0 md:border-slate-200/80 md:rounded-l-none md:rounded-r-[34px] md:shadow-xl'
    }`}>
      {/* Top Branding Logo Box & Create Button */}
      <div className="contents md:flex md:flex-col items-center md:gap-5">
        {/* Brand Logo Box (Blue question mark / icon matching IMG_1033) */}
        <div className="hidden md:flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/30 cursor-pointer hover:scale-105 transition-transform" title="Tasklio Dashboard">
          <span className="text-xl font-black">?</span>
        </div>

        <button 
          onClick={onOpenCreateModal}
          title="Create New Task (+)"
          className="group relative flex items-center justify-center w-11 h-11 md:w-11 md:h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5 stroke-[3] text-white transition-transform group-hover:rotate-90 duration-300" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-sky-400 ring-2 ring-white"></span>
        </button>

        {/* Navigation Items */}
        <nav className="contents md:flex md:flex-col items-center md:gap-2.5">
          {/* Dashboard / Calendar View */}
          <button
            onClick={() => onSelectView('daily')}
            title="Dashboard / Calendar Schedule"
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
              currentView === 'weekly' || currentView === 'daily' || currentView === 'monthly'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold ring-2 ring-indigo-100'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>

          {/* Daily Task Tracker / Board */}
          <button
            onClick={() => onSelectView('tasks')}
            title="Daily Task Tracker"
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
              currentView === 'tasks'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold ring-2 ring-indigo-100'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <CheckSquare className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>

          {/* Analytics / Charts */}
          <button
            onClick={() => onSelectView('database')}
            title="Database & Analytics"
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
              currentView === 'database'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold ring-2 ring-indigo-100'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>

          {/* Clock / Activity */}
          <button
            onClick={() => onSelectView('weekly')}
            title="Weekly Timeline"
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all duration-200 cursor-pointer shrink-0"
          >
            <Clock className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>
        </nav>
      </div>

      {/* Bottom Actions: User, Settings, Help, Exit */}
      <div className="contents md:flex md:flex-col items-center md:gap-2">
        <button
          onClick={() => {
            onSelectView('settings');
            onOpenSettings();
          }}
          title="Settings"
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
            currentView === 'settings'
              ? 'bg-indigo-600 text-white shadow-sm font-semibold ring-2 ring-indigo-100'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>

        <button
          onClick={() => {
            onSelectView('settings');
            onOpenSettings();
          }}
          title="Help & Info"
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all duration-200 cursor-pointer shrink-0 hidden md:flex"
        >
          <HelpCircle className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>
      </div>
    </aside>
  );
};

export default NavigationRail;
