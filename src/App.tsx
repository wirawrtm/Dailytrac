import React, { useState, useEffect, useMemo } from 'react';
import { 
  TaskEvent, 
  FilterState, 
  ViewMode, 
  UserProfile,
  DepartmentItem
} from './types';
import { 
  INITIAL_EVENTS, 
  INITIAL_FILTERS, 
  CURRENT_USER,
  DEFAULT_DEPARTMENTS,
  getEventOutline
} from './data/initialData';
import { NavigationRail } from './components/NavigationRail';
import { TopHeader } from './components/TopHeader';
import { Sidebar } from './components/Sidebar';
import { WeeklyScheduleView } from './components/WeeklyScheduleView';
import { DailyScheduleView } from './components/DailyScheduleView';
import { MonthlyScheduleView } from './components/MonthlyScheduleView';
import { TaskBoardView } from './components/TaskBoardView';
import { SettingsView } from './components/SettingsView';
import { AppsScriptHubView } from './components/AppsScriptHubView';
import { EventModal } from './components/EventModal';
import { EventDetailDrawer } from './components/EventDetailDrawer';
import { NotificationModal } from './components/NotificationModal';
import { SettingsModal } from './components/SettingsModal';
import { formatDateToISO } from './utils/dateUtils';

const STORAGE_KEY_EVENTS = 'tasklio_events_v4_sheet';
const STORAGE_KEY_FILTERS = 'tasklio_filters_v3';
const STORAGE_KEY_DEPARTMENTS = 'tasklio_departments_v2';

export default function App() {
  // Initial State & Persistence
  const [events, setEvents] = useState<TaskEvent[]>(() => {
    try {
      localStorage.removeItem('tasklio_events_v3');
      localStorage.removeItem('tasklio_events_v2');
      const stored = localStorage.getItem(STORAGE_KEY_EVENTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [departments, setDepartments] = useState<DepartmentItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DEPARTMENTS);
      return stored ? JSON.parse(stored) : DEFAULT_DEPARTMENTS;
    } catch {
      return DEFAULT_DEPARTMENTS;
    }
  });

  const [filters, setFilters] = useState<FilterState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FILTERS);
      return stored ? JSON.parse(stored) : INITIAL_FILTERS;
    } catch {
      return INITIAL_FILTERS;
    }
  });

  const [user, setUser] = useState<UserProfile>(CURRENT_USER);

  // Selected date initialized to real current date (Today)
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [searchQuery] = useState<string>('');

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modals & Drawers state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Partial<TaskEvent> | undefined>(undefined);
  const [selectedEventDetails, setSelectedEventDetails] = useState<TaskEvent | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Toast banner for actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to save events to localStorage', e);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(filters));
    } catch (e) {
      console.error('Failed to save filters to localStorage', e);
    }
  }, [filters]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DEPARTMENTS, JSON.stringify(departments));
    } catch (e) {
      console.error('Failed to save departments to localStorage', e);
    }
  }, [departments]);

  // Filtered events based on 2 Main Outlines (Work & Improvement), Department checkboxes & search query
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // 1. Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ev.title.toLowerCase().includes(q);
        const matchesDept = ev.department?.toLowerCase().includes(q);
        const matchesSubtitle = ev.subtitle?.toLowerCase().includes(q);
        const matchesDesc = ev.description?.toLowerCase().includes(q);
        const matchesAttendee = ev.attendees?.some((a) => a.name.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDept && !matchesSubtitle && !matchesDesc && !matchesAttendee) {
          return false;
        }
      }

      // 2. Main Outline ('Work' / 'Improvement') & Department Checkbox filter
      const activeKeys = Object.keys(filters).filter((k) => filters[k]);
      if (activeKeys.length > 0) {
        const evOutline = getEventOutline(ev, departments);
        const evDept = (ev.department || ev.subtitle || 'Engineering').toLowerCase();

        const matchesOutline = activeKeys.some(
          (k) => k === evOutline
        );
        const matchesDept = activeKeys.some(
          (k) => k.toLowerCase() === evDept
        );

        if (!matchesOutline && !matchesDept) {
          return false;
        }
      }

      return true;
    });
  }, [events, filters, searchQuery, departments]);

  // Handlers
  const handleToggleFilter = (key: string) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResetFilters = () => {
    const resetState: FilterState = {
      Work: false,
      Improvement: false,
    };
    departments.forEach((d) => {
      resetState[d.name] = false;
    });
    setFilters(resetState);
  };

  const handleAddDepartment = (newDept: DepartmentItem) => {
    setDepartments((prev) => [...prev, newDept]);
  };

  const handleRemoveDepartment = (deptId: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== deptId));
    setFilters((prev) => {
      const next = { ...prev };
      delete next[deptId];
      return next;
    });
  };

  const handleOpenCreateModal = (defaultDate?: string, defaultHour?: number) => {
    const dateStr = defaultDate || formatDateToISO(selectedDate);
    const startH = defaultHour !== undefined ? defaultHour : 10;
    const startFormatted = `${String(startH > 12 ? startH - 12 : startH).padStart(2, '0')}:00 ${startH >= 12 ? 'PM' : 'AM'}`;
    const endH = startH + 1;
    const endFormatted = `${String(endH > 12 ? endH - 12 : endH).padStart(2, '0')}:00 ${endH >= 12 ? 'PM' : 'AM'}`;

    setEventToEdit({
      date: dateStr,
      startTime: startFormatted,
      endTime: endFormatted,
      category: 'meetings',
      colorTheme: 'cyan',
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (savedEvent: TaskEvent) => {
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === savedEvent.id);
      if (exists) {
        return prev.map((e) => (e.id === savedEvent.id ? savedEvent : e));
      }
      return [...prev, savedEvent];
    });

    if (selectedEventDetails?.id === savedEvent.id) {
      setSelectedEventDetails(savedEvent);
    }

    showToast(`Tugas "${savedEvent.title}" berhasil disimpan!`);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    if (selectedEventDetails?.id === eventId) {
      setSelectedEventDetails(null);
    }
    showToast('Tugas berhasil dihapus');
  };

  const handleToggleEventStatus = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const nextStatus: TaskEvent['status'] = e.status === 'completed' ? 'pending' : 'completed';
          const updated: TaskEvent = { ...e, status: nextStatus };
          if (selectedEventDetails?.id === eventId) {
            setSelectedEventDetails(updated);
          }
          return updated;
        }
        return e;
      })
    );
  };

  const handleUpdateEventStatus = (eventId: string, newStatus: TaskEvent['status']) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e))
    );
  };

  const handleToggleSubtask = (eventId: string, subtaskId: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId && e.subtasks) {
          const updatedSubtasks = e.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          const updated = { ...e, subtasks: updatedSubtasks };
          if (selectedEventDetails?.id === eventId) {
            setSelectedEventDetails(updated);
          }
          return updated;
        }
        return e;
      })
    );
  };

  const handleResetData = () => {
    setEvents(INITIAL_EVENTS);
    setFilters(INITIAL_FILTERS);
    setDepartments(DEFAULT_DEPARTMENTS);
    setSelectedDate(new Date());
    localStorage.removeItem(STORAGE_KEY_EVENTS);
    localStorage.removeItem(STORAGE_KEY_FILTERS);
    localStorage.removeItem(STORAGE_KEY_DEPARTMENTS);
    showToast('Data jadwal & filter berhasil direset!');
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    showToast(!isFullscreen ? 'Mode Fullscreen Bagian Dalam Aktif' : 'Frame Luar Dikembalikan');
  };

  return (
    <div className={`min-h-screen h-[100dvh] w-screen font-sans transition-colors duration-200 overflow-hidden flex flex-col-reverse md:flex-row items-stretch select-none ${
      isFullscreen 
        ? 'bg-white p-0 gap-0' 
        : 'bg-[#dce5df] p-2 sm:p-3 md:py-4 md:pr-4 md:pl-0 lg:py-5 lg:pr-5 lg:pl-0 gap-2.5 sm:gap-3 md:gap-3.5'
    }`}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top duration-200 max-w-[90vw] truncate">
          {toastMessage}
        </div>
      )}

      {/* Navigation Rail (Kotak Merah: Hanya bagian kiri yang menempel tepi, sisi kanan rounded seperti sebelumnya) */}
      <NavigationRail
        isFullscreen={isFullscreen}
        currentView={viewMode}
        onSelectView={(v) => setViewMode(v)}
        onOpenSettings={() => setViewMode('settings')}
        onOpenCreateModal={() => handleOpenCreateModal()}
      />

      {/* Content Area: Mempertahankan bentuk rounded card sebelumnya */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-0 bg-white overflow-hidden transition-all duration-200 ${
        isFullscreen
          ? 'h-full rounded-none border-none'
          : 'h-full rounded-[28px] sm:rounded-[36px] md:rounded-[44px] shadow-2xl border border-slate-200/80'
      }`}>
        {/* Top Header (Compact with Sidebar & Fullscreen toggles + Date/View controls) */}
          <TopHeader
            user={user}
            isProfileMenuOpen={isProfileMenuOpen}
            onOpenProfileMenu={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            onResetData={handleResetData}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            viewMode={viewMode}
            onSelectView={setViewMode}
            onOpenCreateModal={() => handleOpenCreateModal()}
          />

          {/* Main Body: Collapsible Sidebar + Schedule View */}
          <div className="flex-1 flex flex-row min-w-0 min-h-0 overflow-hidden h-full relative">
            {/* Mobile Backdrop when Sidebar is open on Phone */}
            {isSidebarOpen && viewMode !== 'settings' && (
              <div
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 z-30 bg-slate-900/35 backdrop-blur-[1px] md:hidden animate-in fade-in duration-150"
              />
            )}

            {/* Collapsible Sidebar (Slide-over Drawer on Phone, Inline Panel on Desktop) */}
            {isSidebarOpen && viewMode !== 'settings' && (
              <Sidebar
                selectedDate={selectedDate}
                onSelectDate={(d) => {
                  setSelectedDate(d);
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                  }
                }}
                filters={filters}
                onToggleFilter={handleToggleFilter}
                onResetFilters={handleResetFilters}
                departments={departments}
                events={events}
                onClose={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Main Central View Switcher */}
            {viewMode === 'weekly' && (
              <WeeklyScheduleView
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                currentView={viewMode}
                onChangeView={setViewMode}
                events={filteredEvents}
                departments={departments}
                timezone={user.timezone}
                isSidebarOpen={isSidebarOpen}
                onOpenCreateModal={handleOpenCreateModal}
                onSelectEvent={(e) => setSelectedEventDetails(e)}
                onToggleEventStatus={handleToggleEventStatus}
              />
            )}

            {viewMode === 'daily' && (
              <DailyScheduleView
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onChangeView={setViewMode}
                events={filteredEvents}
                departments={departments}
                onOpenCreateModal={handleOpenCreateModal}
                onSelectEvent={(e) => setSelectedEventDetails(e)}
                onToggleEventStatus={handleToggleEventStatus}
                onToggleSubtask={handleToggleSubtask}
              />
            )}

            {viewMode === 'monthly' && (
              <MonthlyScheduleView
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onChangeView={setViewMode}
                events={filteredEvents}
                departments={departments}
                onOpenCreateModal={() => handleOpenCreateModal()}
                onSelectEvent={(e) => setSelectedEventDetails(e)}
              />
            )}

            {viewMode === 'tasks' && (
              <TaskBoardView
                events={filteredEvents}
                departments={departments}
                onOpenCreateModal={() => handleOpenCreateModal()}
                onSelectEvent={(e) => setSelectedEventDetails(e)}
                onUpdateEventStatus={handleUpdateEventStatus}
                onDeleteEvent={handleDeleteEvent}
              />
            )}

            {viewMode === 'settings' && (
              <SettingsView
                user={user}
                onUpdateUser={(updated) => setUser({ ...user, ...updated })}
                departments={departments}
                onAddDepartment={handleAddDepartment}
                onRemoveDepartment={handleRemoveDepartment}
                events={events}
                onResetData={handleResetData}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                onChangeView={setViewMode}
                onShowToast={showToast}
              />
            )}

            {viewMode === 'appscript' && (
              <AppsScriptHubView
                onShowToast={showToast}
                onBackToCalendar={() => setViewMode('weekly')}
              />
            )}
          </div>
        </div>

      {/* Modals & Drawers */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEventToEdit(undefined);
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        initialEvent={eventToEdit}
        departments={departments}
      />

      <EventDetailDrawer
        event={selectedEventDetails}
        onClose={() => setSelectedEventDetails(null)}
        onEdit={(e) => {
          setEventToEdit(e);
          setSelectedEventDetails(null);
          setIsEventModalOpen(true);
        }}
        onDelete={handleDeleteEvent}
        onToggleStatus={handleToggleEventStatus}
        onToggleSubtask={handleToggleSubtask}
      />

      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        events={events}
        onSelectEvent={(e) => setSelectedEventDetails(e)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onUpdateUser={(updated) => setUser({ ...user, ...updated })}
        onResetData={handleResetData}
      />
    </div>
  );
}
