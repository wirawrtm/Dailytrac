import { EventColorTheme } from '../types';

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
