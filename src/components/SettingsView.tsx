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
  TrendingUp,
  ShoppingCart,
  Pencil,
  X
} from 'lucide-react';
import { UserProfile, DepartmentItem, EventColorTheme, TaskEvent, ViewMode, WorkOutline } from '../types';
import { getAvatarUrl } from '../data/initialData';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  departments: DepartmentItem[];
  onAddDepartment: (dept: DepartmentItem) => void;
  onUpdateDepartment?: (
    deptId: string,
    updates: {
      name: string;
      outline: WorkOutline;
      colorTheme: EventColorTheme;
      dotColor: string;
    }
  ) => void;
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
  onUpdateDepartment,
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

  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editDeptName, setEditDeptName] = useState('');
  const [editDeptOutline, setEditDeptOutline] = useState<WorkOutline>('Work');
  const [editDeptColorIdx, setEditDeptColorIdx] = useState(0);

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

  const startEditingDept = (dept: DepartmentItem) => {
    setEditingDeptId(dept.id);
    setEditDeptName(dept.name);
    setEditDeptOutline(dept.outline);
    const matchedIdx = COLOR_OPTIONS.findIndex(
      (c) => c.theme === dept.colorTheme || c.dot === dept.dotColor
    );
    setEditDeptColorIdx(matchedIdx >= 0 ? matchedIdx : 0);
  };

  const cancelEditingDept = () => {
    setEditingDeptId(null);
    setEditDeptName('');
  };

  const saveEditingDept = (dept: DepartmentItem) => {
    const trimmed = editDeptName.trim();
    if (!trimmed) {
      onShowToast?.('Nama departemen tidak boleh kosong.');
      return;
    }

    const duplicate = departments.some(
      (d) => d.id !== dept.id && d.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      onShowToast?.(`Departemen "${trimmed}" sudah ada!`);
      return;
    }

    const chosenColor = COLOR_OPTIONS[editDeptColorIdx] || COLOR_OPTIONS[0];
    onUpdateDepartment?.(dept.id, {
      name: trimmed,
      outline: editDeptOutline,
      colorTheme: chosenColor.theme,
      dotColor: chosenColor.dot,
    });
    setEditingDeptId(null);
  };

  const workDepts = departments.filter((d) => d.outline === 'Work');
  const improvementDepts = departments.filter((d) => d.outline === 'Improvement');
  const buyDepts = departments.filter((d) => d.outline === 'Buy');

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

          if (editingDeptId === dept.id) {
            return (
              <div
                key={dept.id}
                className="p-3 rounded-2xl border border-[#38bdf8] bg-sky-50/40 flex flex-col gap-2.5 animate-in fade-in duration-150"
              >
                <div className="grid grid-cols-3 gap-1 p-1 bg-white rounded-full border border-slate-200">
                  {(['Work', 'Improvement', 'Buy'] as WorkOutline[]).map((outlineOpt) => (
                    <button
                      key={outlineOpt}
                      type="button"
                      onClick={() => setEditDeptOutline(outlineOpt)}
                      className={`py-1 px-2 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        editDeptOutline === outlineOpt
                          ? 'bg-[#38bdf8] text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {outlineOpt}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={editDeptName}
                  onChange={(e) => setEditDeptName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      saveEditingDept(dept);
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      cancelEditingDept();
                    }
                  }}
                  autoFocus
                  placeholder="Nama departemen..."
                  className="w-full px-3 py-2 text-sm sm:text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/25 focus:border-[#38bdf8] transition-all"
                />

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {COLOR_OPTIONS.map((col, idx) => (
                      <button
                        key={col.label}
                        type="button"
                        onClick={() => setEditDeptColorIdx(idx)}
                        title={col.label}
                        className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                          col.dot
                        } ${editDeptColorIdx === idx ? 'scale-125 ring-2 ring-offset-1 ring-slate-800' : 'opacity-70 hover:opacity-100'}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={cancelEditingDept}
                      title="Batal"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      <span>Batal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => saveEditingDept(dept)}
                      title="Simpan Perubahan"
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#38bdf8] hover:bg-[#0ea5e9] text-white text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      <span>Simpan</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={dept.id}
              className="flex items-center justify-between p-2.5 px-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dept.dotColor}`} />
                <span className="text-xs font-bold text-slate-800 truncate">{dept.name}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 mr-0.5">
                  {taskCount} tasks
                </span>
                <button
                  type="button"
                  onClick={() => startEditingDept(dept)}
                  title={`Edit ${dept.name}`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#0ea5e9] hover:bg-sky-50 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {departments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveDepartment(dept.id)}
                    title={`Remove ${dept.name}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/40 max-md:overflow-visible md:overflow-y-auto overscroll-y-contain touch-pan-y [-webkit-overflow-scrolling:touch] p-4 max-md:pb-28 sm:p-6 md:p-8 select-none">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-6">
        {/* Top Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-[28px] border border-slate-200/80 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-[#0284c7] border border-sky-200">
                Workspace Settings
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
              Settings &amp; Main Outlines Configuration
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your profile, timezone, and departments organized under Work, Improvement, and Buy.
            </p>
          </div>

          <button
            onClick={() => onChangeView('daily')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
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
              className="bg-white p-5 sm:p-6 rounded-[28px] border border-slate-200/80 shadow-2xs flex flex-col gap-4"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0ea5e9] flex items-center justify-center">
                  <User className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h2 className="text-sm font-extrabold text-slate-900">Profile &amp; Timezone</h2>
              </div>

              {/* Avatar Picker */}
              <div className="flex items-center gap-4">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#38bdf8]/40 shrink-0"
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
                            ? 'border-[#38bdf8] scale-110 shadow-xs'
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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm sm:text-xs border border-slate-200 rounded-2xl bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/25 focus:border-[#38bdf8] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Role / Position
                  </label>
                  <input
                    type="text"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm sm:text-xs border border-slate-200 rounded-2xl bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/25 focus:border-[#38bdf8] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm sm:text-xs border border-slate-200 rounded-2xl bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/25 focus:border-[#38bdf8] transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-[#0ea5e9]" />
                    <span>Schedule Timezone</span>
                  </label>
                  <select
                    value={timezoneInput}
                    onChange={(e) => setTimezoneInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm sm:text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/25 focus:border-[#38bdf8] bg-slate-50/60 focus:bg-white font-medium transition-all"
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
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#38bdf8] hover:bg-[#0ea5e9] text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>

            {/* 2. Display & Data Management Card */}
            <div className="bg-white p-5 sm:p-6 rounded-[28px] border border-slate-200/80 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0ea5e9] flex items-center justify-center">
                  <Layout className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h2 className="text-sm font-extrabold text-slate-900">Display &amp; Data Backup</h2>
              </div>

              <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-800">Left Calendar &amp; Filter Panel</p>
                  <p className="text-[11px] text-slate-500">
                    Show or hide the mini calendar and Work / Improvement filter sidebar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onToggleSidebar}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    isSidebarOpen
                      ? 'bg-sky-50 text-[#0284c7] border border-sky-200'
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
                    Total {events.length} tasks stored in workspace.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={onResetData}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Demo Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Three Main Outlines & Department Management (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white p-5 sm:p-6 rounded-[28px] border border-slate-200/80 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0ea5e9] flex items-center justify-center">
                    <Building2 className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <h2 className="text-sm font-extrabold text-slate-900">Main Outlines &amp; Departments</h2>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-[#0284c7]">
                  {departments.length} Depts
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Departments are grouped into three main outlines: <strong>Work</strong> (Daily Operations), <strong>Improvement</strong> (Continuous Innovation), and <strong>Buy</strong> (Procurement & Purchasing).
              </p>

              {/* Add New Department Form */}
              <form onSubmit={handleCreateDepartment} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-800">
                  + Add New Department
                </label>

                {/* Select Outline: Work vs Improvement vs Buy */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-white rounded-full border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setNewDeptOutline('Work')}
                    className={`py-1.5 px-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      newDeptOutline === 'Work'
                        ? 'bg-[#38bdf8] text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Work</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDeptOutline('Improvement')}
                    className={`py-1.5 px-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      newDeptOutline === 'Improvement'
                        ? 'bg-[#38bdf8] text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Improvement</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDeptOutline('Buy')}
                    className={`py-1.5 px-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      newDeptOutline === 'Buy'
                        ? 'bg-[#38bdf8] text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Buy</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="e.g. Legal, Customer Success, QA..."
                  className="w-full px-3.5 py-2.5 text-sm sm:text-xs bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/25 focus:border-[#38bdf8] transition-all"
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
                    className="flex items-center gap-1 px-4 py-2 rounded-full bg-[#38bdf8] hover:bg-[#0ea5e9] text-white text-xs font-bold shadow-sm shadow-sky-500/20 transition-all cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add</span>
                  </button>
                </div>
              </form>

              {/* Three Main Outlines List */}
              <div className="flex flex-col gap-4 max-h-[340px] overflow-y-auto pr-1">
                {renderDeptGroup(
                  'Work',
                  'Routine & Daily Operations',
                  <Briefcase className="w-3.5 h-3.5 text-[#0ea5e9]" />,
                  workDepts
                )}

                <div className="border-t border-slate-100 pt-3">
                  {renderDeptGroup(
                    'Improvement',
                    'Continuous Upgrade & Innovation',
                    <TrendingUp className="w-3.5 h-3.5 text-violet-600" />,
                    improvementDepts
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3">
                  {renderDeptGroup(
                    'Buy',
                    'Procurement & Purchasing',
                    <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />,
                    buyDepts
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
