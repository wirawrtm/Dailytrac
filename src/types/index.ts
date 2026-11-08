export type EventCategory = 
  | 'meetings' 
  | 'due_dates' 
  | 'milestones' 
  | 'deadlines' 
  | 'personal' 
  | 'birthdays';

export type EventColorTheme = 'purple' | 'indigo' | 'cyan' | 'peach' | 'pink' | 'emerald';

export interface Attendee {
  name: string;
  avatar: string;
  role?: string;
  email?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export type WorkOutline = 'Work' | 'Improvement' | 'Buy';

export interface TaskEvent {
  id: string;
  title: string; // Task Title
  outline?: WorkOutline; // Main Outline: 'Work' | 'Improvement'
  department?: string; // Department
  description?: string; // Description
  date: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD (optional)
  subtitle?: string;
  startTime?: string; // "09:00 AM" or "09:00"
  endTime?: string; // "10:00 AM" or "10:00"
  startHour: number; // 9.5 for 09:30
  durationHours: number; // 1 for 1 hour
  category: EventCategory;
  colorTheme: EventColorTheme;
  attendees?: Attendee[];
  additionalCount?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  location?: string;
  subtasks?: Subtask[];
  meetingLink?: string;
}

export type FilterState = Record<string, boolean>;

export interface DepartmentItem {
  id: string;
  name: string;
  outline: WorkOutline;
  colorTheme: EventColorTheme;
  dotColor: string;
}

export type ViewMode = 'daily' | 'weekly' | 'monthly' | 'tasks' | 'settings' | 'appscript' | 'database';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  timezone: string;
  role?: string;
}
