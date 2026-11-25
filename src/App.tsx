import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { DatabaseView } from './components/DatabaseView';
import { EventModal } from './components/EventModal';
import { EventDetailDrawer } from './components/EventDetailDrawer';
import { NotificationModal } from './components/NotificationModal';
import { SettingsModal } from './components/SettingsModal';
import { formatDateToISO } from './utils/dateUtils';
import {
  subscribeWorkspaceProfile,
  subscribeTasks,
  subscribeDepartments,
  updateWorkspaceProfileInFirestore,
  saveTaskToFirestore,
  updateTaskStatusInFirestore,
  updateTaskSubtasksInFirestore,
  deleteTaskFromFirestore,
  saveDepartmentToFirestore,
  deleteDepartmentAndTasksFromFirestore,
  resetWorkspaceDataInFirestore,
  sanitizeFirestoreId,
  deduplicateTasks,
} from './services/firebaseDbService';
import { isTransientOfflineError } from './firebase';

const STORAGE_KEY_FILTERS = 'tasklio_filters_firebase';

export default function App() {
  // Purge legacy spreadsheet/appscript localStorage keys on mount
  useEffect(() => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (
          key.startsWith('tasklio_') &&
          key !== STORAGE_KEY_FILTERS &&
          key !== 'tasklio_workspace_email'
        ) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [firestoreError, setFirestoreError] = useState<Error | null>(null);
  if (firestoreError) {
    throw firestoreError;
  }

  // Initial State: populated from permanent Firestore real-time listeners
  const [events, setEvents] = useState<TaskEvent[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [departments, setDepartments] = useState<DepartmentItem[]>(DEFAULT_DEPARTMENTS);

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const [user, setUser] = useState<UserProfile>(CURRENT_USER);

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [searchQuery] = useState<string>('');
  const [outlineFilter, setOutlineFilter] = useState<'all' | 'Work' | 'Improvement' | 'Buy'>('all');

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileBarsHidden, setIsMobileBarsHidden] = useState(false);

  const mobileScrollRef = useRef<{
    activeTarget: HTMLElement | null;
    lastTop: number;
    accumulatedDelta: number;
    lastDirection: 'up' | 'down' | null;
    lockUntil: number;
    touchStartY: number | null;
  }>({
    activeTarget: null,
    lastTop: 0,
    accumulatedDelta: 0,
    lastDirection: null,
    lockUntil: 0,
    touchStartY: null,
  });

  // Always show mobile bars when switching views, dates, or opening sidebar
  useEffect(() => {
    setIsMobileBarsHidden(false);
    mobileScrollRef.current.activeTarget = null;
    mobileScrollRef.current.accumulatedDelta = 0;
    mobileScrollRef.current.lastDirection = null;
  }, [viewMode, selectedDate, isSidebarOpen]);

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

  // Initialize permanent Firestore workspace + real-time subscriptions on mount
  useEffect(() => {
    let cancelled = false;
    let unsubWorkspace: (() => void) | undefined;
    let unsubTasks: (() => void) | undefined;
    let unsubDepts: (() => void) | undefined;

    let savedLocalEmail = CURRENT_USER.email;
    try {
      const storedEmail = localStorage.getItem('tasklio_workspace_email');
      if (storedEmail) savedLocalEmail = storedEmail;
    } catch {
      // ignore
    }

    const fallbackProfile: UserProfile = {
      ...CURRENT_USER,
      email: savedLocalEmail,
    };
    setUser(fallbackProfile);

    const handleListenerError = (err: Error) => {
      if (cancelled) return;
      setIsLoadingData(false);
      if (isTransientOfflineError(err)) {
        showToast('Koneksi Firebase sedang offline, menunggu sambungan pulih...');
      } else {
        setFirestoreError(err);
      }
    };

    // Attach real-time listeners immediately so onSnapshot handles connection/reconnection cleanly
    try {
      unsubWorkspace = subscribeWorkspaceProfile(
        fallbackProfile,
        (profile) => {
          if (!cancelled) {
            setUser((prev) => ({
              ...profile,
              email: prev.email || savedLocalEmail,
            }));
          }
        },
        handleListenerError
      );
      unsubTasks = subscribeTasks(
        (liveTasks) => {
          if (!cancelled) {
            setEvents(liveTasks);
            setIsLoadingData(false);
          }
        },
        handleListenerError
      );
      unsubDepts = subscribeDepartments(
        (liveDepts) => {
          if (!cancelled && liveDepts.length > 0) setDepartments(liveDepts);
        },
        handleListenerError
      );
    } catch (err: any) {
      handleListenerError(err instanceof Error ? err : new Error(String(err)));
    }

    const offlineFallbackTimer = window.setTimeout(() => {
      if (!cancelled) {
        setIsLoadingData((stillLoading) => {
          if (stillLoading) {
            showToast('Menghubungkan ke Firebase... Pastikan koneksi internet aktif.');
          }
          return false;
        });
      }
    }, 11000);

    return () => {
      cancelled = true;
      window.clearTimeout(offlineFallbackTimer);
      unsubWorkspace?.();
      unsubTasks?.();
      unsubDepts?.();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(filters));
    } catch (e) {
      console.error('Failed to save filters to localStorage', e);
    }
  }, [filters]);

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
    const safeDept: DepartmentItem = {
      ...newDept,
      id: sanitizeFirestoreId(newDept.id || newDept.name, 'dept'),
    };
    setDepartments((prev) => [...prev, safeDept]);
    setFilters((prev) => ({ ...prev, [safeDept.name]: false }));

    saveDepartmentToFirestore(safeDept).catch((err) => {
      setFirestoreError(err instanceof Error ? err : new Error(String(err)));
    });
    showToast(`Departemen "${safeDept.name}" berhasil disimpan ke Firebase Firestore!`);
  };

  const handleRemoveDepartment = (deptId: string) => {
    const targetDept = departments.find((d) => d.id === deptId || d.name === deptId);
    const deptName = targetDept ? targetDept.name : deptId;
    const targetFirestoreId = targetDept ? targetDept.id : deptId;

    const relatedTaskIds = events
      .filter((e) => (e.department || e.subtitle || '').toLowerCase().trim() === deptName.toLowerCase().trim())
      .map((e) => e.id);

    setDepartments((prev) => prev.filter((d) => d.id !== deptId && d.name !== deptId));
    setFilters((prev) => {
      const next = { ...prev };
      delete next[deptId];
      delete next[deptName];
      return next;
    });
    setEvents((prev) =>
      prev.filter(
        (e) => (e.department || e.subtitle || '').toLowerCase().trim() !== deptName.toLowerCase().trim()
      )
    );

    deleteDepartmentAndTasksFromFirestore(
      targetFirestoreId,
      deptName,
      relatedTaskIds
    ).catch((err) => {
      setFirestoreError(err instanceof Error ? err : new Error(String(err)));
    });

    showToast(`Departemen "${deptName}" dan tugas terkait berhasil dihapus dari Firestore!`);
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
    const safeId = sanitizeFirestoreId(savedEvent.id, 'evt');
    const normalizedEvent: TaskEvent = { ...savedEvent, id: safeId };
    const exists = events.some((e) => e.id === normalizedEvent.id);

    setEvents((prev) =>
      deduplicateTasks(
        exists
          ? prev.map((e) => (e.id === normalizedEvent.id ? normalizedEvent : e))
          : [...prev, normalizedEvent]
      )
    );

    if (selectedEventDetails?.id === normalizedEvent.id) {
      setSelectedEventDetails(normalizedEvent);
    }

    saveTaskToFirestore(normalizedEvent, departments, exists).catch((err) => {
      setFirestoreError(err instanceof Error ? err : new Error(String(err)));
    });

    showToast(`Tugas "${normalizedEvent.title}" berhasil disimpan ke Firebase!`);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    if (selectedEventDetails?.id === eventId) {
      setSelectedEventDetails(null);
    }

    deleteTaskFromFirestore(eventId).catch((err) => {
      setFirestoreError(err instanceof Error ? err : new Error(String(err)));
    });

    showToast('Tugas berhasil dihapus dari Firebase');
  };

  const handleToggleEventStatus = (eventId: string) => {
    const targetTask = events.find((e) => e.id === eventId);
    if (!targetTask) return;

    const nextStatus: TaskEvent['status'] = targetTask.status === 'completed' ? 'pending' : 'completed';
    const updatedTask: TaskEvent = { ...targetTask, status: nextStatus };

    setEvents((prev) => prev.map((e) => (e.id === eventId ? updatedTask : e)));
    if (selectedEventDetails?.id === eventId) {
      setSelectedEventDetails(updatedTask);
    }

    updateTaskStatusInFirestore(eventId, nextStatus).catch((err) => {
      setFirestoreError(err instanceof Error ? err : new Error(String(err)));
    });

    const statusLabel = nextStatus === 'completed' ? 'Selesai (Complete)' : 'Belum Selesai (Pending)';
    showToast(`Status tugas "${updatedTask.title}" diperbarui ke ${statusLabel} di Firebase!`);
  };

  const handleUpdateEventStatus = (eventId: string, newStatus: TaskEvent['status']) => {
    const targetTask = events.find((e) => e.id === eventId);
    if (!targetTask) return;

    const updatedTask: TaskEvent = { ...targetTask, status: newStatus };

    setEvents((prev) => prev.map((e) => (e.id === eventId ? updatedTask : e)));
    if (selectedEventDetails?.id === eventId) {
      setSelectedEventDetails(updatedTask);
    }

    updateTaskStatusInFirestore(eventId, newStatus).catch((err) => {
      setFirestoreError(err instanceof Error ? err : new Error(String(err)));
    });

    const statusLabel = newStatus === 'completed' ? 'Selesai (Complete)' : 'Belum Selesai (Pending)';
    showToast(`Status tugas "${updatedTask.title}" diperbarui ke ${statusLabel} di Firebase!`);
  };

  const handleToggleSubtask = (eventId: string, subtaskId: string) => {
    const targetTask = events.find((e) => e.id === eventId);
    if (!targetTask || !targetTask.subtasks) return;

    const updatedSubtasks = targetTask.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    const updatedTask: TaskEvent = { ...targetTask, subtasks: updatedSubtasks };

    setEvents((prev) => prev.map((e) => (e.id === eventId ? updatedTask : e)));
    if (selectedEventDetails?.id === eventId) {
      setSelectedEventDetails(updatedTask);
    }

    updateTaskSubtasksInFirestore(eventId, updatedSubtasks).catch((err) => {
      setFirestoreError(err instanceof Error ? err : new Error(String(err)));
    });
  };

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    const nextUser = { ...user, ...updated };
    setUser(nextUser);
    if (updated.email) {
      try {
        localStorage.setItem('tasklio_workspace_email', updated.email);
      } catch {
        // ignore
      }
    }
    updateWorkspaceProfileInFirestore(user, updated).catch((err) => {
      setFirestoreError(err instanceof Error ? err : new Error(String(err)));
    });
  };

  const handleResetData = () => {
    const freshEvents = getInitialEvents();
    setEvents(freshEvents);
    setFilters(INITIAL_FILTERS);
    setDepartments(DEFAULT_DEPARTMENTS);
    setSelectedDate(new Date());

    resetWorkspaceDataInFirestore(
      events.map((e) => e.id),
      departments.map((d) => d.id)
    ).catch((err) => {
      setFirestoreError(err instanceof Error ? err : new Error(String(err)));
    });
    showToast('Data tugas di Firebase Firestore berhasil direset!');
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

  const handleMobileScrollCapture = (e: React.UIEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) return;
    if (isSidebarOpen || isProfileMenuOpen) return;

    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Ignore horizontal-only or barely overflowing containers
    if (target.scrollHeight <= target.clientHeight + 24) return;

    const maxScroll = Math.max(0, target.scrollHeight - target.clientHeight);
    const currentTop = Math.max(0, Math.min(target.scrollTop, maxScroll));
    const state = mobileScrollRef.current;

    if (state.activeTarget !== target) {
      state.activeTarget = target;
      state.lastTop = currentTop;
      state.accumulatedDelta = 0;
      state.lastDirection = null;
      return;
    }

    const prevTop = state.lastTop;
    state.lastTop = currentTop;

    const now = Date.now();
    if (now < state.lockUntil) {
      state.accumulatedDelta = 0;
      state.lastDirection = null;
      return;
    }

    // Reveal bars smoothly when scrolled back to the top
    if (currentTop <= 16 && isMobileBarsHidden) {
      state.accumulatedDelta = 0;
      state.lastDirection = null;
      state.lockUntil = now + 420;
      setIsMobileBarsHidden(false);
      return;
    }

    // Require ample overflow before hiding so collapsing bars (~128px) never clamps scrollTop
    if (maxScroll < 240 && !isMobileBarsHidden) return;

    // Ignore rubber-band / overscroll bounce near the bottom edge
    if (maxScroll > 60 && currentTop >= maxScroll - 24) return;

    const delta = currentTop - prevTop;
    if (Math.abs(delta) < 2) return;

    const dir: 'up' | 'down' = delta > 0 ? 'down' : 'up';
    if (state.lastDirection !== dir) {
      state.accumulatedDelta = delta;
      state.lastDirection = dir;
    } else {
      state.accumulatedDelta += delta;
    }

    if (dir === 'down' && state.accumulatedDelta > 90 && currentTop > 72 && !isMobileBarsHidden) {
      state.accumulatedDelta = 0;
      state.lastDirection = null;
      state.lockUntil = now + 420;
      setIsMobileBarsHidden(true);
    } else if (dir === 'up' && state.accumulatedDelta < -75 && isMobileBarsHidden) {
      state.accumulatedDelta = 0;
      state.lastDirection = null;
      state.lockUntil = now + 420;
      setIsMobileBarsHidden(false);
    }
  };

  const handleMobileTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) return;
    mobileScrollRef.current.touchStartY = e.touches[0]?.clientY ?? null;
  };

  const handleMobileTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) return;
    if (!isMobileBarsHidden || isSidebarOpen || isProfileMenuOpen) return;
    const startY = mobileScrollRef.current.touchStartY;
    if (startY === null) return;
    const currentY = e.touches[0]?.clientY;
    if (currentY === undefined) return;
    const now = Date.now();
    if (now < mobileScrollRef.current.lockUntil) return;

    const diffY = currentY - startY;
    // Deliberate downward pull reveals hidden bars even when scroll container is already at top
    if (diffY > 85) {
      mobileScrollRef.current.touchStartY = currentY;
      mobileScrollRef.current.accumulatedDelta = 0;
      mobileScrollRef.current.lastDirection = null;
      mobileScrollRef.current.lockUntil = now + 420;
      setIsMobileBarsHidden(false);
    }
  };

  const handleMobileTouchEnd = () => {
    mobileScrollRef.current.touchStartY = null;
    mobileScrollRef.current.accumulatedDelta = 0;
    mobileScrollRef.current.lastDirection = null;
  };

  return (
    <div className={`h-full max-h-full w-full font-sans transition-colors duration-200 overflow-hidden flex flex-col md:flex-row items-stretch select-none ${
      isFullscreen 
        ? 'bg-white p-0 gap-0' 
        : 'bg-white md:bg-[#eef3f1] p-0 md:py-4 md:pr-4 md:pl-0 lg:py-5 lg:pr-5 lg:pl-0 gap-0 md:gap-3.5'
    }`}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top duration-200 max-w-[90vw] truncate">
          {toastMessage}
        </div>
      )}

      {/* Navigation Rail (Floating Bottom Bar on Mobile, Left Rail on Desktop) */}
      <NavigationRail
        isFullscreen={isFullscreen}
        currentView={viewMode}
        onSelectView={(v) => setViewMode(v)}
        onOpenSettings={() => setViewMode('settings')}
        onOpenCreateModal={() => handleOpenCreateModal()}
        isMobileHidden={isMobileBarsHidden}
      />

      {/* Content Area Wrapper: Order 1 on Mobile (Top, Unified Scroll), Order 2 on Desktop (Right) */}
      <div
        onScrollCapture={handleMobileScrollCapture}
        onTouchStart={handleMobileTouchStart}
        onTouchMove={handleMobileTouchMove}
        onTouchEnd={handleMobileTouchEnd}
        onTouchCancel={handleMobileTouchEnd}
        className="order-1 md:order-2 flex-1 flex flex-col min-w-0 min-h-0 h-full gap-0 relative max-md:overflow-y-auto max-md:overflow-x-hidden max-md:overscroll-y-contain max-md:touch-pan-y max-md:[-webkit-overflow-scrolling:touch] md:overflow-hidden"
      >
        {/* Mobile Top Bar (Scrolls naturally with mobile page) */}
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
          isMobileHidden={isMobileBarsHidden}
        />

        {/* Main Container (Flows naturally on mobile, floating rounded card on desktop) */}
        <div className={`max-md:flex-auto md:flex-1 flex flex-col min-w-0 md:min-h-0 md:h-full bg-white max-md:overflow-visible md:overflow-hidden transition-shadow duration-200 relative ${
          isFullscreen
            ? 'rounded-none border-none'
            : 'rounded-none md:rounded-[28px] shadow-none md:shadow-xl border-none md:border md:border-slate-200/80'
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
            isMobileHidden={isMobileBarsHidden}
          />

          {/* Main Body: Collapsible Sidebar + Schedule View */}
          <div className="max-md:flex-auto md:flex-1 flex flex-row min-w-0 md:min-h-0 md:overflow-hidden md:h-full relative max-md:overflow-visible">
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
                totalEventsCount={events.length}
                isLoading={isLoadingData}
                isMobileBarsHidden={isMobileBarsHidden}
                onResetOutlineFilter={() => setOutlineFilter('all')}
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
                onUpdateUser={handleUpdateUser}
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

            {viewMode === 'database' && (
              <DatabaseView
                events={events}
                departments={departments}
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
        onUpdateUser={handleUpdateUser}
        onResetData={handleResetData}
      />
    </div>
  );
}
