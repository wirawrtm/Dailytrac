import React from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Settings, 
  Plus,
  Code2,
  Database
} from 'lucide-react';
import { ViewMode } from '../types';

interface NavigationRailProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onOpenSettings: () => void;
  isFullscreen?: boolean;
  onOpenCreateModal?: () => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  currentView,
  onSelectView,
  onOpenSettings,
  isFullscreen = false,
  onOpenCreateModal,
}) => {
  return (
    <aside className={`order-2 md:order-1 w-full h-16 md:w-[74px] md:h-full shrink-0 bg-white flex flex-row md:flex-col items-center px-4 py-2 md:px-0 md:py-6 justify-around md:justify-between select-none transition-all duration-200 z-20 ${
      isFullscreen
        ? 'border-t md:border-t-0 md:border-r border-slate-100 rounded-none'
        : 'border md:border-y md:border-r md:border-l-0 border-slate-200/80 rounded-[26px] md:rounded-l-none md:rounded-r-[34px] shadow-xl'
    }`}>
      {/* Create New Task Action Button */}
      <div className="contents md:flex md:flex-col items-center md:gap-5">
        <button 
          onClick={onOpenCreateModal}
          title="Create New Task (+)"
          className="group relative flex items-center justify-center w-11 h-11 md:w-11 md:h-11 rounded-2xl bg-[#00897b] hover:bg-[#00796b] text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5 stroke-[3] text-white transition-transform group-hover:rotate-90 duration-300" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#f6c445] ring-2 ring-white"></span>
        </button>

        {/* Navigation Items: Calendar & Daily Task Tracker & Apps Script (Temp) & Google Sheet DB */}
        <nav className="contents md:flex md:flex-col items-center md:gap-3">
          {/* Calendar (Active with yellow #f6c445) */}
          <button
            onClick={() => onSelectView('weekly')}
            title="Calendar Schedule"
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
              currentView === 'weekly' || currentView === 'daily' || currentView === 'monthly'
                ? 'bg-[#f6c445] text-slate-900 shadow-2xs font-semibold ring-2 ring-[#f6c445]/20'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <CalendarIcon className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>

          {/* Tasks & Todo */}
          <button
            onClick={() => onSelectView('tasks')}
            title="Daily Task Tracker"
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
              currentView === 'tasks'
                ? 'bg-[#f6c445] text-slate-900 shadow-2xs font-semibold ring-2 ring-[#f6c445]/20'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <CheckSquare className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>

          {/* Database Mirroring (Spreadsheet Mirror) */}
          <button
            onClick={() => onSelectView('database')}
            title="Database Mirroring (Google Spreadsheet)"
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
              currentView === 'database'
                ? 'bg-[#f6c445] text-slate-900 shadow-2xs font-semibold ring-2 ring-[#f6c445]/20'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Database className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>

          {/* Apps Script (Temporary Menu) */}
          <button
            onClick={() => onSelectView('appscript')}
            title="Apps Script Code & Updates (Temporary)"
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 relative ${
              currentView === 'appscript'
                ? 'bg-[#f6c445] text-slate-900 shadow-2xs font-semibold ring-2 ring-[#f6c445]/20'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Code2 className="w-4.5 h-4.5 stroke-[2.2]" />
            <span className="absolute -top-1 -right-1 text-[7.5px] font-black px-1 py-0.2 rounded-full bg-rose-500 text-white uppercase tracking-tighter">
              TMP
            </span>
          </button>

        </nav>
      </div>

      {/* Bottom / Right Actions: Settings only */}
      <div className="contents md:flex md:flex-col items-center">
        <button
          onClick={() => {
            onSelectView('settings');
            onOpenSettings();
          }}
          title="Settings"
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
            currentView === 'settings'
              ? 'bg-[#f6c445] text-slate-900 shadow-2xs font-semibold ring-2 ring-[#f6c445]/20'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>
      </div>
    </aside>
  );
};
