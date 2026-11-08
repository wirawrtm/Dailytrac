import { TaskEvent, FilterState, UserProfile, DepartmentItem, WorkOutline } from '../types';
import { formatDateToISO } from '../utils/dateUtils';

export const MALE_AVATAR_URL = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none">
    <rect width="128" height="128" rx="64" fill="#0f766e"/>
    <circle cx="64" cy="46" r="22" fill="#fed7aa"/>
    <path d="M42 46c0-14 10-24 22-24s22 10 22 24c0 2-4-2-7-4-4 4-9 4-15 0-6 4-11 4-15 0-4 2-7 6-7 4z" fill="#1e293b"/>
    <path d="M26 114c0-22 17-38 38-38s38 16 38 38" fill="#0f172a"/>
    <path d="M52 76l12 14 12-14" fill="#ffffff"/>
    <path d="M60 84l4 24 4-24" fill="#0284c7"/>
    <circle cx="56" cy="46" r="2.5" fill="#1e293b"/>
    <circle cx="72" cy="46" r="2.5" fill="#1e293b"/>
    <path d="M58 56c4 2.5 8 2.5 12 0" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`
)}`;

export const CURRENT_USER: UserProfile = {
  name: 'John Doe',
  email: 'john.doe@company.design',
  avatar: MALE_AVATAR_URL,
  timezone: 'GMT+07',
  role: 'Product Lead',
};

export const DEFAULT_DEPARTMENTS: DepartmentItem[] = [
  // Work (Daily & Operational Work)
  { id: 'Operations', name: 'Operations', outline: 'Work', colorTheme: 'indigo', dotColor: 'bg-indigo-500' },
  { id: 'Marketing & Sales', name: 'Marketing & Sales', outline: 'Work', colorTheme: 'peach', dotColor: 'bg-amber-500' },
  { id: 'Finance', name: 'Finance', outline: 'Work', colorTheme: 'emerald', dotColor: 'bg-emerald-500' },
  { id: 'Human Resources', name: 'Human Resources', outline: 'Work', colorTheme: 'pink', dotColor: 'bg-rose-500' },
  // Improvement (Continuous Improvement & Innovation)
  { id: 'Engineering', name: 'Engineering', outline: 'Improvement', colorTheme: 'cyan', dotColor: 'bg-teal-500' },
  { id: 'Product & Design', name: 'Product & Design', outline: 'Improvement', colorTheme: 'purple', dotColor: 'bg-purple-500' },
  // Buy (Procurement & Purchasing)
  { id: 'Procurement', name: 'Procurement', outline: 'Buy', colorTheme: 'peach', dotColor: 'bg-amber-500' },
];

export const getEventOutline = (
  ev: TaskEvent,
  departments: DepartmentItem[] = DEFAULT_DEPARTMENTS
): WorkOutline => {
  if (ev.outline === 'Work' || ev.outline === 'Improvement' || ev.outline === 'Buy') {
    return ev.outline;
  }
  const evDept = (ev.department || ev.subtitle || '').toLowerCase();
  const matchedDept = departments.find((d) => d.name.toLowerCase() === evDept);
  if (matchedDept) {
    return matchedDept.outline;
  }
  if (evDept.includes('buy') || evDept.includes('purchas') || evDept.includes('procure') || ev.title.toLowerCase().includes('beli') || ev.title.toLowerCase().includes('buy')) {
    return 'Buy';
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
  'Buy': false,
  'Operations': false,
  'Marketing & Sales': false,
  'Finance': false,
  'Human Resources': false,
  'Engineering': false,
  'Product & Design': false,
  'Procurement': false,
};

export function getInitialEvents(): TaskEvent[] {
  return [];
}

export const INITIAL_EVENTS: TaskEvent[] = [];

