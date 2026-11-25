import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Layers, 
  Sparkles,
} from 'lucide-react';
import { TaskEvent, DepartmentItem } from '../types';

interface DatabaseViewProps {
  events: TaskEvent[];
  departments: DepartmentItem[];
  onOpenCreateModal?: () => void;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({
  events,
  departments,
  onOpenCreateModal,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'departments'>('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [outlineFilter, setOutlineFilter] = useState<'all' | 'Work' | 'Improvement' | 'Buy'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredTasks = events.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      t.title.toLowerCase().includes(q) || 
      t.id.toLowerCase().includes(q) ||
      (t.department || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q);

    const matchesOutline = outlineFilter === 'all' || t.outline === outlineFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'completed' ? t.status === 'completed' : t.status !== 'completed');

    return matchesSearch && matchesOutline && matchesStatus;
  });

  const pendingCount = events.filter(e => e.status !== 'completed').length;
  const completedCount = events.filter(e => e.status === 'completed').length;

  return (
    <div className="flex-1 flex flex-col min-w-0 md:min-h-0 bg-slate-50/60 max-md:overflow-visible md:overflow-y-auto overscroll-y-contain touch-pan-y [-webkit-overflow-scrolling:touch] max-md:pb-28 select-none">
      {/* Top Header */}
      <div className="px-4 sm:px-6 py-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Firebase Firestore Database
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 stroke-[2.5]" />
                <span>Firestore Live Real-Time</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Seluruh tugas dan departemen tersimpan permanen di Cloud Firestore (workspaces/primary) secara real-time.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenCreateModal && (
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f6c445] hover:bg-[#eab32f] text-slate-900 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span>+ Tambah Tugas ke Firestore</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto flex flex-col gap-5">
        
        {/* Info & Status Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Dokumen Tasks</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{events.length} Dokumen</h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Layers className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Task</p>
              <h3 className="text-xl font-bold text-amber-600 mt-0.5">{pendingCount} Dokumen</h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Complete Task</p>
              <h3 className="text-xl font-bold text-emerald-600 mt-0.5">{completedCount} Dokumen</h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Departments</p>
              <h3 className="text-xl font-bold text-[#0ea5e9] mt-0.5">{departments.length} Kategori</h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center text-[#0ea5e9]">
              <Building2 className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>

        {/* Tab & Controls Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tasks'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Collection &quot;tasks&quot; ({events.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('departments')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'departments'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Collection &quot;departments&quot; ({departments.length})</span>
            </button>
          </div>

          {activeTab === 'tasks' && (
            <div className="flex items-center gap-2 flex-wrap flex-1 justify-end min-w-0">
              <div className="relative min-w-[180px] sm:min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari ID, judul, dept, deskripsi..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
                />
              </div>

              <select
                value={outlineFilter}
                onChange={(e) => setOutlineFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="all">Semua Outline</option>
                <option value="Work">Work</option>
                <option value="Improvement">Improvement</option>
                <option value="Buy">Buy</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Firestore Tasks Collection */}
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
            <div className="px-4 py-3 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-bold text-emerald-950">
                  Firestore Collection: <code>tasks</code>
                </span>
                <span className="text-[11px] text-emerald-700">
                  (Real-time synced fields: ID, Title, Outline, Department, Description, Date, Due Date, Status)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800">
                {filteredTasks.length} dokumen ditampilkan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3 w-10 text-center text-slate-400">#</th>
                    <th className="py-2.5 px-3.5 font-mono">Task ID</th>
                    <th className="py-2.5 px-3.5">Task Title</th>
                    <th className="py-2.5 px-3.5">Outline</th>
                    <th className="py-2.5 px-3.5">Department</th>
                    <th className="py-2.5 px-3.5">Description</th>
                    <th className="py-2.5 px-3.5">Date</th>
                    <th className="py-2.5 px-3.5">Due Date</th>
                    <th className="py-2.5 px-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500 text-xs">
                        <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                            <Database className="w-5 h-5" />
                          </div>
                          <p className="font-bold text-slate-800 text-sm">Belum Ada Dokumen Tugas di Firestore</p>
                          <p className="text-slate-500 text-xs text-center">
                            Tambahkan tugas baru untuk langsung menyimpannya ke Firebase Firestore.
                          </p>
                          {onOpenCreateModal && (
                            <button
                              type="button"
                              onClick={onOpenCreateModal}
                              className="mt-2 px-4 py-2 rounded-xl bg-[#00796b] hover:bg-[#00695c] text-white font-bold text-xs cursor-pointer shadow-xs active:scale-95"
                            >
                              + Tambah Tugas
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((t, idx) => (
                      <tr 
                        key={t.id || idx}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-[11px] font-bold text-slate-800 whitespace-nowrap">
                          {t.id}
                        </td>
                        <td className="py-2.5 px-3.5 font-bold text-slate-900 min-w-[160px]">
                          {t.title}
                        </td>
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            t.outline === 'Improvement' 
                              ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                              : t.outline === 'Buy'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {t.outline || 'Work'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-700 font-medium whitespace-nowrap">
                          {t.department || t.subtitle || 'Operations'}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-500 max-w-[220px] truncate" title={t.description || ''}>
                          {t.description || '-'}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-slate-600 whitespace-nowrap text-[11px]">
                          {t.date || '-'}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-slate-600 whitespace-nowrap text-[11px]">
                          {t.dueDate || '-'}
                        </td>
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            t.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'completed' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                            {t.status || 'pending'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Firestore Departments Collection */}
        {activeTab === 'departments' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8]"></span>
                <span className="text-xs font-bold text-slate-900">
                  Firestore Collection: <code>departments</code>
                </span>
                <span className="text-[11px] text-slate-500">
                  (Fields: Dept ID, Dept Name, Outline Default, Color Theme, Dot Color)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700">
                {departments.length} dokumen
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3 w-10 text-center text-slate-400">#</th>
                    <th className="py-2.5 px-3.5 font-mono">Dept ID</th>
                    <th className="py-2.5 px-3.5">Dept Name</th>
                    <th className="py-2.5 px-3.5">Outline Default</th>
                    <th className="py-2.5 px-3.5">Color Theme</th>
                    <th className="py-2.5 px-3.5">Dot Color</th>
                    <th className="py-2.5 px-3.5 text-right">Tugas Terkait</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                        <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                          <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center text-[#0ea5e9]">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <p className="font-bold text-slate-800 text-sm">Belum Ada Dokumen Departemen di Firestore</p>
                          <p className="text-slate-500 text-xs text-center">
                            Tambahkan departemen baru melalui halaman Settings.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    departments.map((dept, idx) => {
                      const taskCount = events.filter(
                        e => (e.department || e.subtitle || '').toLowerCase() === dept.name.toLowerCase()
                      ).length;

                      return (
                        <tr key={dept.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3.5 font-mono text-[11px] font-bold text-slate-800">
                            {dept.id}
                          </td>
                          <td className="py-2.5 px-3.5 font-bold text-slate-900 flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dept.dotColor}`} />
                            <span>{dept.name}</span>
                          </td>
                          <td className="py-2.5 px-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              dept.outline === 'Improvement' 
                                ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                                : dept.outline === 'Buy'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {dept.outline}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 font-mono text-slate-600 text-[11px]">
                            {dept.colorTheme}
                          </td>
                          <td className="py-2.5 px-3.5 font-mono text-slate-600 text-[11px]">
                            {dept.dotColor}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-700">
                            {taskCount} task
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
