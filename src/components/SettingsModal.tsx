import React from 'react';
import { X, Globe, Bell, RotateCcw, Shield, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onResetData,
}) => {
  if (!isOpen) return null;

  const timezones = ['GMT+07', 'GMT+08', 'GMT+00 (UTC)', 'GMT-05 (EST)', 'GMT-08 (PST)'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <h3 className="text-sm font-bold text-slate-900">Tasklio Preferences & Settings</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 text-xs text-slate-700">
          {/* User profile section */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">Display Name</label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => onUpdateUser({ name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00897b]/20 focus:border-[#00897b]"
            />
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">Schedule Timezone</label>
            <select
              value={user.timezone}
              onChange={(e) => onUpdateUser({ timezone: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00897b]/20 focus:border-[#00897b] bg-white font-mono"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          {/* Reset Demo Data */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">Restore Screenshot Sample Data</p>
              <p className="text-[11px] text-slate-500">Reset all meetings & tasks back to June 18, 2025.</p>
            </div>
            <button
              onClick={() => {
                onResetData();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
