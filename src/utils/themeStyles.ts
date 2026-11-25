import { DepartmentItem, EventColorTheme, TaskEvent } from '../types';

export interface ThemeConfig {
  bg: string;
  hoverBg: string;
  border: string;
  text: string;
  timeText: string;
  badgeBg: string;
  badgeText: string;
  accent: string;
}

export const COLOR_THEMES: Record<EventColorTheme, ThemeConfig> = {
  purple: {
    bg: 'bg-[#f5e8f8]',
    hoverBg: 'hover:bg-[#f0ddf5]',
    border: 'border-[#ebd1f0]',
    text: 'text-[#4a154b]',
    timeText: 'text-[#6e2e70]',
    badgeBg: 'bg-[#ebd1f0]',
    badgeText: 'text-[#4a154b]',
    accent: '#9333ea',
  },
  indigo: {
    bg: 'bg-[#e7eafc]',
    hoverBg: 'hover:bg-[#dde1fa]',
    border: 'border-[#d0d7f9]',
    text: 'text-[#2b3070]',
    timeText: 'text-[#4b5299]',
    badgeBg: 'bg-[#d0d7f9]',
    badgeText: 'text-[#2b3070]',
    accent: '#4f46e5',
  },
  cyan: {
    bg: 'bg-[#dcf3f9]',
    hoverBg: 'hover:bg-[#cef0f8]',
    border: 'border-[#bee8f3]',
    text: 'text-[#0a4855]',
    timeText: 'text-[#166778]',
    badgeBg: 'bg-[#bee8f3]',
    badgeText: 'text-[#0a4855]',
    accent: '#0891b2',
  },
  peach: {
    bg: 'bg-[#fdecdb]',
    hoverBg: 'hover:bg-[#fae2cb]',
    border: 'border-[#f8d8b8]',
    text: 'text-[#6b3506]',
    timeText: 'text-[#8c490e]',
    badgeBg: 'bg-[#f8d8b8]',
    badgeText: 'text-[#6b3506]',
    accent: '#ea580c',
  },
  pink: {
    bg: 'bg-[#fae2ec]',
    hoverBg: 'hover:bg-[#f6d2e2]',
    border: 'border-[#f2bfd7]',
    text: 'text-[#6d133b]',
    timeText: 'text-[#922152]',
    badgeBg: 'bg-[#f2bfd7]',
    badgeText: 'text-[#6d133b]',
    accent: '#db2777',
  },
  emerald: {
    bg: 'bg-[#ddf6ea]',
    hoverBg: 'hover:bg-[#cbf1df]',
    border: 'border-[#b6e8d2]',
    text: 'text-[#094d2e]',
    timeText: 'text-[#116e43]',
    badgeBg: 'bg-[#b6e8d2]',
    badgeText: 'text-[#094d2e]',
    accent: '#059669',
  },
};

const CAPSULE_BY_THEME: Record<EventColorTheme, string> = {
  cyan: 'bg-[#14b8a6] text-white shadow-teal-500/20',
  purple: 'bg-[#a855f7] text-white shadow-purple-500/20',
  peach: 'bg-[#f59e0b] text-white shadow-amber-500/20',
  indigo: 'bg-[#6366f1] text-white shadow-indigo-500/20',
  emerald: 'bg-[#10b981] text-white shadow-emerald-500/20',
  pink: 'bg-[#f43f5e] text-white shadow-rose-500/20',
};

const inferThemeFromDepartmentName = (departmentName: string): EventColorTheme => {
  const norm = departmentName.toLowerCase().trim();
  if (norm.includes('eng') || norm.includes('tech') || norm.includes('dev') || norm.includes('it')) {
    return 'cyan';
  }
  if (norm.includes('design') || norm.includes('product') || norm.includes('ux') || norm.includes('ui')) {
    return 'purple';
  }
  if (norm.includes('market') || norm.includes('sales') || norm.includes('growth') || norm.includes('procure') || norm.includes('buy')) {
    return 'peach';
  }
  if (norm.includes('operat') || norm.includes('manage') || norm.includes('support')) {
    return 'indigo';
  }
  if (norm.includes('finan') || norm.includes('legal') || norm.includes('acc')) {
    return 'emerald';
  }
  if (norm.includes('hr') || norm.includes('human') || norm.includes('people') || norm.includes('talent')) {
    return 'pink';
  }
  return 'indigo';
};

export const getTaskDepartmentTheme = (
  event: TaskEvent,
  departments: DepartmentItem[] = []
): EventColorTheme => {
  const deptKey = (event.department || event.subtitle || '').toLowerCase().trim();
  const matchedDept = departments.find(
    (d) =>
      d.name.toLowerCase().trim() === deptKey ||
      d.id.toLowerCase().trim() === deptKey
  );

  if (matchedDept?.colorTheme) {
    return matchedDept.colorTheme;
  }
  if (event.colorTheme && CAPSULE_BY_THEME[event.colorTheme]) {
    return event.colorTheme;
  }
  return inferThemeFromDepartmentName(deptKey);
};

export const getTaskCapsuleClass = (
  event: TaskEvent,
  departments: DepartmentItem[] = []
): string => {
  const deptKey = (event.department || event.subtitle || '').toLowerCase().trim();
  const matchedDept = departments.find(
    (d) =>
      d.name.toLowerCase().trim() === deptKey ||
      d.id.toLowerCase().trim() === deptKey
  );

  if (matchedDept?.dotColor) {
    const dot = matchedDept.dotColor.toLowerCase();
    if (dot.includes('sky') || dot.includes('38bdf8')) return 'bg-[#38bdf8] text-white shadow-sky-500/20';
    if (dot.includes('blue')) return 'bg-blue-500 text-white shadow-blue-500/20';
    if (dot.includes('indigo')) return CAPSULE_BY_THEME.indigo;
    if (dot.includes('violet')) return 'bg-violet-500 text-white shadow-violet-500/20';
    if (dot.includes('purple')) return CAPSULE_BY_THEME.purple;
    if (dot.includes('fuchsia')) return 'bg-fuchsia-500 text-white shadow-fuchsia-500/20';
    if (dot.includes('pink')) return 'bg-pink-500 text-white shadow-pink-500/20';
    if (dot.includes('rose')) return CAPSULE_BY_THEME.pink;
    if (dot.includes('red')) return 'bg-red-500 text-white shadow-red-500/20';
    if (dot.includes('orange')) return 'bg-orange-500 text-white shadow-orange-500/20';
    if (dot.includes('amber') || dot.includes('yellow')) return CAPSULE_BY_THEME.peach;
    if (dot.includes('lime')) return 'bg-lime-600 text-white shadow-lime-500/20';
    if (dot.includes('emerald') || dot.includes('green')) return CAPSULE_BY_THEME.emerald;
    if (dot.includes('teal')) return CAPSULE_BY_THEME.cyan;
    if (dot.includes('cyan')) return 'bg-cyan-500 text-white shadow-cyan-500/20';
    if (dot.includes('slate')) return 'bg-slate-600 text-white shadow-slate-500/20';
  }

  const theme = getTaskDepartmentTheme(event, departments);
  return CAPSULE_BY_THEME[theme] || 'bg-[#38bdf8] text-white shadow-sky-500/20';
};
