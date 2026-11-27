import React from 'react';
import { 
  CheckSquare, 
  Plus,
  LayoutDashboard,
  Clock,
  CalendarDays
} from 'lucide-react';
import { ViewMode } from '../types';

interface NavigationRailProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onOpenSettings?: () => void;
  isFullscreen?: boolean;
  onOpenCreateModal?: () => void;
  isMobileHidden?: boolean;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  currentView,
  onSelectView,
  isFullscreen = false,
  onOpenCreateModal,
}) => {
  return (
    <div className={`max-md:fixed max-md:z-30 max-md:inset-x-4 max-md:max-w-[440px] max-md:mx-auto max-md:flex max-md:items-center max-md:gap-2.5 max-md:pointer-events-none md:contents ${
      isFullscreen ? 'max-md:bottom-3' : 'max-md:bottom-4'
    }`}>
      <aside className={`pointer-events-auto order-1 md:w-[60px] md:h-full shrink-0 bg-white/35 md:bg-white/45 backdrop-blur-lg backdrop-saturate-150 flex flex-row md:flex-col items-center px-3 max-md:py-1.5 md:px-0 md:py-4 justify-around md:justify-start select-none max-md:flex-1 max-md:h-14 md:z-20 border-0 ${
        isFullscreen
          ? 'rounded-full shadow-xl shadow-slate-900/10 md:rounded-none md:shadow-none'
          : 'rounded-full shadow-xl shadow-slate-900/10 md:rounded-l-none md:rounded-r-[32px] md:shadow-xl'
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
            className="hidden md:flex group relative items-center justify-center w-9 h-9 rounded-2xl bg-linear-30 from-[#1d4ed8] via-[#0ea5e9] to-[#67e8f9] text-white shadow-md shadow-sky-500/30 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.75] text-white drop-shadow-xs transition-transform group-hover:rotate-90 duration-300" />
          </button>

          {/* Navigation Items (Calendar Group) */}
          <nav className="contents md:flex md:flex-col items-center md:gap-1.5">
            {/* Dashboard / Daily Calendar View */}
            <button
              onClick={() => onSelectView('daily')}
              title="Daily Schedule"
              className={`w-8 h-8 md:w-9 md:h-9 rounded-full md:rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
                currentView === 'daily'
                  ? 'bg-linear-30 from-[#1d4ed8] via-[#0ea5e9] to-[#67e8f9] text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 stroke-[2]" />
            </button>

            {/* Weekly Timeline */}
            <button
              onClick={() => onSelectView('weekly')}
              title="Weekly Timeline"
              className={`w-8 h-8 md:w-9 md:h-9 rounded-full md:rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
                currentView === 'weekly'
                  ? 'bg-linear-30 from-[#1d4ed8] via-[#0ea5e9] to-[#67e8f9] text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Clock className="w-4 h-4 stroke-[2]" />
            </button>

            {/* Monthly Calendar */}
            <button
              onClick={() => onSelectView('monthly')}
              title="Monthly Calendar"
              className={`w-8 h-8 md:w-9 md:h-9 rounded-full md:rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
                currentView === 'monthly'
                  ? 'bg-linear-30 from-[#1d4ed8] via-[#0ea5e9] to-[#67e8f9] text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <CalendarDays className="w-4 h-4 stroke-[2]" />
            </button>
          </nav>

          {/* Desktop-only separated Task Board button */}
          <button
            onClick={() => onSelectView('tasks')}
            title="Task Board"
            className={`hidden md:flex md:mt-2 w-9 h-9 rounded-2xl items-center justify-center bg-linear-30 from-[#3730a3] via-[#7c3aed] to-[#e879f9] text-white shadow-md shadow-violet-500/30 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              currentView === 'tasks'
                ? 'shadow-lg shadow-violet-500/45 scale-105'
                : 'opacity-95 hover:opacity-100'
            }`}
          >
            <CheckSquare className="w-4 h-4 stroke-[2.2] drop-shadow-xs" />
          </button>
        </div>
      </aside>

      {/* Standalone Task Board Button on Mobile */}
      <button
        type="button"
        onClick={() => onSelectView('tasks')}
        title="Task Board"
        className={`md:hidden order-2 pointer-events-auto flex items-center justify-center w-14 h-14 rounded-full bg-linear-30 from-[#3730a3] via-[#7c3aed] to-[#e879f9] text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
          currentView === 'tasks'
            ? 'shadow-xl shadow-violet-500/45 scale-105'
            : 'shadow-xl shadow-violet-500/30'
        }`}
      >
        <CheckSquare className="w-5 h-5 stroke-[2.2] drop-shadow-xs" />
      </button>

      {/* Standalone Create New Task (+) Button on Mobile Right */}
      <button
        type="button"
        onClick={onOpenCreateModal}
        title="Create New Task (+)"
        className="md:hidden order-3 pointer-events-auto group relative flex items-center justify-center w-14 h-14 rounded-full bg-linear-30 from-[#1d4ed8] via-[#0ea5e9] to-[#67e8f9] text-white shadow-xl shadow-sky-500/35 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
      >
        <Plus className="w-5 h-5 stroke-[2.75] text-white drop-shadow-xs transition-transform group-hover:rotate-90 duration-300" />
      </button>
    </div>
  );
};

export default NavigationRail;
