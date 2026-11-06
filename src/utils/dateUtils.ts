export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Monday-to-Sunday day definitions for "Senin - Minggu"
export const WEEKDAYS_SENIN_MINGGU = [
  { id: 'senin', nameId: 'Senin', nameEn: 'Monday', shortId: 'Sen', shortEn: 'Mon', dayIndex: 1 },
  { id: 'selasa', nameId: 'Selasa', nameEn: 'Tuesday', shortId: 'Sel', shortEn: 'Tue', dayIndex: 2 },
  { id: 'rabu', nameId: 'Rabu', nameEn: 'Wednesday', shortId: 'Rab', shortEn: 'Wed', dayIndex: 3 },
  { id: 'kamis', nameId: 'Kamis', nameEn: 'Thursday', shortId: 'Kam', shortEn: 'Thu', dayIndex: 4 },
  { id: 'jumat', nameId: 'Jumat', nameEn: 'Friday', shortId: 'Jum', shortEn: 'Fri', dayIndex: 5 },
  { id: 'sabtu', nameId: 'Sabtu', nameEn: 'Saturday', shortId: 'Sab', shortEn: 'Sat', dayIndex: 6 },
  { id: 'minggu', nameId: 'Minggu', nameEn: 'Sunday', shortId: 'Min', shortEn: 'Sun', dayIndex: 0 },
];

export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Format "June, 18 2025" like in the screenshot
export function formatHeaderDate(date: Date): string {
  const month = MONTH_NAMES[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}, ${day} ${year}`;
}

// Format "June 2025" for mini calendar
export function formatMonthYear(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export interface CalendarDay {
  date: Date;
  iso: string;
  dayNumber: number;
  dayNameId: string;
  dayNameEn: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export interface WeekRow {
  weekIndex: number; // 0, 1, 2, 3, 4
  weekNumber: number; // 1, 2, 3, 4, 5
  weekLabel: string; // "Week 1", "Week 2", ...
  weekLabelId: string; // "Minggu 1", "Minggu 2", ...
  dateRangeLabel: string; // e.g. "15 - 21 Jun"
  days: CalendarDay[]; // exactly 7 days: Senin - Minggu
  isCurrentWeek: boolean;
}

// Generate the 35 or 42 grid cells for mini calendar
export function generateMonthGrid(viewDate: Date, selectedDate: Date): CalendarDay[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDayIndex = firstDayOfMonth.getDay(); // 0 is Sunday

  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const grid: CalendarDay[] = [];
  const todayIso = formatDateToISO(new Date());
  const selectedIso = formatDateToISO(selectedDate);

  // Previous month trailing days
  for (let i = startDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const date = new Date(year, month - 1, d);
    const iso = formatDateToISO(date);
    const dayOfWeek = (date.getDay() + 6) % 7;
    grid.push({
      date,
      iso,
      dayNumber: d,
      dayNameId: WEEKDAYS_SENIN_MINGGU[dayOfWeek].nameId,
      dayNameEn: WEEKDAYS_SENIN_MINGGU[dayOfWeek].nameEn,
      isCurrentMonth: false,
      isToday: iso === todayIso,
      isSelected: iso === selectedIso,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const date = new Date(year, month, d);
    const iso = formatDateToISO(date);
    const dayOfWeek = (date.getDay() + 6) % 7;
    grid.push({
      date,
      iso,
      dayNumber: d,
      dayNameId: WEEKDAYS_SENIN_MINGGU[dayOfWeek].nameId,
      dayNameEn: WEEKDAYS_SENIN_MINGGU[dayOfWeek].nameEn,
      isCurrentMonth: true,
      isToday: iso === todayIso,
      isSelected: iso === selectedIso,
    });
  }

  // Next month leading days (fill up to 35 or 42)
  const remaining = (7 - (grid.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    const iso = formatDateToISO(date);
    const dayOfWeek = (date.getDay() + 6) % 7;
    grid.push({
      date,
      iso,
      dayNumber: d,
      dayNameId: WEEKDAYS_SENIN_MINGGU[dayOfWeek].nameId,
      dayNameEn: WEEKDAYS_SENIN_MINGGU[dayOfWeek].nameEn,
      isCurrentMonth: false,
      isToday: iso === todayIso,
      isSelected: iso === selectedIso,
    });
  }

  return grid;
}

// Generate the weeks of a month starting on Monday (Senin) and ending Sunday (Minggu)
export function getMonthWeeks(viewDate: Date, selectedDate: Date): WeekRow[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const selectedIso = formatDateToISO(selectedDate);
  const todayIso = formatDateToISO(new Date());

  const firstDayOfMonth = new Date(year, month, 1);
  // Calculate first Monday on or before the 1st of month
  // In JS: 0=Sun, 1=Mon, ..., 6=Sat
  const dayOfWeek = firstDayOfMonth.getDay();
  // Offset back to Monday: if Sun(0), offset is 6. If Mon(1), offset is 0. If Tue(2), offset is 1.
  const offsetToMonday = (dayOfWeek + 6) % 7;
  const currentMonday = new Date(year, month, 1 - offsetToMonday);

  const lastDayOfMonth = new Date(year, month + 1, 0);
  const weeks: WeekRow[] = [];
  let weekNum = 1;

  while (currentMonday <= lastDayOfMonth || weeks.length < 4) {
    const weekDays: CalendarDay[] = [];
    let isCurrentWeek = false;

    for (let i = 0; i < 7; i++) {
      const d = new Date(currentMonday);
      d.setDate(currentMonday.getDate() + i);
      const iso = formatDateToISO(d);
      const isSelected = iso === selectedIso;
      if (isSelected) {
        isCurrentWeek = true;
      }

      weekDays.push({
        date: d,
        iso,
        dayNumber: d.getDate(),
        dayNameId: WEEKDAYS_SENIN_MINGGU[i].nameId,
        dayNameEn: WEEKDAYS_SENIN_MINGGU[i].nameEn,
        isCurrentMonth: d.getMonth() === month,
        isToday: iso === todayIso,
        isSelected,
      });
    }

    const startD = weekDays[0].date;
    const endD = weekDays[6].date;
    const startStr = `${startD.getDate()} ${MONTH_NAMES[startD.getMonth()].substring(0, 3)}`;
    const endStr = `${endD.getDate()} ${MONTH_NAMES[endD.getMonth()].substring(0, 3)}`;
    const dateRangeLabel = `${startStr} - ${endStr}`;

    weeks.push({
      weekIndex: weekNum - 1,
      weekNumber: weekNum,
      weekLabel: `Week ${weekNum}`,
      weekLabelId: `Minggu ${weekNum}`,
      dateRangeLabel,
      days: weekDays,
      isCurrentWeek,
    });

    // Move to next Monday
    currentMonday.setDate(currentMonday.getDate() + 7);
    weekNum++;

    // Safety limit to avoid infinite loop
    if (weekNum > 6) break;
  }

  return weeks;
}

// Get the Monday-anchored 7 days (Senin - Minggu) for a single week view
export function getWeekDaysSeninMinggu(referenceDate: Date): { 
  date: Date; 
  iso: string; 
  dayNameId: string; 
  dayNameEn: string; 
  dayNumber: number; 
  isSelected: boolean 
}[] {
  const current = new Date(referenceDate);
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(current.setDate(diff));

  const week = [];
  const selectedIso = formatDateToISO(referenceDate);

  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    const iso = formatDateToISO(nextDay);
    week.push({
      date: nextDay,
      iso,
      dayNameId: WEEKDAYS_SENIN_MINGGU[i].nameId,
      dayNameEn: WEEKDAYS_SENIN_MINGGU[i].nameEn,
      dayNumber: nextDay.getDate(),
      isSelected: iso === selectedIso,
    });
  }

  return week;
}

// Convert "09:45 AM" or "09:45" to float hour (e.g. 9.75)
export function parseTimeToHour(timeStr: string): number {
  const cleaned = timeStr.trim().toUpperCase();
  const isPM = cleaned.includes('PM');
  const isAM = cleaned.includes('AM');
  const timeOnly = cleaned.replace(/[AP]M/, '').trim();
  const [hStr, mStr] = timeOnly.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);

  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;

  return h + m / 60;
}

export function formatHourToString(hour: number): string {
  const wholeHour = Math.floor(hour);
  const minutes = Math.round((hour - wholeHour) * 60);
  const period = wholeHour >= 12 ? 'PM' : 'AM';
  const displayHour = wholeHour % 12 === 0 ? 12 : wholeHour % 12;
  const displayMinutes = String(minutes).padStart(2, '0');
  return `${String(displayHour).padStart(2, '0')}:${displayMinutes} ${period}`;
}
