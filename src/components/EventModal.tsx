import React, { useState, useEffect } from 'react';
import { X, Calendar, Building2, FileText, CheckCircle2, Trash2 } from 'lucide-react';
import { TaskEvent, EventColorTheme, DepartmentItem } from '../types';
import { DEFAULT_DEPARTMENTS } from '../data/initialData';
import { formatDateToISO } from '../utils/dateUtils';

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
  const workDepartments = departments.filter((d) => d.outline === 'Work');
  const improvementDepartments = departments.filter((d) => d.outline === 'Improvement');
  const presetDepartmentNames = departments.map((d) => d.name);

  // The 5 requested fields:
  // 1. department (grouped under Work & Improvement outlines)
  // 2. task
  // 3. description
  // 4. date
  // 5. due date (optional)
  const [department, setDepartment] = useState(
    initialEvent?.department || initialEvent?.subtitle || presetDepartmentNames[0] || 'Operations'
  );
  const [outline, setOutline] = useState<'Work' | 'Improvement'>(() => {
    if (initialEvent?.outline === 'Work' || initialEvent?.outline === 'Improvement') {
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
      
      let defaultOutline: 'Work' | 'Improvement' = 'Work';
      if (initialEvent?.outline === 'Work' || initialEvent?.outline === 'Improvement') {
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
    }
  }, [isOpen, initialEvent, departments]);

  if (!isOpen) return null;

  const handleSelectDept = (dept: DepartmentItem) => {
    setDepartment(dept.name);
    setOutline(dept.outline);
  };

  const handleSwitchOutline = (newOutline: 'Work' | 'Improvement') => {
    setOutline(newOutline);
    const targetList = newOutline === 'Work' ? workDepartments : improvementDepartments;
    const isCurrentInTarget = targetList.some(
      (d) => d.name.toLowerCase() === department.toLowerCase()
    );
    if (!isCurrentInTarget && targetList.length > 0) {
      setDepartment(targetList[0].name);
    }
  };

  const activeDepartments = outline === 'Work' ? workDepartments : improvementDepartments;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;

    const theme = initialEvent?.colorTheme || getDepartmentTheme(department);

    const newEvent: TaskEvent = {
      id: initialEvent?.id || `evt-${Date.now()}`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto overflow-x-hidden touch-pan-y overscroll-contain animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] my-auto overflow-x-hidden min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialEvent?.id ? 'Edit Task' : 'Create New Task'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Schedule tasks under Work or Improvement departments.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - Department, Task, Description, Date, Due Date (optional) */}
        <form 
          onSubmit={handleSubmit} 
          className="flex-1 overflow-y-auto overflow-x-hidden p-5 sm:p-6 flex flex-col gap-4 text-xs text-slate-700 touch-pan-y overscroll-contain min-w-0 w-full box-border"
        >
          
          {/* 1. DEPARTMENT (Filtered by Selected Outline: Work or Improvement) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#00897b]" />
                <span>Department & Outline *</span>
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleSwitchOutline('Work')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    outline === 'Work'
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  1. Work
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchOutline('Improvement')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    outline === 'Improvement'
                      ? 'bg-white text-[#00796b] shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  2. Improvement
                </button>
              </div>
            </label>

            {/* Quick Department Chips showing ONLY the selected Outline */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
                  {outline === 'Work' ? '1. Work (Daily & Operations)' : '2. Improvement (Innovation & Upgrade)'}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {activeDepartments.length} Departments
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeDepartments.map((dept) => {
                  const isSelected = department.toLowerCase() === dept.name.toLowerCase();
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => handleSelectDept(dept)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#00897b] text-white shadow-2xs font-bold'
                          : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : dept.dotColor}`} />
                      <span>{dept.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Operations, Engineering, Product & Design..."
              list="department-suggestions"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00897b]/20 focus:border-[#00897b] transition-all bg-white"
            />
            <datalist id="department-suggestions">
              {activeDepartments.map((d) => (
                <option key={d.id} value={d.name} />
              ))}
            </datalist>
          </div>

          {/* 2. TASK (Title) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#00897b]" />
              <span>Task *</span>
            </label>
            <input
              type="text"
              required
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g. Standup Meeting, UX Audit Sync, Client Presentation..."
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00897b]/20 focus:border-[#00897b] transition-all bg-white"
            />
          </div>

          {/* 3. DESCRIPTION */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              <span>Description</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add detailed task description, agenda, or notes..."
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00897b]/20 focus:border-[#00897b] transition-all bg-white resize-none"
            />
          </div>

          {/* 4 & 5. DATE & DUE DATE (OPTIONAL) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 4. Date */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#00897b]" />
                <span>Date *</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00897b]/20 focus:border-[#00897b] transition-all bg-white"
              />
            </div>

            {/* 5. Due Date (optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>Due Date</span>
                </span>
                <span className="text-[10px] font-normal text-slate-400">Optional</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00897b]/20 focus:border-[#00897b] transition-all bg-white"
                />
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate('')}
                    title="Clear due date"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
            {initialEvent?.id && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialEvent.id!);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Task</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-[#f6c445] hover:bg-[#eab32f] text-slate-900 shadow-xs hover:shadow transition-all duration-150 active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{initialEvent?.id ? 'Save Changes' : 'Create Task'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
