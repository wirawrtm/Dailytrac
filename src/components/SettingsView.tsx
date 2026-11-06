import React, { useState } from 'react';
import {
  User,
  Building2,
  Globe,
  Plus,
  Trash2,
  RotateCcw,
  Download,
  Check,
  Layout,
  ArrowLeft,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import { UserProfile, DepartmentItem, EventColorTheme, TaskEvent, ViewMode, WorkOutline } from '../types';
import { getAvatarUrl } from '../data/initialData';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  departments: DepartmentItem[];
  onAddDepartment: (dept: DepartmentItem) => void;
  onRemoveDepartment: (deptId: string) => void;
  events: TaskEvent[];
  onResetData: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onChangeView: (view: ViewMode) => void;
  onShowToast?: (msg: string) => void;
}

const COLOR_OPTIONS: { theme: EventColorTheme; dot: string; label: string }[] = [
  { theme: 'cyan', dot: 'bg-teal-500', label: 'Teal' },
  { theme: 'purple', dot: 'bg-purple-500', label: 'Purple' },
  { theme: 'peach', dot: 'bg-amber-500', label: 'Amber' },
  { theme: 'indigo', dot: 'bg-indigo-500', label: 'Indigo' },
  { theme: 'emerald', dot: 'bg-emerald-500', label: 'Emerald' },
  { theme: 'pink', dot: 'bg-rose-500', label: 'Rose' },
];

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  getAvatarUrl('John Doe', '#00796b'),
  getAvatarUrl('Sarah Miller', '#7c3aed'),
  getAvatarUrl('Alex Rivera', '#2563eb'),
  getAvatarUrl('Emma Watson', '#d97706'),
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
  departments,
  onAddDepartment,
  onRemoveDepartment,
  events,
  onResetData,
  isSidebarOpen,
  onToggleSidebar,
  onChangeView,
  onShowToast,
}) => {
  const [nameInput, setNameInput] = useState(user.name);
  const [emailInput, setEmailInput] = useState(user.email);
  const [roleInput, setRoleInput] = useState(user.role || 'Product Lead');
  const [timezoneInput, setTimezoneInput] = useState(user.timezone);

  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptOutline, setNewDeptOutline] = useState<WorkOutline>('Work');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  const timezones = [
    'GMT+07 (WIB - Jakarta)',
    'GMT+08 (WITA - Bali/Singapore)',
    'GMT+09 (WIT - Tokyo/Jayapura)',
    'GMT+00 (UTC)',
    'GMT-05 (EST)',
    'GMT-08 (PST)',
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name: nameInput.trim() || 'User',
      email: emailInput.trim() || 'user@company.design',
      role: roleInput.trim() || 'Team Member',
      timezone: timezoneInput,
    });
    onShowToast?.('Profile and preferences saved successfully!');
  };

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDeptName.trim();
    if (!trimmed) return;

    const exists = departments.some((d) => d.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      onShowToast?.(`Department "${trimmed}" already exists!`);
      return;
    }

    const chosenColor = COLOR_OPTIONS[selectedColorIdx] || COLOR_OPTIONS[0];
    onAddDepartment({
      id: trimmed,
      name: trimmed,
      outline: newDeptOutline,
      colorTheme: chosenColor.theme,
      dotColor: chosenColor.dot,
    });
    setNewDeptName('');
    onShowToast?.(`Added "${trimmed}" under ${newDeptOutline}!`);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({ user, departments, events }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasklio-schedule-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast?.('Schedule data exported to JSON!');
  };

  const workDepts = departments.filter((d) => d.outline === 'Work');
  const improvementDepts = departments.filter((d) => d.outline === 'Improvement');

  const renderDeptGroup = (title: string, subtitle: string, icon: React.ReactNode, list: DepartmentItem[]) => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {icon}
          <div>
            <h3 className="text-xs font-bold text-slate-900">{title}</h3>
            <p className="text-[10px] text-slate-400">{subtitle}</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          {list.length} dept
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {list.map((dept) => {
          const taskCount = events.filter(
            (e) => (e.department || e.subtitle || 'Engineering').toLowerCase() === dept.name.toLowerCase()
          ).length;

          return (
            <div
              key={dept.id}
              className="flex items-center justify-between p-2 px-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dept.dotColor}`} />
                <span className="text-xs font-bold text-slate-800 truncate">{dept.name}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                  {taskCount} tasks
                </span>
                {departments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveDepartment(dept.id)}
                    title={`Remove ${dept.name}`}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/40 overflow-y-auto select-none p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-6">
        {/* Top Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-[#00796b] border border-teal-200">
                Workspace Settings
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
              Settings & Main Outlines Configuration
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your profile, timezone, and departments organized under Work and Improvement.
            </p>
          </div>

          <button
            onClick={() => onChangeView('weekly')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Schedule</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: User Profile & Preferences (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* 1. User Profile Card */}
            <form
              onSubmit={handleSaveProfile}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col gap-4"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <User className="w-4 h-4 text-[#00796b]" />
                <h2 className="text-sm font-bold text-slate-900">Profile & Timezone</h2>
              </div>

              {/* Avatar Picker */}
              <div className="flex items-center gap-4">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#00796b]/30 shrink-0"
                />
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-700">Choose Profile Avatar</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {AVATAR_PRESETS.map((avUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onUpdateUser({ avatar: avUrl })}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                          user.avatar === avUrl
                            ? 'border-[#00796b] scale-110 shadow-xs'
                            : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={avUrl} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00796b]/20 focus:border-[#00796b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Role / Position
                  </label>
                  <input
                    type="text"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00796b]/20 focus:border-[#00796b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00796b]/20 focus:border-[#00796b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-[#00796b]" />
                    <span>Schedule Timezone</span>
                  </label>
                  <select
                    value={timezoneInput}
                    onChange={(e) => setTimezoneInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00796b]/20 focus:border-[#00796b] bg-white font-medium"
                  >
                    {timezones.map((tz) => (
                      <option key={tz} value={tz.split(' ')[0]}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#00796b] hover:bg-[#00695c] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>

            {/* 2. Display & Data Management Card */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Layout className="w-4 h-4 text-[#00796b]" />
                <h2 className="text-sm font-bold text-slate-900">Display & Data Backup</h2>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-800">Left Calendar & Filter Panel</p>
                  <p className="text-[11px] text-slate-500">
                    Show or hide the mini calendar and Work / Improvement filter sidebar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onToggleSidebar}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSidebarOpen
                      ? 'bg-teal-50 text-[#00796b] border border-teal-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isSidebarOpen ? 'Visible (Open)' : 'Hidden'}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div>
                  <p className="text-xs font-bold text-slate-800">Backup or Restore Demo Schedule</p>
                  <p className="text-[11px] text-slate-500">
                    Total {events.length} tasks stored locally in your browser.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={onResetData}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Demo Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Two Main Outlines & Department Management (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#00796b]" />
                  <h2 className="text-sm font-bold text-slate-900">Main Outlines & Departments</h2>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#00796b]">
                  {departments.length} Depts
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Departments are grouped into two main outlines: <strong>1. Work</strong> (Daily Operations) and <strong>2. Improvement</strong> (Continuous Innovation).
              </p>

              {/* Add New Department Form */}
              <form onSubmit={handleCreateDepartment} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-800">
                  + Add New Department
                </label>

                {/* Select Outline: Work vs Improvement */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setNewDeptOutline('Work')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      newDeptOutline === 'Work'
                        ? 'bg-[#00796b] text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>1. Work</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDeptOutline('Improvement')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      newDeptOutline === 'Improvement'
                        ? 'bg-[#00796b] text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>2. Improvement</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="e.g. Legal, Customer Success, QA..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00796b]/20 focus:border-[#00796b]"
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {COLOR_OPTIONS.map((col, idx) => (
                      <button
                        key={col.label}
                        type="button"
                        onClick={() => setSelectedColorIdx(idx)}
                        title={col.label}
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                          col.dot
                        } ${selectedColorIdx === idx ? 'scale-125 ring-2 ring-offset-1 ring-slate-800' : 'opacity-70 hover:opacity-100'}`}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#f6c445] hover:bg-[#eab32f] text-slate-900 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add</span>
                  </button>
                </div>
              </form>

              {/* Two Main Outlines List */}
              <div className="flex flex-col gap-4 max-h-[340px] overflow-y-auto pr-1">
                {renderDeptGroup(
                  '1. Work',
                  'Routine & Daily Operations',
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />,
                  workDepts
                )}

                <div className="border-t border-slate-100 pt-3">
                  {renderDeptGroup(
                    '2. Improvement',
                    'Continuous Upgrade & Innovation',
                    <TrendingUp className="w-3.5 h-3.5 text-[#00796b]" />,
                    improvementDepts
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
