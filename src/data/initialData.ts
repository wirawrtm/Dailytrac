import { TaskEvent, FilterState, UserProfile, DepartmentItem, WorkOutline } from '../types';

export const CURRENT_USER: UserProfile = {
  name: 'John Doe',
  email: 'john.doe@company.design',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  timezone: 'GMT+07',
  role: 'Product Lead',
};

export const DEFAULT_DEPARTMENTS: DepartmentItem[] = [
  // 1. Work (Daily & Operational Work)
  { id: 'Operations', name: 'Operations', outline: 'Work', colorTheme: 'indigo', dotColor: 'bg-indigo-500' },
  { id: 'Marketing & Sales', name: 'Marketing & Sales', outline: 'Work', colorTheme: 'peach', dotColor: 'bg-amber-500' },
  { id: 'Finance', name: 'Finance', outline: 'Work', colorTheme: 'emerald', dotColor: 'bg-emerald-500' },
  { id: 'Human Resources', name: 'Human Resources', outline: 'Work', colorTheme: 'pink', dotColor: 'bg-rose-500' },
  // 2. Improvement (Continuous Improvement & Innovation)
  { id: 'Engineering', name: 'Engineering', outline: 'Improvement', colorTheme: 'cyan', dotColor: 'bg-teal-500' },
  { id: 'Product & Design', name: 'Product & Design', outline: 'Improvement', colorTheme: 'purple', dotColor: 'bg-purple-500' },
];

export const getEventOutline = (
  ev: TaskEvent,
  departments: DepartmentItem[] = DEFAULT_DEPARTMENTS
): WorkOutline => {
  if (ev.outline === 'Work' || ev.outline === 'Improvement') {
    return ev.outline;
  }
  const evDept = (ev.department || ev.subtitle || 'Engineering').toLowerCase();
  const matchedDept = departments.find((d) => d.name.toLowerCase() === evDept);
  if (matchedDept) {
    return matchedDept.outline;
  }
  // Default heuristic based on title/department keywords
  if (
    evDept.includes('eng') ||
    evDept.includes('design') ||
    evDept.includes('product') ||
    ev.title.toLowerCase().includes('revamp') ||
    ev.title.toLowerCase().includes('audit') ||
    ev.title.toLowerCase().includes('review') ||
    ev.title.toLowerCase().includes('demo')
  ) {
    return 'Improvement';
  }
  return 'Work';
};

// Safe fallback avatar generator using styled SVG data URLs
export const getAvatarUrl = (name: string, bg: string, text: string = '#ffffff') => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="32" fill="${bg}"/>
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="${text}" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="22">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const TEAM_MEMBERS = [
  { name: 'John Doe', avatar: getAvatarUrl('John Doe', '#0f766e'), role: 'Product Lead' },
  { name: 'Sarah Miller', avatar: getAvatarUrl('Sarah Miller', '#e11d48'), role: 'Senior UX Designer' },
  { name: 'Alex Rivera', avatar: getAvatarUrl('Alex Rivera', '#2563eb'), role: 'Frontend Engineer' },
  { name: 'Michael Chen', avatar: getAvatarUrl('Michael Chen', '#d97706'), role: 'Backend Engineer' },
  { name: 'David Kim', avatar: getAvatarUrl('David Kim', '#7c3aed'), role: 'QA Lead' },
  { name: 'Emma Watson', avatar: getAvatarUrl('Emma Watson', '#059669'), role: 'Product Manager' },
  { name: 'Lisa Ray', avatar: getAvatarUrl('Lisa Ray', '#db2777'), role: 'UI Illustrator' },
];

export const INITIAL_FILTERS: FilterState = {
  'Work': false,
  'Improvement': false,
  'Operations': false,
  'Marketing & Sales': false,
  'Finance': false,
  'Human Resources': false,
  'Engineering': false,
  'Product & Design': false,
};

export const INITIAL_EVENTS: TaskEvent[] = [];
