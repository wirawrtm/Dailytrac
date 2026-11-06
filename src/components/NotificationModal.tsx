import React from 'react';
import { X, Bell, Clock, Calendar, CheckCircle2, AlertTriangle, Users } from 'lucide-react';
import { TaskEvent } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: TaskEvent[];
  onSelectEvent: (event: TaskEvent) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  events,
  onSelectEvent,
}) => {
  if (!isOpen) return null;

  // Generate realistic notifications based on pending/upcoming meetings
  const notifications = [
    {
      id: 'notif-1',
      title: 'UX Huddle Call Starting Soon',
      message: 'Core Product Team is waiting in Google Meet (09:00 AM - 09:30 AM).',
      time: '10 min ago',
      type: 'urgent',
      eventId: 'evt-6',
    },
    {
      id: 'notif-2',
      title: 'New Invitation: Standup Meeting',
      message: 'NovaBoard Team tagged you in sprint blocker discussions.',
      time: '1 hour ago',
      type: 'info',
      eventId: 'evt-1',
    },
    {
      id: 'notif-3',
      title: 'Milestone Deadline Approaching',
      message: 'Sprint Check-in for Tasklio is set for tomorrow.',
      time: '3 hours ago',
      type: 'warning',
      eventId: 'evt-5',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#00897b]" />
            <h3 className="text-sm font-bold text-slate-900">Notifications & Alerts</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex flex-col gap-2.5">
          {notifications.map((n) => {
            const ev = events.find((e) => e.id === n.eventId);
            return (
              <div
                key={n.id}
                onClick={() => {
                  if (ev) {
                    onSelectEvent(ev);
                    onClose();
                  }
                }}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100/80 transition-all cursor-pointer flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{n.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                </div>
                <p className="text-xs text-slate-600">{n.message}</p>
                {ev && (
                  <span className="text-[10px] text-[#00897b] font-semibold mt-1">
                    Tap to open event details →
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
