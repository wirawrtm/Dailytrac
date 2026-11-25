import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Building2, FileText, CheckCircle2, Trash2, ChevronDown, Check, Search, Plus } from 'lucide-react';
import { TaskEvent, EventColorTheme, DepartmentItem, WorkOutline } from '../types';
import { DEFAULT_DEPARTMENTS } from '../data/initialData';
import { formatDateToISO } from '../utils/dateUtils';
import { TASK_FIELD_LIMITS } from '../services/firebaseDbService';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: TaskEvent) => void;
  initialEvent?: Partial<TaskEvent>;
  departments?: DepartmentItem[];
  onDelete?: (eventId: string) => void;
}

// Smart color theme mapping per department to keep cards beautifully colored in calendar
export const getDepartmentTheme = (departmentName: string): EventColorTheme => {
  const norm = departmentName.toLowerCase().trim();
  if (norm.includes('eng') || norm.includes('tech') || norm.includes('dev') || norm.includes('it')) {
    return 'cyan';
  }
  if (norm.includes('design') || norm.includes('product') || norm.includes('ux') || norm.includes('ui')) {
    return 'purple';
  }
  if (norm.includes('market') || norm.includes('sales') || norm.includes('growth')) {
    return 'peach';
  }
  if (norm.includes('operat') || norm.includes('manage') || norm.includes('support')) {
    return 'indigo';
  }
  if (norm.includes('finan') || norm.includes('legal') || norm.includes('acc')) {
    return 'emerald';
  }
  if (norm.includes('hr') || norm.includes('people') || norm.includes('talent')) {
    return 'pink';
  }
  return 'cyan';
};

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEvent,
  departments = DEFAULT_DEPARTMENTS,
  onDelete,
}) => {
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [deptSearchQuery, setDeptSearchQuery] = useState('');
  const deptDropdownRef = React.useRef<HTMLDivElement>(null);

  const workDepartments = departments.filter((d) => d.outline === 'Work');
  const improvementDepartments = departments.filter((d) => d.outline === 'Improvement');
  const rawBuyDepartments = departments.filter((d) => d.outline === 'Buy');
  const buyDepartments = rawBuyDepartments.length > 0 ? rawBuyDepartments : [
    { id: 'Procurement', name: 'Procurement', outline: 'Buy' as const, colorTheme: 'peach' as const, dotColor: 'bg-amber-500' }
  ];
  const presetDepartmentNames = departments.map((d) => d.name);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(e.target as Node)) {
        setIsDeptDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // The 5 fields:
  // 1. department (grouped under Work, Improvement & Buy outlines)
  // 2. task
  // 3. description
  // 4. date
  // 5. due date (optional)
  const [department, setDepartment] = useState(
    initialEvent?.department || initialEvent?.subtitle || presetDepartmentNames[0] || 'Operations'
  );
  const [outline, setOutline] = useState<WorkOutline>(() => {
    if (initialEvent?.outline === 'Work' || initialEvent?.outline === 'Improvement' || initialEvent?.outline === 'Buy') {
      return initialEvent.outline;
    }
    const matched = departments.find(
      (d) => d.name.toLowerCase() === (initialEvent?.department || '').toLowerCase()
    );
    return matched ? matched.outline : 'Work';
  });
  const [task, setTask] = useState(initialEvent?.title || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [date, setDate] = useState(initialEvent?.date || formatDateToISO(new Date()));
  const [dueDate, setDueDate] = useState(initialEvent?.dueDate || '');

  // Synchronize fields when modal opens or initialEvent changes
  useEffect(() => {
    if (isOpen) {
      const defaultDept = initialEvent?.department || initialEvent?.subtitle || presetDepartmentNames[0] || 'Operations';
      setDepartment(defaultDept);
      
      let defaultOutline: WorkOutline = 'Work';
      if (initialEvent?.outline === 'Work' || initialEvent?.outline === 'Improvement' || initialEvent?.outline === 'Buy') {
        defaultOutline = initialEvent.outline;
      } else {
        const matched = departments.find(
          (d) => d.name.toLowerCase() === defaultDept.toLowerCase()
        );
        defaultOutline = matched ? matched.outline : 'Work';
      }
      setOutline(defaultOutline);
      setTask(initialEvent?.title || '');
      setDescription(initialEvent?.description || '');
      setDate(initialEvent?.date || formatDateToISO(new Date()));
      setDueDate(initialEvent?.dueDate || '');
      setIsDeptDropdownOpen(false);
      setDeptSearchQuery('');
    }
  }, [isOpen, initialEvent, departments]);

  if (!isOpen) return null;

  const handleSelectDept = (dept: DepartmentItem) => {
    setDepartment(dept.name);
    setOutline(dept.outline);
    setIsDeptDropdownOpen(false);
    setDeptSearchQuery('');
  };

  const handleSwitchOutline = (newOutline: WorkOutline) => {
    setOutline(newOutline);
    const targetList = newOutline === 'Work' 
      ? workDepartments 
      : newOutline === 'Improvement' 
      ? improvementDepartments 
      : buyDepartments;
    const isCurrentInTarget = targetList.some(
      (d) => d.name.toLowerCase() === department.toLowerCase()
    );
    if (!isCurrentInTarget && targetList.length > 0) {
      setDepartment(targetList[0].name);
    }
  };

  const activeDepartments = outline === 'Work' 
    ? workDepartments 
    : outline === 'Improvement' 
    ? improvementDepartments 
    : buyDepartments;

  const filteredDropdownDepts = activeDepartments.filter((d) =>
    d.name.toLowerCase().includes(deptSearchQuery.toLowerCase().trim())
  );

  const selectedDeptObj = departments.find(
    (d) => d.name.toLowerCase() === department.toLowerCase()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;

    const theme = selectedDeptObj?.colorTheme || getDepartmentTheme(department);

    const newEvent: TaskEvent = {
      id: initialEvent?.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: task.trim(),
      outline,
      department: department.trim() || 'Operations',
      subtitle: department.trim() || undefined,
      description: description.trim() || undefined,
      date,
      dueDate: dueDate.trim() || undefined,
      startTime: initialEvent?.startTime || '09:00 AM',
      endTime: initialEvent?.endTime || '10:00 AM',
      startHour: initialEvent?.startHour || 9,
      durationHours: initialEvent?.durationHours || 1,
      category: initialEvent?.category || 'meetings',
      colorTheme: theme,
      attendees: initialEvent?.attendees || [],
      status: initialEvent?.status || 'pending',
      subtasks: initialEvent?.subtasks,
      location: initialEvent?.location,
      meetingLink: initialEvent?.meetingLink,
    };

    onSave(newEvent);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto overflow-x-hidden touch-pan-y overscroll-contain animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-lg bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[88dvh] my-auto min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#0ea5e9] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate">
                {initialEvent?.id ? 'Edit Task' : 'Create New Task'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                Atur tugas berdasarkan outline &amp; departemen
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200/70 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4 stroke-[2.4]" />
          </button>
        </div>

        {/* Form with scrollable body + pinned footer */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-5 sm:px-6 py-4 sm:py-5 space-y-4 text-xs text-slate-700 touch-pan-y overscroll-y-contain [-webkit-overflow-scrolling:touch] min-w-0 w-full box-border">
            {/* 1. DEPARTMENT DROPDOWN (Filtered by Selected Outline: Work, Improvement, Buy) */}
            <div className="relative" ref={deptDropdownRef}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#0ea5e9]" />
                  <span>Department &amp; Outline *</span>
                </label>

                {/* Outline Switcher: Work | Improvement | Buy */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full">
                  {(['Work', 'Improvement', 'Buy'] as const).map((ot) => (
                    <button
                      key={ot}
                      type="button"
                      onClick={() => handleSwitchOutline(ot)}
                      className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold transition-all cursor-pointer ${
                        outline === ot
                          ? ot === 'Work'
                            ? 'bg-white text-amber-800 shadow-2xs font-extrabold ring-1 ring-amber-200'
                            : ot === 'Improvement'
                            ? 'bg-white text-violet-800 shadow-2xs font-extrabold ring-1 ring-violet-200'
                            : 'bg-white text-emerald-800 shadow-2xs font-extrabold ring-1 ring-emerald-200'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {ot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Dropdown Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDeptDropdownOpen((prev) => !prev)}
                  className={`w-full px-3.5 py-2.5 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                    isDeptDropdownOpen
                      ? 'border-[#38bdf8] ring-2 ring-[#38bdf8]/20 bg-white shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-white shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        selectedDeptObj?.dotColor || 'bg-[#38bdf8]'
                      }`}
                    />
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                        {department || 'Pilih Departemen'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          outline === 'Improvement'
                            ? 'bg-violet-100 text-violet-800 border border-violet-200'
                            : outline === 'Buy'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {outline}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                    <span className="text-[10.5px] font-semibold text-slate-400 hidden sm:inline">
                      {activeDepartments.length} opsi
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                        isDeptDropdownOpen ? 'rotate-180 text-[#0ea5e9]' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Dropdown Menu Popover */}
                {isDeptDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-40 animate-in fade-in zoom-in-95 duration-100 max-h-60 flex flex-col overflow-hidden">
                    {/* Search box inside dropdown */}
                    <div className="px-3 pb-2 border-b border-slate-100">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          autoFocus
                          value={deptSearchQuery}
                          onChange={(e) => setDeptSearchQuery(e.target.value)}
                          placeholder="Cari atau ketik departemen..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/25 focus:border-[#38bdf8]"
                        />
                      </div>
                    </div>

                    {/* List of departments under current outline */}
                    <div className="flex-1 overflow-y-auto p-1.5 flex flex-col gap-0.5">
                      {filteredDropdownDepts.length > 0 ? (
                        filteredDropdownDepts.map((d) => {
                          const isSelected = department.toLowerCase() === d.name.toLowerCase();
                          return (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => handleSelectDept(d)}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-sky-50 text-[#0284c7] font-bold'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${d.dotColor}`} />
                                <span className="font-semibold text-slate-800 break-words whitespace-normal text-left">{d.name}</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#0ea5e9] stroke-[3] shrink-0" />}
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-500">
                          <p>Tidak ada departemen &quot;{deptSearchQuery}&quot; di {outline}</p>
                          {deptSearchQuery.trim() && (
                            <button
                              type="button"
                              onClick={() => {
                                setDepartment(deptSearchQuery.trim());
                                setIsDeptDropdownOpen(false);
                                setDeptSearchQuery('');
                              }}
                              className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-sky-50 text-[#0284c7] font-bold text-xs hover:bg-sky-100 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Gunakan &quot;{deptSearchQuery.trim()}&quot;</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer shortcut to switch outline */}
                    <div className="px-3 pt-2 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-medium">Pilihan Outline:</span>
                      <div className="flex items-center gap-1.5">
                        {(['Work', 'Improvement', 'Buy'] as const).map((ot) => (
                          <button
                            key={ot}
                            type="button"
                            onClick={() => handleSwitchOutline(ot)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              outline === ot ? 'bg-[#38bdf8] text-white' : 'hover:text-slate-800'
                            }`}
                          >
                            {ot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. TASK (Title) */}
            <div>
              <label className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#0ea5e9]" />
                <span>Task *</span>
              </label>
              <input
                type="text"
                required
                maxLength={TASK_FIELD_LIMITS.TITLE_MAX}
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="e.g. Standup Meeting, UX Audit Sync, Client Presentation..."
                className="w-full px-3.5 py-2.5 text-sm sm:text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/25 focus:border-[#38bdf8] transition-all bg-slate-50/60 focus:bg-white text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* 3. DESCRIPTION */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                <span>Description</span>
              </label>
              <textarea
                rows={3}
                maxLength={TASK_FIELD_LIMITS.DESCRIPTION_MAX}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add detailed task description, agenda, or notes..."
                className="w-full px-3.5 py-2.5 text-sm sm:text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/25 focus:border-[#38bdf8] transition-all bg-slate-50/60 focus:bg-white text-slate-800 placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* 4 & 5. DATE & DUE DATE (OPTIONAL) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 4. Date */}
              <div>
                <label className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0ea5e9]" />
                  <span>Date *</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm sm:text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/25 focus:border-[#38bdf8] transition-all bg-slate-50/60 focus:bg-white text-slate-800"
                />
              </div>

              {/* 5. Due Date (optional) */}
              <div>
                <label className="text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>Due Date</span>
                  </span>
                  {dueDate ? (
                    <button
                      type="button"
                      onClick={() => setDueDate('')}
                      className="text-[10.5px] font-bold text-[#0ea5e9] hover:text-[#0284c7] cursor-pointer"
                    >
                      Clear
                    </button>
                  ) : (
                    <span className="text-[10px] font-normal text-slate-400">Optional</span>
                  )}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm sm:text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/25 focus:border-[#38bdf8] transition-all bg-slate-50/60 focus:bg-white text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Pinned Modal Footer Buttons */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2 shrink-0">
            {initialEvent?.id && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialEvent.id!);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Task</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-[#38bdf8] hover:bg-[#0ea5e9] text-white shadow-md shadow-sky-500/25 transition-all duration-150 active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{initialEvent?.id ? 'Save Changes' : 'Create Task'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
