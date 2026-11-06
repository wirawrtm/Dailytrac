import { getSavedWebhookUrl } from '../data/appsScriptCode';
import { TaskEvent, DepartmentItem } from '../types';
import { getEventOutline } from '../data/initialData';

export interface WebhookSyncResponse {
  synced: boolean;
  message?: string;
  error?: string;
}

/**
 * Sends a task creation / update / deletion payload to the Google Apps Script Webhook.
 * Uses no-cors with text/plain to avoid Google Apps Script CORS preflight redirect issues.
 */
export async function postToAppsScriptWebhook(
  action: 'save_task' | 'update_status' | 'delete_task' | 'sync_calendar' | 'bulk_sync_tasks',
  data: Record<string, any>
): Promise<WebhookSyncResponse> {
  const webhookUrl = getSavedWebhookUrl();

  if (!webhookUrl || !webhookUrl.trim()) {
    return {
      synced: false,
      error: 'Belum ada Webhook URL yang disimpan di aplikasi.'
    };
  }

  // Ensure valid URL format
  if (!webhookUrl.startsWith('https://script.google.com/macros/s/')) {
    return {
      synced: false,
      error: 'Format Webhook URL tidak valid. Harus dimulai dengan https://script.google.com/macros/s/.../exec'
    };
  }

  try {
    const payload = {
      action,
      timestamp: new Date().toISOString(),
      ...data
    };

    // Google Apps Script Web App: using text/plain prevents CORS preflight OPTIONS request
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    return {
      synced: true,
      message: 'Data berhasil dikirim ke Google Apps Script Webhook.'
    };
  } catch (err: any) {
    console.error('Failed to sync to Apps Script webhook:', err);
    return {
      synced: false,
      error: err.message || 'Gagal mengirim data ke Webhook'
    };
  }
}

/**
 * Syncs a task event to Google Spreadsheet via Apps Script doPost webhook
 */
export async function syncTaskToSpreadsheet(
  event: TaskEvent,
  departments: DepartmentItem[]
): Promise<WebhookSyncResponse> {
  const outline = getEventOutline(event, departments);
  const deptName = event.department || event.subtitle || 'Operations';

  return postToAppsScriptWebhook('save_task', {
    task: {
      id: event.id,
      title: event.title,
      outline,
      department: deptName,
      description: event.description || '',
      date: event.date,
      dueDate: event.dueDate || '',
      status: event.status || 'pending',
      startTime: event.startTime,
      endTime: event.endTime
    },
    syncCalendar: true
  });
}

/**
 * Syncs task status change to Google Spreadsheet
 */
export async function syncTaskStatusToSpreadsheet(
  taskId: string,
  newStatus: TaskEvent['status']
): Promise<WebhookSyncResponse> {
  return postToAppsScriptWebhook('update_status', {
    taskId,
    newStatus
  });
}

/**
 * Syncs task deletion to Google Spreadsheet
 */
export async function syncTaskDeleteToSpreadsheet(
  taskId: string,
  taskTitle?: string
): Promise<WebhookSyncResponse> {
  return postToAppsScriptWebhook('delete_task', {
    taskId,
    taskTitle
  });
}

/**
 * Bulk syncs all tasks from the website to Google Spreadsheet (overwriting sheet with current web data)
 */
export async function bulkSyncTasksToSpreadsheet(
  events: TaskEvent[],
  departments: DepartmentItem[]
): Promise<WebhookSyncResponse> {
  const formattedTasks = events.map((e) => ({
    id: e.id,
    title: e.title,
    outline: getEventOutline(e, departments),
    department: e.department || e.subtitle || 'Operations',
    description: e.description || '',
    date: e.date,
    dueDate: e.dueDate || '',
    status: e.status || 'pending'
  }));

  return postToAppsScriptWebhook('bulk_sync_tasks', {
    tasks: formattedTasks
  });
}

/**
 * Fetches all tasks from Google Spreadsheet via GET request
 */
export async function fetchTasksFromSpreadsheet(): Promise<{
  success: boolean;
  tasks?: TaskEvent[];
  error?: string;
}> {
  const webhookUrl = getSavedWebhookUrl();
  if (!webhookUrl || !webhookUrl.trim()) {
    return {
      success: false,
      error: 'Belum ada Webhook URL yang disimpan.'
    };
  }

  try {
    const fetchUrl = webhookUrl.includes('?') 
      ? `${webhookUrl}&action=get_tasks` 
      : `${webhookUrl}?action=get_tasks`;

    const res = await fetch(fetchUrl);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    if (data.status === 'success' && Array.isArray(data.tasks)) {
      const parsedTasks: TaskEvent[] = data.tasks.map((t: any) => ({
        id: String(t.id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`),
        title: String(t.title || 'Untitled Task'),
        department: String(t.department || 'Operations'),
        subtitle: String(t.department || 'Operations'),
        description: String(t.description || ''),
        date: String(t.date || new Date().toISOString().split('T')[0]),
        dueDate: t.dueDate ? String(t.dueDate) : undefined,
        status: t.status === 'completed' ? 'completed' : 'pending',
        startTime: '09:00',
        endTime: '10:00',
        category: 'meetings',
        colorTheme: t.outline === 'Improvement' ? 'purple' : 'cyan'
      }));
      return {
        success: true,
        tasks: parsedTasks
      };
    }
    return {
      success: false,
      error: data.message || 'Format data dari Google Spreadsheet tidak sesuai.'
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Gagal mengambil data dari Google Spreadsheet'
    };
  }
}

