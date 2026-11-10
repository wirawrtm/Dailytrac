import React, { useState, useEffect, useMemo } from 'react';
import { 
  TaskEvent, 
  FilterState, 
  ViewMode, 
  UserProfile,
  DepartmentItem
} from './types';
import { 
  INITIAL_FILTERS, 
  CURRENT_USER,
  DEFAULT_DEPARTMENTS,
  getEventOutline,
  getInitialEvents
} from './data/initialData';
import { NavigationRail } from './components/NavigationRail';
import { TopHeader, MobileTopBar } from './components/TopHeader';
import { Sidebar } from './components/Sidebar';
import { WeeklyScheduleView } from './components/WeeklyScheduleView';
import { DailyScheduleView } from './components/DailyScheduleView';
import { MonthlyScheduleView } from './components/MonthlyScheduleView';
import { TaskBoardView } from './components/TaskBoardView';
import { SettingsView } from './components/SettingsView';
import { AppsScriptHubView } from './components/AppsScriptHubView';
import { DatabaseView } from './components/DatabaseView';
import { EventModal } from './components/EventModal';
import { EventDetailDrawer } from './components/EventDetailDrawer';
import { NotificationModal } from './components/NotificationModal';
import { SettingsModal } from './components/SettingsModal';
import { formatDateToISO } from './utils/dateUtils';
import { 
  syncDeleteDepartmentToSpreadsheet, 
  syncDepartmentToSpreadsheet,
  syncTaskToSpreadsheet,
  syncTaskDeleteToSpreadsheet,
  syncTaskStatusToSpreadsheet,
  fetchTasksFromSpreadsheet,
  fetchDepartmentsFromSpreadsheet,
  bulkSyncTasksToSpreadsheet,
  bulkSyncDepartmentsToSpreadsheet
} from './services/webhookSyncService';

const STORAGE_KEY_EVENTS = 'tasklio_events_v200_live_spreadsheet';
const STORAGE_KEY_FILTERS = 'tasklio_filters_v200_live_spreadsheet';
const STORAGE_KEY_DEPARTMENTS = 'tasklio_departments_v200_live_spreadsheet';

export default function App() {
  // Purge all old legacy storage keys on mount to guarantee zero leftover dummy data
  useEffect(() => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (
          key.startsWith('tasklio_') &&
          key !== STORAGE_KEY_EVENTS &&
          key !== STORAGE_KEY_FILTERS &&
          key !== STORAGE_KEY_DEPARTMENTS &&
          key !== 'tasklio_appscript_webhook_url' &&
          key !== 'tasklio_appscript_code_v2' &&
          key !== 'tasklio_appscript_notes_v2' &&
          key !== 'tasklio_appscript_title_v2'
        ) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Initial State: 100% clean, empty dummy data, only synced from spreadsheet or local storage
  const [events, setEvents] = useState<TaskEvent[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map((e: any) => ({
            ...e,
            title: (e.title && String(e.title).trim()) || e.task || e.name || (e.description && String(e.description).trim()) || 'Tugas Tanpa Judul'
          }));
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [departments, setDepartments] = useState<DepartmentItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DEPARTMENTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasBuy = parsed.some((d: any) => d.outline === 'Buy');
          if (!hasBuy) {
            return [
              ...parsed,
              { id: 'Procurement', name: 'Procurement', outline: 'Buy', colorTheme: 'peach', dotColor: 'bg-amber-500' }
            ];
          }
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_DEPARTMENTS;
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

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [searchQuery] = useState<string>('');
  const [outlineFilter, setOutlineFilter] = useState<'all' | 'Work' | 'Improvement' | 'Buy'>('all');

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

  // Auto-fetch tasks & departments from Google Spreadsheet on initial load if Webhook URL exists
  useEffect(() => {
    async function initSpreadsheetSync() {
      try {
        const [taskRes, deptRes] = await Promise.all([
          fetchTasksFromSpreadsheet(),
          fetchDepartmentsFromSpreadsheet()
        ]);

        let activeDepartments = (deptRes.success && deptRes.departments && deptRes.departments.length > 0)
          ? deptRes.departments
          : (taskRes.success && taskRes.departments && taskRes.departments.length > 0)
          ? taskRes.departments
          : null;

        if (activeDepartments && activeDepartments.length > 0) {
          if (!activeDepartments.some((d) => d.outline === 'Buy')) {
            activeDepartments = [
              ...activeDepartments,
              { id: 'Procurement', name: 'Procurement', outline: 'Buy', colorTheme: 'peach', dotColor: 'bg-amber-500' }
            ];
          }
          setDepartments(activeDepartments);
          try {
            localStorage.setItem(STORAGE_KEY_DEPARTMENTS, JSON.stringify(activeDepartments));
          } catch (e) {
            console.error(e);
          }
        }

        if (taskRes.success && Array.isArray(taskRes.tasks)) {
          const cleanedTasks = taskRes.tasks.map((t: any) => ({
            ...t,
            title: (t.title && String(t.title).trim()) || t.task || t.name || (t.description && String(t.description).trim()) || 'Tugas Tanpa Judul'
          }));
          setEvents(cleanedTasks);
          try {
            localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(cleanedTasks));
          } catch (e) {
            console.error(e);
          }
          console.log(`[Spreadsheet Sync] ${cleanedTasks.length} tugas & ${activeDepartments?.length || 0} departemen dimuat dari Google Spreadsheet`);
        }
      } catch (e) {
        console.error('Spreadsheet sync error:', e);
      }
    }
    initSpreadsheetSync();
  }, []);

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

  // Filtered events based on Top Header Outline Dropdown, Department checkboxes & search query
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

      // 2. Main Outline filter ('Work' | 'Improvement' | 'Buy') from TopHeader dropdown
      if (outlineFilter !== 'all') {
        const evOutline = getEventOutline(ev, departments);
        if (evOutline !== outlineFilter) {
          return false;
        }
      }

      // 3. Department Checkbox filter (if any active)
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
  }, [events, filters, searchQuery, departments, outlineFilter]);

  // Handlers
  const handleToggleFilter = (key: string) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResetFilters = () => {
    const resetState: FilterState = {
      Work: false,
      Improvement: false,
      Buy: false,
    };
    departments.forEach((d) => {
      resetState[d.name] = false;
    });
    setFilters(resetState);
  };

  const handleAddDepartment = (newDept: DepartmentItem) => {
    setDepartments((prev) => {
      const updated = [...prev, newDept];
      try {
        localStorage.setItem(STORAGE_KEY_DEPARTMENTS, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    setFilters((prev) => {
      const updated = { ...prev, [newDept.name]: false };
      try {
        localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    syncDepartmentToSpreadsheet(newDept).catch((err) => {
      console.log('Spreadsheet department add sync:', err);
    });
    showToast(`Departemen "${newDept.name}" berhasil ditambahkan ke database & spreadsheet!`);
  };

  const handleRemoveDepartment = (deptId: string) => {
    const targetDept = departments.find((d) => d.id === deptId || d.name === deptId);
    const deptName = targetDept ? targetDept.name : deptId;

    const updatedDepts = departments.filter((d) => d.id !== deptId && d.name !== deptId);
    setDepartments(updatedDepts);

    setFilters((prev) => {
      const next = { ...prev };
      delete next[deptId];
      delete next[deptName];
      try {
        localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    // Clean up tasks belonging to the removed department
    setEvents((prev) => {
      const updatedEvents = prev.filter(
        (e) => (e.department || e.subtitle || '').toLowerCase().trim() !== deptName.toLowerCase().trim()
      );
      try {
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updatedEvents));
      } catch (e) {
        console.error(e);
      }
      return updatedEvents;
    });

    try {
      localStorage.setItem(STORAGE_KEY_DEPARTMENTS, JSON.stringify(updatedDepts));
    } catch (e) {
      console.error(e);
    }

    // Trigger Google Apps Script Webhook sync to delete department row from Google Spreadsheet
    syncDeleteDepartmentToSpreadsheet(deptId, deptName).catch((err) => {
      console.log('Spreadsheet department delete sync:', err);
    });

    showToast(`Departemen "${deptName}" dan tugas terkait berhasil dihapus dari database & spreadsheet!`);
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
      const updated = exists
        ? prev.map((e) => (e.id === savedEvent.id ? savedEvent : e))
        : [...prev, savedEvent];
      try {
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    if (selectedEventDetails?.id === savedEvent.id) {
      setSelectedEventDetails(savedEvent);
    }

    // Trigger Google Apps Script Webhook sync to save task to Google Spreadsheet
    syncTaskToSpreadsheet(savedEvent, departments).catch((err) => {
      console.log('Spreadsheet task save sync:', err);
    });

    showToast(`Tugas "${savedEvent.title}" berhasil disimpan!`);
  };

  const handleDeleteEvent = (eventId: string) => {
    const targetTask = events.find((e) => e.id === eventId);
    setEvents((prev) => {
      const updated = prev.filter((e) => e.id !== eventId);
      try {
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    if (selectedEventDetails?.id === eventId) {
      setSelectedEventDetails(null);
    }

    // Trigger Google Apps Script Webhook sync to delete task from Google Spreadsheet
    syncTaskDeleteToSpreadsheet(eventId, targetTask?.title).catch((err) => {
      console.log('Spreadsheet task delete sync:', err);
    });

    showToast('Tugas berhasil dihapus');
  };

  const handleToggleEventStatus = (eventId: string) => {
    let nextStatus: TaskEvent['status'] = 'pending';
    setEvents((prev) => {
      const updatedEvents = prev.map((e) => {
        if (e.id === eventId) {
          nextStatus = e.status === 'completed' ? 'pending' : 'completed';
          const updated: TaskEvent = { ...e, status: nextStatus };
          if (selectedEventDetails?.id === eventId) {
            setSelectedEventDetails(updated);
          }
          return updated;
        }
        return e;
      });
      try {
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updatedEvents));
      } catch (e) {
        console.error(e);
      }
      return updatedEvents;
    });

    // Trigger Google Apps Script Webhook sync for status update
    syncTaskStatusToSpreadsheet(eventId, nextStatus).catch((err) => {
      console.log('Spreadsheet task status sync:', err);
    });
  };

  const handleUpdateEventStatus = (eventId: string, newStatus: TaskEvent['status']) => {
    setEvents((prev) => {
      const updatedEvents = prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e));
      try {
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updatedEvents));
      } catch (e) {
        console.error(e);
      }
      return updatedEvents;
    });

    // Trigger Google Apps Script Webhook sync for status update
    syncTaskStatusToSpreadsheet(eventId, newStatus).catch((err) => {
      console.log('Spreadsheet task status sync:', err);
    });
  };

  const handleToggleSubtask = (eventId: string, subtaskId: string) => {
    setEvents((prev) => {
      const updatedEvents = prev.map((e) => {
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
      });
      try {
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updatedEvents));
      } catch (e) {
        console.error(e);
      }
      return updatedEvents;
    });
  };

  const handleSyncSpreadsheet = async () => {
    showToast('Menghubungi Google Spreadsheet...');
    try {
      const [fetchRes, deptRes] = await Promise.all([
        fetchTasksFromSpreadsheet(),
        fetchDepartmentsFromSpreadsheet()
      ]);

      let activeDepartments = (deptRes.success && deptRes.departments && deptRes.departments.length > 0)
        ? deptRes.departments
        : (fetchRes.success && fetchRes.departments && fetchRes.departments.length > 0)
        ? fetchRes.departments
        : (deptRes.success && deptRes.departments)
        ? deptRes.departments
        : null;

      if (activeDepartments) {
        if (!activeDepartments.some((d) => d.outline === 'Buy')) {
          activeDepartments = [
            ...activeDepartments,
            { id: 'Procurement', name: 'Procurement', outline: 'Buy', colorTheme: 'peach', dotColor: 'bg-amber-500' }
          ];
        }
        setDepartments(activeDepartments);
        try {
          localStorage.setItem(STORAGE_KEY_DEPARTMENTS, JSON.stringify(activeDepartments));
        } catch (e) {
          console.error(e);
        }
      }

      if (fetchRes.success && Array.isArray(fetchRes.tasks)) {
        const cleanedTasks = fetchRes.tasks.map((t: any) => ({
          ...t,
          title: (t.title && String(t.title).trim()) || t.task || t.name || (t.description && String(t.description).trim()) || 'Tugas Tanpa Judul'
        }));
        setEvents(cleanedTasks);
        try {
          localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(cleanedTasks));
        } catch (e) {
          console.error(e);
        }
        showToast(`Sinkronisasi Berhasil: ${cleanedTasks.length} tugas & ${activeDepartments ? activeDepartments.length : departments.length} departemen dimuat langsung dari Google Spreadsheet!`);
      } else {
        // If fetch returned error or no webhook, notify user
        showToast(fetchRes.error || 'Gagal mengambil data dari Google Spreadsheet.');
      }
    } catch (err: any) {
      showToast('Gagal menyinkronkan: ' + (err.message || 'Kesalahan jaringan'));
    }
  };

  const handleResetData = () => {
    const freshEvents = getInitialEvents();
    setEvents(freshEvents);
    setFilters(INITIAL_FILTERS);
    setDepartments(DEFAULT_DEPARTMENTS);
    setSelectedDate(new Date());
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(freshEvents));
      localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(INITIAL_FILTERS));
      localStorage.setItem(STORAGE_KEY_DEPARTMENTS, JSON.stringify(DEFAULT_DEPARTMENTS));
    } catch (e) {
      console.error('Failed to reset localStorage', e);
    }
    showToast('Data tugas & kalender berhasil dipulihkan!');
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    showToast(!isFullscreen ? 'Mode Fullscreen Bagian Dalam Aktif' : 'Frame Luar Dikembalikan');
  };

  // Prevent iOS Safari from scrolling the root window and triggering status-bar blur
  useEffect(() => {
    const preventWindowScroll = () => {
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('scroll', preventWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', preventWindowScroll);
  }, []);

  return (
    <div className={`h-full max-h-full w-full font-sans transition-colors duration-200 overflow-hidden flex flex-col md:flex-row items-stretch select-none ${
      isFullscreen 
        ? 'bg-white p-0 gap-0' 
        : 'bg-[#dce5df] p-2 sm:p-3 md:py-4 md:pr-4 md:pl-0 lg:py-5 lg:pr-5 lg:pl-0 gap-2 sm:gap-3 md:gap-3.5'
    }`}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top duration-200 max-w-[90vw] truncate">
          {toastMessage}
        </div>
      )}

      {/* Navigation Rail (Bottom on Mobile with all sides rounded, Left on Desktop) */}
      <NavigationRail
        isFullscreen={isFullscreen}
        currentView={viewMode}
        onSelectView={(v) => setViewMode(v)}
        onOpenSettings={() => setViewMode('settings')}
        onOpenCreateModal={() => handleOpenCreateModal()}
      />

      {/* Content Area Wrapper: Order 1 on Mobile (Top), Order 2 on Desktop (Right) */}
      <div className="order-1 md:order-2 flex-1 flex flex-col min-w-0 min-h-0 md:h-full gap-1.5 md:gap-0">
        {/* Mobile Top Bar (Outside the green header & white card, transparent background) */}
        <MobileTopBar
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

        {/* Main Rounded Card Container (Extra rounded on mobile, classic rounded on desktop) */}
        <div className={`flex-1 flex flex-col min-w-0 min-h-0 bg-white overflow-hidden transition-all duration-200 transform-gpu ${
          isFullscreen
            ? 'md:h-full rounded-none border-none'
            : 'md:h-full rounded-[36px] md:rounded-[28px] shadow-xl border border-slate-200/80'
        }`}>
          {/* Top Header (On Mobile: View and Outline dropdowns inside green bar; On Desktop: full header) */}
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
            outlineFilter={outlineFilter}
            onSelectOutline={setOutlineFilter}
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
                onSyncSpreadsheet={handleSyncSpreadsheet}
              />
            )}

            {viewMode === 'database' && (
              <DatabaseView
                events={events}
                departments={departments}
                onSyncSpreadsheet={handleSyncSpreadsheet}
                onShowToast={showToast}
                onOpenCreateModal={() => handleOpenCreateModal()}
              />
            )}
          </div>
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
