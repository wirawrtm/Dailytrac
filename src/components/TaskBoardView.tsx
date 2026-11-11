import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  Calendar as CalendarIcon, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  Trash2,
  Briefcase,
  Sparkles,
  ShoppingBag,
  Tag
} from 'lucide-react';
import { TaskEvent, DepartmentItem } from '../types';
import { DEFAULT_DEPARTMENTS, getEventOutline } from '../data/initialData';

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
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState<boolean>(false);
  const deptDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target as Node)) {
        setIsDeptDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
  };

  const handleSelectAll = () => {
    setSelectedDepartments([]);
  };

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const evDept = (e.department || e.subtitle || 'Engineering').toLowerCase();
      
      // Multiple picklist department filter
      if (selectedDepartments.length > 0) {
        return selectedDepartments.some((d) => d.toLowerCase() === evDept);
      }
      
      return true;
    });
  }, [events, selectedDepartments]);

  const columns: { status: 'pending' | 'completed'; title: string; badge: string; color: string }[] = [
    { status: 'pending', title: 'Pending Task', badge: 'bg-amber-100 text-amber-800', color: 'border-amber-200' },
    { status: 'completed', title: 'Complete', badge: 'bg-emerald-100 text-emerald-800', color: 'border-emerald-200' },
  ];

  const renderTaskCard = (event: TaskEvent, index: number, colStatus: 'pending' | 'completed') => {
    const evOutline = getEventOutline(event, departments);
    const isImprovement = evOutline === 'Improvement';
    const isBuy = evOutline === 'Buy';
    const titleText = (event.title && event.title.trim()) || 
                      (event as any).task || 
                      (event as any).name || 
                      (event.description && event.description.trim()) || 
                      'Tugas Tanpa Judul';
    const deptName = event.department || event.subtitle || 'General';
    const isCompleted = colStatus === 'completed' || event.status === 'completed';
    const isFirstNode = index === 0;

    return (
      <div key={event.id} className="relative flex items-start gap-3 sm:gap-4 group/item w-full min-w-0">
        {/* Timeline node circle checklist button top aligned with task title */}
        <div className="relative flex flex-col items-center justify-center shrink-0 z-10 mt-1.5 sm:mt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateEventStatus(event.id, isCompleted ? 'pending' : 'completed');
            }}
            title={isCompleted ? "Tandai Belum Selesai (Pending)" : "Tandai Selesai (Complete)"}
            className={`w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isCompleted
                ? 'bg-[#00897b] text-white shadow-xs hover:bg-[#00796b] ring-4 ring-teal-50'
                : 'border-2 border-rose-500 hover:border-rose-600 bg-white hover:bg-rose-50 text-rose-500 shadow-2xs'
            }`}
          >
            <Check className={`w-3.5 h-3.5 ${isCompleted ? 'stroke-[3] text-white' : 'stroke-[2.5] stroke-rose-500 text-rose-500'}`} />
          </button>
        </div>

        {/* Floating White Timeline Card */}
        <div
          onClick={() => onSelectEvent(event)}
          className={`flex-1 bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer p-3.5 sm:p-4 flex items-center justify-between gap-3 sm:gap-4 min-w-0 ${
            isCompleted ? 'bg-slate-50/50 shadow-sm' : 'hover:-translate-y-0.5'
          }`}
        >
          {/* Middle: Title & Description */}
          <div className="flex-1 min-w-0 py-0.5">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug break-words">
              {titleText}
            </h4>

            {event.description && event.description.trim() && (
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 leading-tight">
                {event.description}
              </p>
            )}
          </div>

          {/* Right Side: Date/Time & Delete */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Date / Time */}
            <div className="text-right hidden xs:block">
              <span className="block text-xs font-semibold text-slate-400 font-mono">
                {event.dueDate || event.date}
              </span>
              {event.startTime && (
                <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                  {event.startTime}
                </span>
              )}
            </div>

            {/* Quick direct delete */}
            {onDeleteEvent && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteEvent(event.id);
                }}
                title="Hapus Tugas"
                className="p-1 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer opacity-0 group-hover/item:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-full min-w-0 min-h-0 bg-slate-50/50 overflow-y-auto overflow-x-hidden md:overflow-hidden select-none touch-pan-y">
      {/* Top Header */}
      {/* Top Toolbar */}
      <div className="px-3.5 sm:px-6 py-2.5 sm:py-3.5 bg-white border-b border-slate-100 flex items-center justify-between gap-3 shrink-0 w-full max-w-full min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          {/* Department Dropdown Button */}
          <div className="relative shrink-0" ref={deptDropdownRef}>
              <button
                type="button"
                onClick={() => setIsDeptDropdownOpen((prev) => !prev)}
                className={`px-2 sm:px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 text-[11px] ${
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
                    <span className="max-w-[130px] truncate">{selectedDepartments[0]}</span>
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

              {/* Dropdown Menu Popup - Full width so text is never truncated */}
              {isDeptDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-3.5 w-[310px] sm:w-[340px] max-w-[calc(100vw-24px)] animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-2.5">
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
                          const allDeptNames = [
                            ...departments.map((d) => d.name),
                            ...(departments.some((d) => d.outline === 'Buy') ? [] : ['Procurement'])
                          ];
                          setSelectedDepartments(allDeptNames);
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800/80 px-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>Work (Daily & Operations)</span>
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
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className={`w-2 h-2 rounded-full shrink-0 ${dept.dotColor}`} />
                              <span className="text-xs font-semibold text-slate-800 break-words whitespace-normal text-left">{dept.name}</span>
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-800/80 px-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-violet-400" />
                      <span>Improvement (Innovation & Upgrade)</span>
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
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className={`w-2 h-2 rounded-full shrink-0 ${dept.dotColor}`} />
                              <span className="text-xs font-semibold text-slate-800 break-words whitespace-normal text-left">{dept.name}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                              {count} task
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Group 3: Buy Outline */}
                  <div className="flex flex-col gap-1 pt-1.5 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/80 px-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Buy (Procurement & Purchasing)</span>
                    </span>
                    <div className="flex flex-col gap-0.5">
                      {(departments.filter((d) => d.outline === 'Buy').length > 0
                        ? departments.filter((d) => d.outline === 'Buy')
                        : [{ id: 'Procurement', name: 'Procurement', outline: 'Buy' as const, colorTheme: 'peach' as const, dotColor: 'bg-amber-500' }]
                      ).map((dept) => {
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
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className={`w-2 h-2 rounded-full shrink-0 ${dept.dotColor}`} />
                              <span className="text-xs font-semibold text-slate-800 break-words whitespace-normal text-left">{dept.name}</span>
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
                className="flex flex-col md:max-h-[calc(100vh-170px)] transition-all duration-200 w-full min-w-0"
              >
                {/* Column Header */}
                <div 
                  onClick={() => toggleColumn(col.status)}
                  className={`flex items-center justify-between pb-2.5 px-1 border-b border-slate-200/80 cursor-pointer select-none group/colheader min-w-0 ${
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
                      className="p-1 rounded-xl text-slate-400 group-hover/colheader:text-slate-800 hover:bg-slate-200/50 transition-all cursor-pointer flex items-center justify-center shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 transition-transform group-hover/colheader:-translate-y-0.5" />
                      ) : (
                        <ChevronDown className="w-4 h-4 transition-transform group-hover/colheader:translate-y-0.5" />
                      )}
                    </button>
                    <h3 className="text-base font-bold text-slate-900 group-hover/colheader:text-[#00796b] transition-colors truncate">
                      {col.title}
                    </h3>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${col.badge}`}>
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
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Cards List (Collapsible with timeline line) */}
                {isExpanded ? (
                  <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col gap-3.5 pr-1 animate-in fade-in duration-200 min-w-0 pt-1">
                    {/* Vertical timeline dashed line running down behind the nodes */}
                    {colEvents.length > 0 && (
                      <div className="absolute left-[11px] sm:left-[12px] top-4 bottom-6 w-0.5 border-l-2 border-dashed border-teal-200 pointer-events-none z-0" />
                    )}

                    {colEvents.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs bg-white/60 rounded-3xl border border-dashed border-slate-200">
                        No tasks in {col.title}
                      </div>
                    ) : (
                      colEvents.map((event, idx) => renderTaskCard(event, idx, col.status))
                    )}
                  </div>
                ) : (
                  <div 
                    onClick={() => toggleColumn(col.status)}
                    className="py-6 px-4 text-center cursor-pointer hover:bg-white/60 rounded-2xl transition-colors select-none group/collapsed"
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
