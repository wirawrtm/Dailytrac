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
  Layers
} from 'lucide-react';
import { TaskEvent, DepartmentItem } from '../types';
import { DEFAULT_DEPARTMENTS, getEventOutline } from '../data/initialData';
import { getTaskCapsuleClass } from '../utils/themeStyles';

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

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const evDept = (e.department || e.subtitle || 'Engineering').toLowerCase();
      if (selectedDepartments.length > 0) {
        return selectedDepartments.some((d) => d.toLowerCase() === evDept);
      }
      return true;
    });
  }, [events, selectedDepartments]);

  const columns: { status: 'pending' | 'completed'; title: string; badge: string }[] = [
    { status: 'pending', title: 'Pending Task', badge: 'bg-amber-100 text-amber-800' },
    { status: 'completed', title: 'Complete', badge: 'bg-emerald-100 text-emerald-800' },
  ];

  const renderTaskCard = (event: TaskEvent, _index: number, colStatus: 'pending' | 'completed') => {
    const capsuleBg = getTaskCapsuleClass(event, departments);
    const titleText = (event.title && event.title.trim()) || 
                      (event as any).task || 
                      (event as any).name || 
                      (event.description && event.description.trim()) || 
                      'Tugas Tanpa Judul';
    const isCompleted = colStatus === 'completed' || event.status === 'completed';

    return (
      <div key={event.id} className="relative flex items-start gap-3 sm:gap-4 group/item w-full min-w-0">
        {/* Timeline node circle */}
        <div className="relative flex flex-col items-center justify-center shrink-0 z-10 mt-3">
          <span className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-[#38bdf8] ring-4 ring-sky-50'}`} />
        </div>

        {/* Capsule Task Card matching WeeklyScheduleView */}
        <div
          onClick={() => onSelectEvent(event)}
          className={`flex-1 py-3.5 px-4 rounded-3xl shadow-md cursor-pointer transition-all hover:scale-[1.01] flex items-start sm:items-center justify-between gap-3 ${capsuleBg}`}
        >
          <div className="min-w-0 flex-1">
            <h4 className="text-sm sm:text-base font-bold text-white break-words whitespace-normal leading-snug tracking-tight">
              {titleText}
            </h4>
            {(event.dueDate || event.date) && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10.5px] font-mono text-white/80">
                  {event.dueDate || event.date}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateEventStatus(event.id, isCompleted ? 'pending' : 'completed');
              }}
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                isCompleted ? 'bg-white text-emerald-700 shadow-xs' : 'bg-white/30 hover:bg-white/50 text-white'
              }`}
              title={isCompleted ? "Tandai Pending" : "Tandai Selesai"}
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </button>

            {onDeleteEvent && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteEvent(event.id);
                }}
                title="Hapus Tugas"
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-black/10 transition-colors cursor-pointer opacity-100 md:opacity-0 md:group-hover/item:opacity-100"
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
    <div className="flex-1 flex flex-col w-full max-w-full min-w-0 md:min-h-0 md:h-full bg-white max-md:overflow-visible md:overflow-hidden select-none">
      
      {/* Top Weekly-style Header Bar */}
      <div className="px-3.5 sm:px-6 py-2.5 bg-slate-50/90 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider pr-3 border-r border-slate-200 shrink-0">
            <Layers className="w-4 h-4 text-[#0ea5e9]" />
            <span>TASKS BOARD:</span>
          </div>

          {/* Department Filter Dropdown */}
          <div className="relative shrink-0" ref={deptDropdownRef}>
            <button
              type="button"
              onClick={() => setIsDeptDropdownOpen((prev) => !prev)}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 sm:gap-2 border ${
                selectedDepartments.length > 0
                  ? 'bg-[#38bdf8] text-white border-[#38bdf8] shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200/80'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{selectedDepartments.length === 0 ? 'Semua Departemen' : `${selectedDepartments.length} Dept`}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDeptDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDeptDropdownOpen && (
              <div className="absolute left-0 mt-2 z-50 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 w-[290px] sm:w-[340px] max-w-[calc(100vw-32px)] animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-3 text-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Filter Departemen</span>
                  <button
                    type="button"
                    onClick={() => setSelectedDepartments([])}
                    className="text-xs font-bold text-[#0ea5e9] hover:text-[#0284c7] cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                  {departments.map((dept) => {
                    const isSelected = selectedDepartments.some(
                      (d) => d.toLowerCase() === dept.name.toLowerCase()
                    );
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => toggleDepartment(dept.name)}
                        className={`flex items-center justify-between px-3 py-2 rounded-2xl text-xs text-left cursor-pointer transition-colors ${
                          isSelected ? 'bg-sky-50 font-bold text-[#0284c7]' : 'hover:bg-slate-50 font-medium text-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${dept.dotColor}`} />
                          <span>{dept.name}</span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#0ea5e9] stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsDeptDropdownOpen(false)}
                    className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
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
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 bg-[#38bdf8] hover:bg-[#0ea5e9] text-white rounded-full font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden xs:inline">Buat Tugas Baru</span>
          <span className="xs:hidden">Buat Tugas</span>
        </button>
      </div>

      {/* Main Board Columns Area */}
      <div className="max-md:flex-none md:flex-1 md:min-h-0 p-3.5 pb-28 sm:p-6 md:p-8 md:overflow-y-auto md:overflow-x-hidden max-md:overflow-visible overscroll-y-contain touch-pan-y [-webkit-overflow-scrolling:touch]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-6xl mx-auto w-full items-start">
          {columns.map((col) => {
            const isExpanded = expandedColumns[col.status];
            const colEvents = filteredEvents.filter((e) =>
              col.status === 'completed' ? e.status === 'completed' : e.status !== 'completed'
            );

            return (
              <div 
                key={col.status}
                className="flex flex-col bg-slate-50/70 p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs transition-all duration-200 w-full min-w-0"
              >
                {/* Column Header */}
                <div 
                  onClick={() => toggleColumn(col.status)}
                  className={`flex items-center justify-between pb-3 px-1 border-b border-slate-200 cursor-pointer select-none group/colheader ${
                    isExpanded ? 'mb-4' : 'mb-0'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      {col.title}
                    </h3>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${col.badge}`}>
                      {colEvents.length}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleColumn(col.status);
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-200/60 transition-all cursor-pointer flex items-center justify-center"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Cards List with Vertical Dashed Timeline Track */}
                {isExpanded ? (
                  <div className="relative flex flex-col gap-3.5 pt-2">
                    {colEvents.length > 0 && (
                      <div className="absolute left-[5.5px] top-4 bottom-6 w-0.5 border-l-2 border-dashed border-sky-200 pointer-events-none z-0" />
                    )}

                    {colEvents.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-3xl border border-dashed border-slate-200">
                        Tidak ada tugas di {col.title}
                      </div>
                    ) : (
                      colEvents.map((event, idx) => renderTaskCard(event, idx, col.status))
                    )}
                  </div>
                ) : (
                  <div 
                    onClick={() => toggleColumn(col.status)}
                    className="py-6 px-4 text-center cursor-pointer hover:bg-white/80 rounded-2xl transition-colors select-none"
                  >
                    <p className="text-xs font-semibold text-slate-500">
                      {colEvents.length} {colEvents.length === 1 ? 'tugas' : 'tugas'}
                    </p>
                    <span className="text-[11px] text-[#0284c7] font-bold mt-1 inline-flex items-center gap-1">
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
