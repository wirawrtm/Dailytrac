import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  DepartmentItem,
  EventCategory,
  EventColorTheme,
  Subtask,
  TaskEvent,
  UserProfile,
  WorkOutline,
} from '../types';
import {
  CURRENT_USER,
  DEFAULT_DEPARTMENTS,
  MALE_AVATAR_URL,
  getEventOutline,
} from '../data/initialData';
import { formatDateToISO } from '../utils/dateUtils';

export const PERMANENT_WORKSPACE_ID = 'primary';

const VALID_OUTLINES: WorkOutline[] = ['Work', 'Improvement', 'Buy'];
const VALID_CATEGORIES: EventCategory[] = [
  'meetings',
  'due_dates',
  'milestones',
  'deadlines',
  'personal',
  'birthdays',
];
const VALID_COLOR_THEMES: EventColorTheme[] = [
  'purple',
  'indigo',
  'cyan',
  'peach',
  'pink',
  'emerald',
];
const VALID_STATUSES: TaskEvent['status'][] = [
  'pending',
  'in_progress',
  'completed',
  'cancelled',
];

export const TASK_FIELD_LIMITS = {
  TITLE_MAX: 300,
  DEPARTMENT_MAX: 120,
  DESCRIPTION_MAX: 2000,
  LOCATION_MAX: 300,
  MEETING_LINK_MAX: 500,
  SUBTASKS_MAX: 50,
} as const;

export function deduplicateTasks(tasks: TaskEvent[]): TaskEvent[] {
  const result: TaskEvent[] = [];
  const usedIds = new Set<string>();
  const indexBySignature = new Map<string, number>();

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const baseId = String(task.id || '').trim() || `task_${Date.now()}_${i}`;
    const signature = [
      baseId,
      (task.title || '').trim().toLowerCase(),
      (task.date || '').trim(),
      (task.department || task.subtitle || '').trim().toLowerCase(),
    ].join('|');

    const existingSigIndex = indexBySignature.get(signature);
    if (existingSigIndex !== undefined) {
      result[existingSigIndex] = { ...task, id: result[existingSigIndex].id };
      continue;
    }

    let uniqueId = baseId;
    if (usedIds.has(uniqueId)) {
      let suffix = 2;
      while (usedIds.has(`${baseId}-${suffix}`)) {
        suffix++;
      }
      uniqueId = `${baseId}-${suffix}`;
    }

    usedIds.add(uniqueId);
    indexBySignature.set(signature, result.length);
    result.push(uniqueId === task.id ? task : { ...task, id: uniqueId });
  }

  return result;
}

export function sanitizeFirestoreId(raw: string, fallbackPrefix = 'item'): string {
  const cleaned = String(raw || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 128);
  if (cleaned.length > 0) return cleaned;
  return `${fallbackPrefix}-${Date.now()}`;
}

function normalizeDateStr(raw: string | undefined, fallbackToToday = true): string {
  const trimmed = String(raw || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  return fallbackToToday ? formatDateToISO(new Date()) : '';
}

function normalizeOutline(raw: unknown, ev?: TaskEvent, departments?: DepartmentItem[]): WorkOutline {
  if (raw === 'Work' || raw === 'Improvement' || raw === 'Buy') return raw;
  if (ev) return getEventOutline(ev, departments);
  return 'Work';
}

function normalizeSubtasks(raw?: Subtask[]): Subtask[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw.slice(0, TASK_FIELD_LIMITS.SUBTASKS_MAX).map((st, idx) => ({
    id: sanitizeFirestoreId(st.id || `sub-${idx}`, 'sub'),
    title: String(st.title || 'Subtask').trim().slice(0, 300) || 'Subtask',
    completed: Boolean(st.completed),
  }));
}

function buildTaskPayload(
  task: TaskEvent,
  departments: DepartmentItem[],
  isCreate: boolean
): Record<string, any> {
  const safeId = sanitizeFirestoreId(task.id, 'evt');
  const safeOutline = normalizeOutline(task.outline, task, departments);
  const safeCategory: EventCategory = VALID_CATEGORIES.includes(task.category)
    ? task.category
    : 'meetings';
  const safeColor: EventColorTheme = VALID_COLOR_THEMES.includes(task.colorTheme)
    ? task.colorTheme
    : safeOutline === 'Improvement'
    ? 'purple'
    : safeOutline === 'Buy'
    ? 'peach'
    : 'cyan';
  const safeStatus: TaskEvent['status'] = VALID_STATUSES.includes(task.status)
    ? task.status
    : 'pending';

  const startHourNum =
    typeof task.startHour === 'number' && Number.isFinite(task.startHour)
      ? Math.max(0, Math.min(24, task.startHour))
      : 9;
  const durationNum =
    typeof task.durationHours === 'number' && Number.isFinite(task.durationHours) && task.durationHours > 0
      ? Math.min(24, task.durationHours)
      : 1;

  const deptStr =
    String(task.department || task.subtitle || 'Operations')
      .trim()
      .slice(0, TASK_FIELD_LIMITS.DEPARTMENT_MAX) || 'Operations';

  const payload: Record<string, any> = {
    id: safeId,
    workspaceId: PERMANENT_WORKSPACE_ID,
    title:
      String(task.title || 'Tugas Tanpa Judul')
        .trim()
        .slice(0, TASK_FIELD_LIMITS.TITLE_MAX) || 'Tugas Tanpa Judul',
    outline: safeOutline,
    department: deptStr,
    date: normalizeDateStr(task.date, true),
    status: safeStatus,
    category: safeCategory,
    colorTheme: safeColor,
    startHour: startHourNum,
    durationHours: durationNum,
    updatedAt: serverTimestamp(),
  };

  if (isCreate) {
    payload.createdAt = serverTimestamp();
  }

  if (task.subtitle && task.subtitle.trim()) {
    payload.subtitle = task.subtitle.trim().slice(0, 120);
  }
  if (task.description && task.description.trim()) {
    payload.description = task.description.trim().slice(0, TASK_FIELD_LIMITS.DESCRIPTION_MAX);
  }
  const normalizedDueDate = normalizeDateStr(task.dueDate, false);
  if (normalizedDueDate) {
    payload.dueDate = normalizedDueDate;
  } else if (!isCreate) {
    payload.dueDate = '';
  }
  if (task.startTime && task.startTime.trim()) {
    payload.startTime = task.startTime.trim().slice(0, 20);
  }
  if (task.endTime && task.endTime.trim()) {
    payload.endTime = task.endTime.trim().slice(0, 20);
  }
  if (task.location && task.location.trim()) {
    payload.location = task.location.trim().slice(0, TASK_FIELD_LIMITS.LOCATION_MAX);
  }
  if (task.meetingLink && task.meetingLink.trim()) {
    payload.meetingLink = task.meetingLink.trim().slice(0, TASK_FIELD_LIMITS.MEETING_LINK_MAX);
  }
  const cleanSubtasks = normalizeSubtasks(task.subtasks);
  if (cleanSubtasks && cleanSubtasks.length > 0) {
    payload.subtasks = cleanSubtasks;
  } else if (!isCreate && task.subtasks) {
    payload.subtasks = [];
  }

  return payload;
}

function buildDepartmentPayload(
  dept: DepartmentItem,
  isCreate: boolean
): Record<string, any> {
  const safeId = sanitizeFirestoreId(dept.id || dept.name, 'dept');
  const safeOutline: WorkOutline = VALID_OUTLINES.includes(dept.outline)
    ? dept.outline
    : 'Work';
  const safeColor: EventColorTheme = VALID_COLOR_THEMES.includes(dept.colorTheme as EventColorTheme)
    ? (dept.colorTheme as EventColorTheme)
    : 'cyan';

  const payload: Record<string, any> = {
    id: safeId,
    workspaceId: PERMANENT_WORKSPACE_ID,
    name: String(dept.name || safeId).trim().slice(0, 120) || safeId,
    outline: safeOutline,
    colorTheme: safeColor,
    dotColor: String(dept.dotColor || 'bg-teal-500').trim().slice(0, 40) || 'bg-teal-500',
    updatedAt: serverTimestamp(),
  };

  if (isCreate) {
    payload.createdAt = serverTimestamp();
  }

  return payload;
}

export async function ensurePermanentWorkspace(): Promise<void> {
  const wsPath = `workspaces/${PERMANENT_WORKSPACE_ID}`;
  const wsRef = doc(db, 'workspaces', PERMANENT_WORKSPACE_ID);

  try {
    const snap = await getDoc(wsRef);
    if (!snap.exists()) {
      const workspacePayload = {
        id: PERMANENT_WORKSPACE_ID,
        name: CURRENT_USER.name.slice(0, 100),
        avatar: (CURRENT_USER.avatar || MALE_AVATAR_URL).slice(0, 10000),
        timezone: CURRENT_USER.timezone.slice(0, 60),
        role: (CURRENT_USER.role || 'Product Lead').slice(0, 60),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(wsRef, workspacePayload);
    }

    const deptsCol = collection(db, 'workspaces', PERMANENT_WORKSPACE_ID, 'departments');
    const deptQuery = query(deptsCol, where('workspaceId', '==', PERMANENT_WORKSPACE_ID));
    const deptSnap = await getDocs(deptQuery);

    if (deptSnap.empty && DEFAULT_DEPARTMENTS.length > 0) {
      const batch = writeBatch(db);
      const seenDeptIds = new Set<string>();
      for (const dept of DEFAULT_DEPARTMENTS) {
        const deptId = sanitizeFirestoreId(dept.id || dept.name, 'dept');
        if (seenDeptIds.has(deptId)) continue;
        seenDeptIds.add(deptId);
        const ref = doc(db, 'workspaces', PERMANENT_WORKSPACE_ID, 'departments', deptId);
        batch.set(ref, buildDepartmentPayload({ ...dept, id: deptId }, true));
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, wsPath);
  }
}

export function subscribeWorkspaceProfile(
  fallbackUser: UserProfile,
  onData: (profile: UserProfile) => void
): Unsubscribe {
  const path = `workspaces/${PERMANENT_WORKSPACE_ID}`;
  const wsRef = doc(db, 'workspaces', PERMANENT_WORKSPACE_ID);

  return onSnapshot(
    wsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onData({
          name: String(data.name || fallbackUser.name),
          email: fallbackUser.email,
          avatar: String(data.avatar || fallbackUser.avatar || MALE_AVATAR_URL),
          timezone: String(data.timezone || fallbackUser.timezone || 'GMT+07'),
          role: String(data.role || fallbackUser.role || 'Product Lead'),
        });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeTasks(
  onData: (tasks: TaskEvent[]) => void
): Unsubscribe {
  const path = `workspaces/${PERMANENT_WORKSPACE_ID}/tasks`;
  const q = query(
    collection(db, 'workspaces', PERMANENT_WORKSPACE_ID, 'tasks'),
    where('workspaceId', '==', PERMANENT_WORKSPACE_ID)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: TaskEvent[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.id || d.id),
          title: String(data.title || 'Tugas Tanpa Judul'),
          outline: VALID_OUTLINES.includes(data.outline) ? data.outline : 'Work',
          department: String(data.department || 'Operations'),
          subtitle: data.subtitle ? String(data.subtitle) : String(data.department || 'Operations'),
          description: data.description ? String(data.description) : undefined,
          date: normalizeDateStr(data.date, true),
          dueDate: data.dueDate ? String(data.dueDate) : undefined,
          startTime: data.startTime ? String(data.startTime) : '09:00 AM',
          endTime: data.endTime ? String(data.endTime) : '10:00 AM',
          startHour: typeof data.startHour === 'number' ? data.startHour : 9,
          durationHours: typeof data.durationHours === 'number' ? data.durationHours : 1,
          category: VALID_CATEGORIES.includes(data.category) ? data.category : 'meetings',
          colorTheme: VALID_COLOR_THEMES.includes(data.colorTheme) ? data.colorTheme : 'cyan',
          status: VALID_STATUSES.includes(data.status) ? data.status : 'pending',
          location: data.location ? String(data.location) : undefined,
          meetingLink: data.meetingLink ? String(data.meetingLink) : undefined,
          subtasks: Array.isArray(data.subtasks) ? data.subtasks : undefined,
        };
      });
      onData(deduplicateTasks(list));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeDepartments(
  onData: (departments: DepartmentItem[]) => void
): Unsubscribe {
  const path = `workspaces/${PERMANENT_WORKSPACE_ID}/departments`;
  const q = query(
    collection(db, 'workspaces', PERMANENT_WORKSPACE_ID, 'departments'),
    where('workspaceId', '==', PERMANENT_WORKSPACE_ID)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: DepartmentItem[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.id || d.id),
          name: String(data.name || d.id),
          outline: VALID_OUTLINES.includes(data.outline) ? data.outline : 'Work',
          colorTheme: VALID_COLOR_THEMES.includes(data.colorTheme) ? data.colorTheme : 'cyan',
          dotColor: String(data.dotColor || 'bg-teal-500'),
        };
      });
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function updateWorkspaceProfileInFirestore(
  currentProfile: UserProfile,
  updates: Partial<UserProfile>
): Promise<void> {
  const path = `workspaces/${PERMANENT_WORKSPACE_ID}`;
  const wsRef = doc(db, 'workspaces', PERMANENT_WORKSPACE_ID);

  const merged = {
    name: String(updates.name ?? currentProfile.name).trim().slice(0, 100) || 'Workspace',
    avatar: String(updates.avatar ?? currentProfile.avatar ?? MALE_AVATAR_URL).slice(0, 10000),
    timezone: String(updates.timezone ?? currentProfile.timezone).trim().slice(0, 60) || 'GMT+07',
    role: String(updates.role ?? currentProfile.role ?? 'Product Lead').trim().slice(0, 60) || 'Product Lead',
    updatedAt: serverTimestamp(),
  };

  try {
    await updateDoc(wsRef, merged);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveTaskToFirestore(
  task: TaskEvent,
  departments: DepartmentItem[],
  isExisting: boolean
): Promise<TaskEvent> {
  const safeId = sanitizeFirestoreId(task.id, 'evt');
  const normalizedTask: TaskEvent = { ...task, id: safeId };
  const path = `workspaces/${PERMANENT_WORKSPACE_ID}/tasks/${safeId}`;
  const taskRef = doc(db, 'workspaces', PERMANENT_WORKSPACE_ID, 'tasks', safeId);

  try {
    if (isExisting) {
      const payload = buildTaskPayload(normalizedTask, departments, false);
      const updatePayload: Record<string, any> = { ...payload };
      delete updatePayload.id;
      delete updatePayload.workspaceId;
      delete updatePayload.createdAt;
      await updateDoc(taskRef, updatePayload);
    } else {
      const payload = buildTaskPayload(normalizedTask, departments, true);
      await setDoc(taskRef, payload);
    }
    return normalizedTask;
  } catch (error) {
    handleFirestoreError(error, isExisting ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function updateTaskStatusInFirestore(
  taskId: string,
  newStatus: TaskEvent['status']
): Promise<void> {
  const safeId = sanitizeFirestoreId(taskId, 'evt');
  const path = `workspaces/${PERMANENT_WORKSPACE_ID}/tasks/${safeId}`;
  const taskRef = doc(db, 'workspaces', PERMANENT_WORKSPACE_ID, 'tasks', safeId);
  const safeStatus: TaskEvent['status'] = VALID_STATUSES.includes(newStatus)
    ? newStatus
    : 'pending';

  try {
    await updateDoc(taskRef, {
      status: safeStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateTaskSubtasksInFirestore(
  taskId: string,
  subtasks: Subtask[]
): Promise<void> {
  const safeId = sanitizeFirestoreId(taskId, 'evt');
  const path = `workspaces/${PERMANENT_WORKSPACE_ID}/tasks/${safeId}`;
  const taskRef = doc(db, 'workspaces', PERMANENT_WORKSPACE_ID, 'tasks', safeId);
  const cleanSubtasks = normalizeSubtasks(subtasks) || [];

  try {
    await updateDoc(taskRef, {
      subtasks: cleanSubtasks,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTaskFromFirestore(taskId: string): Promise<void> {
  const safeId = sanitizeFirestoreId(taskId, 'evt');
  const path = `workspaces/${PERMANENT_WORKSPACE_ID}/tasks/${safeId}`;
  const taskRef = doc(db, 'workspaces', PERMANENT_WORKSPACE_ID, 'tasks', safeId);

  try {
    await deleteDoc(taskRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveDepartmentToFirestore(
  dept: DepartmentItem
): Promise<DepartmentItem> {
  const safeId = sanitizeFirestoreId(dept.id || dept.name, 'dept');
  const normalizedDept: DepartmentItem = { ...dept, id: safeId };
  const path = `workspaces/${PERMANENT_WORKSPACE_ID}/departments/${safeId}`;
  const deptRef = doc(db, 'workspaces', PERMANENT_WORKSPACE_ID, 'departments', safeId);

  try {
    const existingSnap = await getDoc(deptRef);
    if (existingSnap.exists()) {
      const updatePayload = buildDepartmentPayload(normalizedDept, false);
      delete updatePayload.id;
      delete updatePayload.workspaceId;
      delete updatePayload.createdAt;
      await updateDoc(deptRef, updatePayload);
    } else {
      await setDoc(deptRef, buildDepartmentPayload(normalizedDept, true));
    }
    return normalizedDept;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteDepartmentAndTasksFromFirestore(
  deptId: string,
  deptName: string,
  relatedTaskIds: string[]
): Promise<void> {
  const safeDeptId = sanitizeFirestoreId(deptId || deptName, 'dept');
  const path = `workspaces/${PERMANENT_WORKSPACE_ID}/departments/${safeDeptId}`;

  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'workspaces', PERMANENT_WORKSPACE_ID, 'departments', safeDeptId));
    for (const tid of relatedTaskIds) {
      const safeTaskId = sanitizeFirestoreId(tid, 'evt');
      batch.delete(doc(db, 'workspaces', PERMANENT_WORKSPACE_ID, 'tasks', safeTaskId));
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function resetWorkspaceDataInFirestore(
  taskIds: string[],
  existingDeptIds: string[]
): Promise<void> {
  const path = `workspaces/${PERMANENT_WORKSPACE_ID}`;
  try {
    const CHUNK_SIZE = 400;
    const deleteRefs = [
      ...taskIds.map((id) =>
        doc(db, 'workspaces', PERMANENT_WORKSPACE_ID, 'tasks', sanitizeFirestoreId(id, 'evt'))
      ),
      ...existingDeptIds.map((id) =>
        doc(db, 'workspaces', PERMANENT_WORKSPACE_ID, 'departments', sanitizeFirestoreId(id, 'dept'))
      ),
    ];

    for (let i = 0; i < deleteRefs.length; i += CHUNK_SIZE) {
      const batch = writeBatch(db);
      for (const ref of deleteRefs.slice(i, i + CHUNK_SIZE)) {
        batch.delete(ref);
      }
      await batch.commit();
    }

    const seedBatch = writeBatch(db);
    for (const dept of DEFAULT_DEPARTMENTS) {
      const safeId = sanitizeFirestoreId(dept.id || dept.name, 'dept');
      seedBatch.set(
        doc(db, 'workspaces', PERMANENT_WORKSPACE_ID, 'departments', safeId),
        buildDepartmentPayload({ ...dept, id: safeId }, true)
      );
    }
    await seedBatch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
