import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar as CalendarIcon, 
  Check, 
  ArrowRight,
  Filter,
  ChevronDown,
  ChevronUp,
  Building2,
  Trash2
} from 'lucide-react';
import { TaskEvent, DepartmentItem } from '../types';
import { DEFAULT_DEPARTMENTS, getEventOutline } from '../data/initialData';
import { COLOR_THEMES } from '../utils/themeStyles';

interface TaskBoardViewProps {
  events: TaskEvent[];
  departments?: DepartmentItem[];
  onOpenCreateModal: () => void;
  onSelectEvent: (event: TaskEvent) => void;
  onUpdateEventStatus: (eventId: string, newStatus: TaskEvent['status']) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export const TaskBoardView: React.FC<TaskBoardViewProps> = ({
  events,
  departments = DEFAULT_DEPARTMENTS,
  onOpenCreateModal,
  onSelectEvent,
  onUpdateEventStatus,
  onDeleteEvent,
}) => {
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [outlineFilter, setOutlineFilter] = useState<'all' | 'Work' | 'Improvement'>('all');
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState<boolean>(false);
  const deptDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target as Node)) {
        setIsDeptDropdownOpen(false);
      }
    };
    if (isDeptDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDeptDropdownOpen]);

  const [expandedColumns, setExpandedColumns] = useState<Record<'pending' | 'completed', boolean>>({
    pending: true,
    completed: true,
  });

  const toggleColumn = (status: 'pending' | 'completed') => {
    setExpandedColumns((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  const toggleDepartment = (deptName: string) => {
    setSelectedDepartments((prev) => {
      const isSelected = prev.some((d) => d.toLowerCase() === deptName.toLowerCase());
      if (isSelected) {
        return prev.filter((d) => d.toLowerCase() !== deptName.toLowerCase());
      } else {
        return [...prev, deptName];
      }
    });
    setOutlineFilter('all');
  };

  const handleSelectAll = () => {
    setSelectedDepartments([]);
    setOutlineFilter('all');
  };

  const handleSelectOutline = (outline: 'Work' | 'Improvement') => {
    if (outlineFilter === outline && selectedDepartments.length > 0) {
      setSelectedDepartments([]);
      setOutlineFilter('all');
      return;
    }
    setOutlineFilter(outline);
    const targetDepts = departments
      .filter((d) => d.outline === outline)
      .map((d) => d.name);
    setSelectedDepartments(targetDepts);
  };

  const filteredEvents = events.filter((e) => {
    const evDept = (e.department || e.subtitle || 'Engineering').toLowerCase();
    
    // Multiple picklist department filter
    if (selectedDepartments.length > 0) {
      return selectedDepartments.some((d) => d.toLowerCase() === evDept);
    }
    
    // Outline filter fallback
    if (outlineFilter === 'Work' || outlineFilter === 'Improvement') {
      return getEventOutline(e, departments) === outlineFilter;
    }
    
    return true;
  });

  const columns: { status: 'pending' | 'completed'; title: string; badge: string; color: string }[] = [
    { status: 'pending', title: 'Pending Task', badge: 'bg-amber-100 text-amber-800', color: 'border-amber-200' },
    { status: 'completed', title: 'Complete', badge: 'bg-emerald-100 text-emerald-800', color: 'border-emerald-200' },
  ];

  const renderTaskCard = (event: TaskEvent, colStatus: 'pending' | 'completed') => {
    const isImprovement = getEventOutline(event, departments) === 'Improvement';
    const completedSubtasks = event.subtasks?.filter((s) => s.completed).length || 0;
    const totalSubtasks = event.subtasks?.length || 0;

    return (
      <div
        key={event.id}
        onClick={() => onSelectEvent(event)}
        className={`p-3.5 sm:p-4 rounded-2xl border ${
          isImprovement
            ? 'border-violet-300 bg-violet-50/95 hover:bg-violet-100/85'
            : 'border-amber-300 bg-amber-50/95 hover:bg-amber-100/85'
        } hover:shadow-md transition-all cursor-pointer flex flex-col gap-2.5 group relative w-full min-w-0 overflow-hidden`}
      >
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center flex-wrap gap-1.5 mb-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                  isImprovement
                    ? 'bg-violet-200/90 text-violet-900'
                    : 'bg-amber-200/90 text-amber-900'
                }`}
              >
                {isImprovement ? 'Improvement' : 'Work'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 text-slate-700 border border-black/5 truncate max-w-full">
                {event.department || event.subtitle || 'Task'}
              </span>
              {event.dueDate && (
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 shrink-0">
                  Due: {event.dueDate}
                </span>
              )}
            </div>
            <h4 className={`text-xs md:text-sm font-bold break-words ${isImprovement ? 'text-violet-950' : 'text-slate-900'}`}>
              <span>{event.title}</span>
              {event.status === 'completed' && (
                <span className="inline-flex items-center ml-1.5 align-middle text-emerald-600 shrink-0" title="Tugas Selesai (Completed)">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              )}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-1 font-mono">
              <span>Date: {event.date}</span>
            </div>
          </div>
        </div>

        {event.description && (
          <p className="text-xs text-slate-600 line-clamp-2 break-words">
            {event.description}
          </p>
        )}

        {totalSubtasks > 0 && (
          <div className="text-[11px] text-slate-500 font-medium">
            Subtasks: {completedSubtasks}/{totalSubtasks}
          </div>
        )}

        {/* Footer with delete and quick status buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-black/5 mt-1 gap-2 min-w-0">
          {/* Direct Delete button */}
          {onDeleteEvent && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteEvent(event.id);
              }}
              title="Hapus Tugas"
              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick status toggle button */}
          <div className="flex items-center gap-1.5 ml-auto flex-wrap justify-end" onClick={(e) => e.stopPropagation()}>
            {colStatus !== 'completed' ? (
              <button
                onClick={() => onUpdateEventStatus(event.id, 'completed')}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200 shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Complete</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Complete</span>
                </span>
                <button
                  onClick={() => onUpdateEventStatus(event.id, 'pending')}
                  className="px-2 py-0.5 rounded-md bg-white/80 hover:bg-white text-[10px] font-semibold text-slate-600 border border-slate-200/80 transition-colors cursor-pointer"
                >
                  Move to Pending
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-full min-w-0 min-h-0 bg-slate-50/50 overflow-y-auto overflow-x-hidden md:overflow-hidden select-none touch-pan-y">
      {/* Top Header */}
      <div className="px-3.5 sm:px-6 py-3 sm:py-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 shrink-0 w-full max-w-full min-w-0">
        <div className="min-w-0 w-full sm:w-auto">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight break-words">Daily Task Tracker</h2>
          <p className="text-xs text-slate-500 mt-0.5 break-words">
            Track Pending Tasks and Completed Tasks across Work & Improvement outlines.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto min-w-0">
          {/* Outline & Multiple Picklist Department Filter with Dropdown */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100/90 rounded-xl text-[11px] font-medium relative w-full sm:w-auto min-w-0">
            <button
              onClick={handleSelectAll}
              className={`px-2 sm:px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedDepartments.length === 0 && outlineFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => handleSelectOutline('Work')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                outlineFilter === 'Work'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Work
            </button>
            <button
              onClick={() => handleSelectOutline('Improvement')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                outlineFilter === 'Improvement'
                  ? 'bg-white text-[#00796b] shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Improvement
            </button>
            
            <div className="hidden sm:block w-px h-3.5 bg-slate-300 mx-0.5 shrink-0" />
            
            {/* Department Dropdown Button */}
            <div className="static sm:relative" ref={deptDropdownRef}>
              <button
                type="button"
                onClick={() => setIsDeptDropdownOpen((prev) => !prev)}
                className={`px-2 sm:px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 text-[11px] ${
                  selectedDepartments.length > 0
                    ? 'bg-white text-emerald-950 font-bold shadow-2xs ring-1 ring-emerald-300'
                    : isDeptDropdownOpen
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
                }`}
                title="Pilih Departemen (Dropdown)"
              >
                {selectedDepartments.length === 0 ? (
                  <>
                    <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Pilih Departemen</span>
                    <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-150 ${isDeptDropdownOpen ? 'rotate-180' : ''}`} />
                  </>
                ) : selectedDepartments.length === 1 ? (
                  <>
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        departments.find(
                          (d) => d.name.toLowerCase() === selectedDepartments[0].toLowerCase()
                        )?.dotColor || 'bg-emerald-500'
                      }`}
                    />
                    <span className="max-w-[110px] truncate">{selectedDepartments[0]}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9.5px] font-bold">
                      1
                    </span>
                    <ChevronDown className={`w-3 h-3 text-slate-500 shrink-0 transition-transform duration-150 ${isDeptDropdownOpen ? 'rotate-180' : ''}`} />
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    <span>{selectedDepartments.length} Departemen</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[9.5px] font-bold">
                      {selectedDepartments.length}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-slate-500 shrink-0 transition-transform duration-150 ${isDeptDropdownOpen ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

              {/* Dropdown Menu Popup */}
              {isDeptDropdownOpen && (
                <div className="absolute left-0 right-0 sm:left-auto sm:right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3 w-full sm:w-[320px] max-w-full animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-2.5">
                  {/* Dropdown Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="text-xs font-bold text-slate-900">Filter Departemen</span>
                      {selectedDepartments.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          {selectedDepartments.length} terpilih
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDepartments(departments.map((d) => d.name));
                          setOutlineFilter('all');
                        }}
                        className="text-[10.5px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                      >
                        Pilih Semua
                      </button>
                      {selectedDepartments.length > 0 && (
                        <>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDepartments([]);
                              setOutlineFilter('all');
                            }}
                            className="text-[10.5px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                          >
                            Reset
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Group 1: Work Outline */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800/80 px-1">
                      1. Work (Daily & Operations)
                    </span>
                    <div className="flex flex-col gap-0.5">
                      {departments.filter((d) => d.outline === 'Work').map((dept) => {
                        const isSelected = selectedDepartments.some(
                          (d) => d.toLowerCase() === dept.name.toLowerCase()
                        );
                        const count = events.filter(
                          (e) => (e.department || e.subtitle || '').toLowerCase() === dept.name.toLowerCase()
                        ).length;

                        return (
                          <button
                            key={dept.id}
                            type="button"
                            onClick={() => toggleDepartment(dept.name)}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 text-emerald-950 font-bold'
                                : 'hover:bg-slate-50 text-slate-700 font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className={`w-2 h-2 rounded-full shrink-0 ${dept.dotColor}`} />
                              <span className="text-xs truncate">{dept.name}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                              {count} task
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Group 2: Improvement Outline */}
                  <div className="flex flex-col gap-1 pt-1.5 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-800/80 px-1">
                      2. Improvement (Innovation & Upgrade)
                    </span>
                    <div className="flex flex-col gap-0.5">
                      {departments.filter((d) => d.outline === 'Improvement').map((dept) => {
                        const isSelected = selectedDepartments.some(
                          (d) => d.toLowerCase() === dept.name.toLowerCase()
                        );
                        const count = events.filter(
                          (e) => (e.department || e.subtitle || '').toLowerCase() === dept.name.toLowerCase()
                        ).length;

                        return (
                          <button
                            key={dept.id}
                            type="button"
                            onClick={() => toggleDepartment(dept.name)}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 text-emerald-950 font-bold'
                                : 'hover:bg-slate-50 text-slate-700 font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className={`w-2 h-2 rounded-full shrink-0 ${dept.dotColor}`} />
                              <span className="text-xs truncate">{dept.name}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                              {count} task
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dropdown Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {selectedDepartments.length === 0 ? 'Semua ditampilkan' : `${selectedDepartments.length} dipilih`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsDeptDropdownOpen(false)}
                      className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-[#f6c445] hover:bg-[#eab32f] text-slate-900 rounded-full font-bold text-xs md:text-sm shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* 2 Columns: Pending Task & Complete */}
      <div className="flex-1 p-3.5 sm:p-6 md:p-8 w-full max-w-full min-w-0 overflow-x-hidden md:overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-6xl mx-auto md:h-full items-start w-full min-w-0">
          {columns.map((col) => {
            const isExpanded = expandedColumns[col.status];
            const colEvents = filteredEvents.filter((e) =>
              col.status === 'completed' ? e.status === 'completed' : e.status !== 'completed'
            );

            return (
              <div 
                key={col.status}
                className="bg-white rounded-3xl border border-slate-200/80 p-3.5 sm:p-5 flex flex-col md:max-h-[calc(100vh-210px)] shadow-xs transition-all duration-200 w-full min-w-0 overflow-hidden"
              >
                {/* Column Header */}
                <div 
                  onClick={() => toggleColumn(col.status)}
                  className={`flex items-center justify-between pb-3 border-b border-slate-100 cursor-pointer select-none group/colheader min-w-0 ${
                    isExpanded ? 'mb-3' : 'mb-0'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleColumn(col.status);
                      }}
                      title={isExpanded ? `Collapse ${col.title}` : `Expand ${col.title}`}
                      className="p-1 rounded-xl text-slate-400 group-hover/colheader:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 transition-transform group-hover/colheader:-translate-y-0.5" />
                      ) : (
                        <ChevronDown className="w-4 h-4 transition-transform group-hover/colheader:translate-y-0.5" />
                      )}
                    </button>
                    <h3 className="text-sm font-bold text-slate-900 group-hover/colheader:text-[#00796b] transition-colors truncate">
                      {col.title}
                    </h3>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${col.badge}`}>
                      {colEvents.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleColumn(col.status);
                      }}
                      className="text-[11px] font-semibold text-slate-400 group-hover/colheader:text-slate-600 hover:underline px-1.5 py-0.5 rounded-md cursor-pointer hidden sm:inline"
                    >
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCreateModal();
                      }}
                      title="Add task"
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Cards List (Collapsible) */}
                {isExpanded ? (
                  <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-3 pr-0.5 sm:pr-1 animate-in fade-in duration-200 min-w-0">
                    {colEvents.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs">
                        No tasks in {col.title}
                      </div>
                    ) : (
                      colEvents.map((event) => renderTaskCard(event, col.status))
                    )}
                  </div>
                ) : (
                  <div 
                    onClick={() => toggleColumn(col.status)}
                    className="py-6 px-4 text-center cursor-pointer hover:bg-slate-50/80 rounded-2xl transition-colors select-none group/collapsed"
                  >
                    <p className="text-xs font-semibold text-slate-500 group-hover/collapsed:text-slate-700">
                      {colEvents.length} {colEvents.length === 1 ? 'task' : 'tasks'}
                    </p>
                    <span className="text-[11px] text-[#00897b] font-medium mt-1 inline-flex items-center gap-1">
                      <span>Klik untuk membuka</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
