import React from 'react';
import { 
  X, 
  Calendar, 
  Building2, 
  FileText, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit3, 
  Clock
} from 'lucide-react';
import { TaskEvent } from '../types';
import { COLOR_THEMES } from '../utils/themeStyles';

interface EventDetailDrawerProps {
  event: TaskEvent | null;
  onClose: () => void;
  onEdit: (event: TaskEvent) => void;
  onDelete: (eventId: string) => void;
  onToggleStatus: (eventId: string) => void;
  onToggleSubtask?: (eventId: string, subtaskId: string) => void;
}

export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({
  event,
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleSubtask,
}) => {
  if (!event) return null;

  const theme = COLOR_THEMES[event.colorTheme] || COLOR_THEMES.cyan;
  const isCompleted = event.status === 'completed';
  const departmentName = event.department || event.subtitle || 'General';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto overflow-x-hidden touch-pan-y overscroll-contain animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] my-auto overflow-x-hidden min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner with Department Theme */}
        <div className={`p-6 ${theme.bg} border-b ${theme.border} relative shrink-0 overflow-x-hidden`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Department Tag */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText}`}>
              <Building2 className="w-3 h-3" />
              <span>{departmentName}</span>
            </span>
          </div>

          {/* Task Name */}
          <h3 className={`text-xl font-bold ${theme.text} leading-tight flex items-center flex-wrap gap-1.5`}>
            <span>{event.title}</span>
            {event.status === 'completed' && (
              <span className="inline-flex items-center text-emerald-600 shrink-0" title="Tugas Selesai (Completed)">
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              </span>
            )}
          </h3>

          {/* Date & Due Date */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 mt-3 font-mono">
            <span className="flex items-center gap-1.5 font-semibold bg-white/70 px-2 py-0.5 rounded-md">
              <Calendar className="w-3.5 h-3.5 text-[#00897b]" />
              <span>Date: {event.date}</span>
            </span>
            {event.dueDate && (
              <span className="flex items-center gap-1.5 font-semibold bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-md">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Due Date: {event.dueDate}</span>
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto overflow-x-hidden flex-1 flex flex-col gap-4 text-xs text-slate-700 touch-pan-y overscroll-contain min-w-0 w-full box-border">
          {/* Status Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Status Tugas</p>
              <p className="text-sm font-bold capitalize text-slate-900 mt-0.5">
                {event.status === 'completed' ? 'Selesai (Completed)' : 'Belum Selesai (Pending)'}
              </p>
            </div>
            <button
              onClick={() => onToggleStatus(event.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-[#f6c445] text-slate-900 hover:bg-[#eab32f]'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tandai Belum Selesai</span>
                </>
              ) : (
                <>
                  <Circle className="w-3.5 h-3.5" />
                  <span>Tandai Selesai</span>
                </>
              )}
            </button>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Description</span>
            </h4>
            <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {event.description ? (
                <p className="whitespace-pre-wrap">{event.description}</p>
              ) : (
                <p className="text-slate-400 italic">Tidak ada deskripsi untuk tugas ini.</p>
              )}
            </div>
          </div>

          {/* Subtasks Checklist */}
          {event.subtasks && event.subtasks.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Subtasks / Checklist</span>
                </h4>
                <span className="text-[11px] font-semibold text-slate-500 font-mono">
                  {event.subtasks.filter((st) => st.completed).length}/{event.subtasks.length} Selesai
                </span>
              </div>
              <div className="flex flex-col gap-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                {event.subtasks.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => onToggleSubtask?.(event.id, st.id)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white transition-colors text-left group cursor-pointer border border-transparent hover:border-slate-200"
                  >
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      st.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 group-hover:border-slate-400 bg-white'
                    }`}>
                      {st.completed && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className={`text-xs ${st.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                      {st.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            onClick={() => {
              onDelete(event.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Task</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(event)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Task</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
