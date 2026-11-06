/**
 * Single source of truth for Google Apps Script Code (All-In-One v2.0)
 * Shared between AppsScriptHubView and DummyDatabaseView
 */

export const STORAGE_KEY_CODE = 'tasklio_appscript_code_v2';
export const STORAGE_KEY_NOTES = 'tasklio_appscript_notes_v2';
export const STORAGE_KEY_TITLE = 'tasklio_appscript_title_v2';

export const DEFAULT_APPSCRIPT_CODE = `/**
 * ============================================================================
 * GOOGLE APPS SCRIPT: UNIFIED TASK, SPREADSHEET & 2-WAY CALENDAR SYNC ENGINE
 * Model: Work & Improvement Outline Engine
 * Version: 2.0 (All-In-One Single Script)
 * ============================================================================
 * 
 * PETUNJUK PEMAKAIAN (CUKUP 1 FILE SAJA):
 * 1. Buka https://script.google.com -> Buat Proyek Baru
 *    (atau dari Google Sheet: Ekstensi > Apps Script).
 * 2. Hapus semua tulisan di file "Code.gs", lalu TEMPELKAN (PASTE) SELURUH KODE INI.
 * 3. Klik tombol Simpan (Ikon Disket).
 * 4. Klik tombol "Terapkan" (Deploy) di kanan atas > "Penerapan baru" (New deployment).
 * 5. Pilih jenis: "Aplikasi Web" (Web app).
 *    - Keterangan: "Tasklio Sync v2.0"
 *    - Jalankan sebagai: "Saya" (email Anda)
 *    - Yang memiliki akses: "Siapa saja" (Anyone)
 * 6. Klik "Terapkan" > Berikan izin akun Google Anda > Salin URL Web App yang muncul.
 * 
 * FITUR LENGKAP DALAM KODE INI:
 * [BAGIAN 1] PENCATAT GOOGLE SPREADSHEET:
 * - doGet(e)   : Mengambil daftar tugas terbaru dari Google Sheet (READ)
 * - doPost(e)  : Menambah baris tugas baru (appendRow), update status 'pending'/'completed', dan hapus baris
 * 
 * [BAGIAN 2] ASISTEN GOOGLE CALENDAR:
 * - createCalendarEvent(task) : Otomatis membuat jadwal kalender dengan prefix [Work] atau [Improvement]
 * - syncCalendarEvents()      : Sinkronisasi agenda dua arah dari Google Calendar
 */

// ============================================================================
// 1. KONFIGURASI GLOBAL
// ============================================================================
// Jika script ini dibuat dari Google Sheet (Ekstensi > Apps Script), biarkan kosong.
// Jika dibuat mandiri di script.google.com, isi dengan ID Spreadsheet Anda.
const SPREADSHEET_ID = "MASUKKAN_SPREADSHEET_ID_DISINI";
const SHEET_NAME_TASKS = "Tasks";
const CALENDAR_ID = "primary"; // Otomatis menggunakan Google Calendar utama Anda

// ============================================================================
// ★ FUNGSI INSTAN: BUAT TABEL & ISI BARIS DATA OTOMATIS (1X KLIK "JALANKAN")
// ============================================================================
/**
 * Jalankan fungsi ini 1x di editor Apps Script jika Google Sheet Anda masih kosong:
 * 1. Pilih fungsi "buatTabelDanIsiDataOtomatis" di toolbar atas Apps Script.
 * 2. Klik tombol "▶ Jalankan" (Run).
 * 3. Otomatis membuat tab DailyTasks & Departments lengkap dengan header dan baris data awal!
 */
function buatTabelDanIsiDataOtomatis() {
  const ss = getTargetSpreadsheet();
  
  // 1. Inisialisasi Sheet DailyTasks
  const taskSheet = initTaskSheet(ss);
  
  // Jika baris data masih kosong (hanya ada baris 1 header), isi baris contoh otomatis
  if (taskSheet.getLastRow() <= 1) {
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    const sampleTasks = [
      ["evt-1", "Standup Meeting", "Work", "Operations", "Weekly team sprint alignment and blocker discussions", today, today, "completed", new Date()],
      ["evt-2", "UX Audit Sync", "Improvement", "Product & Design", "Review user experience feedback and mobile interface", today, today, "pending", new Date()],
      ["evt-3", "Design Review", "Improvement", "Product & Design", "Feedback session for NovaBoard dark mode tokens", today, today, "completed", new Date()],
      ["evt-4", "Marketing Strategy", "Work", "Marketing & Sales", "Review Q3 inbound campaign KPIs and email flows", today, today, "pending", new Date()],
      ["evt-5", "Sprint Retrospective", "Work", "Engineering", "Sprint 14 retro and action items follow-up", today, today, "pending", new Date()],
      ["evt-6", "Finance Monthly Closing", "Work", "Finance", "Review expense reports and bank reconciliation", today, today, "completed", new Date()],
      ["evt-7", "HR Onboarding Session", "Work", "Human Resources", "Welcome new team members and workspace setup", today, today, "pending", new Date()]
    ];
    taskSheet.getRange(2, 1, sampleTasks.length, sampleTasks[0].length).setValues(sampleTasks);
    try { taskSheet.autoResizeColumns(1, 9); } catch (e) {}
  }
  
  // 2. Inisialisasi Sheet Departments
  let deptSheet = ss.getSheetByName("Departments");
  if (!deptSheet) {
    deptSheet = ss.insertSheet("Departments");
  }
  if (deptSheet.getLastRow() === 0) {
    deptSheet.appendRow(["Dept ID", "Dept Name", "Outline Default", "Color Theme", "Dot Color"]);
    deptSheet.setFrozenRows(1);
    deptSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#e8eaed");
    
    const sampleDepts = [
      ["operations", "Operations", "Work", "text-indigo-600 bg-indigo-50", "bg-indigo-500"],
      ["marketing", "Marketing & Sales", "Work", "text-amber-600 bg-amber-50", "bg-amber-500"],
      ["finance", "Finance", "Work", "text-teal-600 bg-teal-50", "bg-teal-500"],
      ["hr", "Human Resources", "Work", "text-rose-600 bg-rose-50", "bg-rose-500"],
      ["engineering", "Engineering", "Work", "text-cyan-600 bg-cyan-50", "bg-cyan-500"],
      ["design", "Product & Design", "Improvement", "text-purple-600 bg-purple-50", "bg-purple-500"]
    ];
    deptSheet.getRange(2, 1, sampleDepts.length, sampleDepts[0].length).setValues(sampleDepts);
    try { deptSheet.autoResizeColumns(1, 5); } catch (e) {}
  }
  
  Logger.log("SUKSES: Tabel Google Sheet dan seluruh baris data berhasil dibuat otomatis!");
  return "SUKSES: Tabel Google Sheet dan seluruh baris data berhasil dibuat otomatis!";
}

// ============================================================================
// 2. WEBHOOK GET (Membaca Data Tugas atau Kalender)
// ============================================================================
function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const ss = getTargetSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME_TASKS) || initTaskSheet(ss);
    
    // Opsi: Jika diminta data kalender via parameter ?action=calendar
    if (params.action === "calendar") {
      const calendarEvents = syncCalendarEvents();
      return responseJson({
        status: "success",
        count: calendarEvents.length,
        source: "Google Calendar",
        events: calendarEvents
      });
    }
    
    // Default: Ambil semua data baris tugas dari tab DailyTasks
    const rows = sheet.getDataRange().getValues();
    const tasks = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue;
      tasks.push({
        id: String(row[0]),
        title: String(row[1] || ""),
        outline: String(row[2] || "Work"),
        department: String(row[3] || "Operations"),
        description: String(row[4] || ""),
        date: formatDate(row[5]),
        dueDate: row[6] ? formatDate(row[6]) : "",
        status: String(row[7] || "pending"),
        lastModified: row[8] ? formatDate(row[8]) : ""
      });
    }
    
    return responseJson({
      status: "success",
      count: tasks.length,
      timestamp: new Date().toISOString(),
      tasks: tasks
    });
    
  } catch (err) {
    return responseJson({
      status: "error",
      message: err.toString()
    });
  }
}

// ============================================================================
// 3. WEBHOOK POST (Tambah Tugas, Update Status, Hapus Baris)
// ============================================================================
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action || "save_task";
    
    const ss = getTargetSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME_TASKS) || initTaskSheet(ss);
    
    // AKSI 1: Simpan Tugas Baru (appendRow)
    if (action === "save_task") {
      const task = payload.task || {};
      const newId = task.id || ("task_" + Utilities.getUuid().slice(0, 8));
      const todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
      
      sheet.appendRow([
        newId,
        task.title || "Untitled Task",
        task.outline || "Work",
        task.department || "Operations",
        task.description || "",
        task.date || todayStr,
        task.dueDate || "",
        task.status || "pending",
        new Date()
      ]);
      
      // Otomatis buat jadwal di Google Calendar (jika syncCalendar tidak dimatikan)
      let calendarCreated = false;
      if (payload.syncCalendar !== false) {
        calendarCreated = createCalendarEvent(task);
      }
      
      return responseJson({
        status: "success",
        message: "Tugas berhasil disimpan ke Google Sheets & Google Calendar",
        taskId: newId,
        calendarSynced: calendarCreated
      });
    }
    
    // AKSI 2: Update Status Tugas ('completed' atau 'pending')
    if (action === "update_status") {
      const { taskId, newStatus } = payload;
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(taskId)) {
          sheet.getRange(i + 1, 8).setValue(newStatus); // Kolom H: Status
          sheet.getRange(i + 1, 9).setValue(new Date());  // Kolom I: Last Modified
          return responseJson({
            status: "success",
            message: "Status tugas " + taskId + " berhasil diubah ke " + newStatus
          });
        }
      }
      return responseJson({ status: "not_found", message: "Task ID tidak ditemukan" });
    }
    
    // AKSI 3: Hapus Baris Tugas (Delete Row)
    if (action === "delete_task") {
      const { taskId, taskTitle } = payload;
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        const rowId = String(data[i][0]).trim();
        const rowTitle = String(data[i][1]).trim();
        const matchesId = taskId && rowId === String(taskId).trim();
        const matchesTitle = taskTitle && rowTitle.toLowerCase() === String(taskTitle).trim().toLowerCase();

        if (matchesId || matchesTitle) {
          sheet.deleteRow(i + 1);
          return responseJson({ status: "success", message: "Tugas berhasil dihapus dari Google Sheets" });
        }
      }
      return responseJson({ status: "not_found", message: "Tugas tidak ditemukan di Google Sheets" });
    }
    
    // AKSI 4: Sinkronisasi Kalender
    if (action === "sync_calendar") {
      const events = syncCalendarEvents();
      return responseJson({ status: "success", count: events.length, events: events });
    }
    
    // AKSI 5: Sinkronisasi Massal (Tulis / Timpa Semua Baris Data dari Website)
    if (action === "bulk_sync_tasks") {
      const tasks = payload.tasks || [];
      const currentLastRow = sheet.getLastRow();
      if (currentLastRow > 1) {
        sheet.deleteRows(2, currentLastRow - 1);
      }
      if (tasks.length > 0) {
        const rowsToInsert = tasks.map(function(t) {
          return [
            String(t.id || ""),
            String(t.title || "Untitled"),
            String(t.outline || "Work"),
            String(t.department || "Operations"),
            String(t.description || ""),
            String(t.date || ""),
            String(t.dueDate || ""),
            String(t.status || "pending"),
            new Date()
          ];
        });
        sheet.getRange(2, 1, rowsToInsert.length, rowsToInsert[0].length).setValues(rowsToInsert);
      }
      return responseJson({
        status: "success",
        message: "Berhasil menyinkronkan " + tasks.length + " tugas ke spreadsheet",
        count: tasks.length
      });
    }
    
    return responseJson({ status: "unknown_action", message: "Aksi tidak dikenali" });
    
  } catch (err) {
    return responseJson({ status: "error", message: err.toString() });
  }
}

// ============================================================================
// 4. BAGIAN GOOGLE CALENDAR (JADWAL & AGENDA OTOMATIS)
// ============================================================================

/**
 * Membuat jadwal otomatis di Google Calendar
 */
function createCalendarEvent(task) {
  try {
    const cal = CalendarApp.getCalendarById(CALENDAR_ID) || CalendarApp.getDefaultCalendar();
    if (!cal) return false;
    
    const taskDate = task.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    const startTimeStr = task.startTime || "09:00";
    const endTimeStr = task.endTime || "10:00";
    
    const startDate = new Date(taskDate + "T" + startTimeStr + ":00");
    const endDate = new Date(taskDate + "T" + endTimeStr + ":00");
    
    const outline = task.outline || "Work";
    const dept = task.department || "Operations";
    const title = "[" + outline + "] " + task.title + " (" + dept + ")";
    
    const desc = (task.description || "") + 
      "\\n\\n--- Info Tambahan Tasklio ---" +
      "\\nDepartemen: " + dept +
      "\\nOutline: " + outline +
      "\\nDue Date: " + (task.dueDate || "N/A");
    
    cal.createEvent(title, startDate, endDate, {
      description: desc
    });
    return true;
  } catch (e) {
    Logger.log("Gagal membuat agenda kalender: " + e.toString());
    return false;
  }
}

/**
 * Membaca event dari Google Calendar untuk sinkronisasi dua arah
 */
function syncCalendarEvents() {
  try {
    const cal = CalendarApp.getDefaultCalendar();
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const events = cal.getEvents(now, nextMonth);
    
    return events.map(function(e) {
      return {
        id: e.getId(),
        title: e.getTitle(),
        startTime: e.getStartTime().toISOString(),
        endTime: e.getEndTime().toISOString(),
        location: e.getLocation(),
        description: e.getDescription()
      };
    });
  } catch (e) {
    Logger.log("Gagal mengambil agenda kalender: " + e.toString());
    return [];
  }
}

// ============================================================================
// 5. FUNGSI PENDUKUNG (HELPER)
// ============================================================================

function getTargetSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID !== "MASUKKAN_SPREADSHEET_ID_DISINI") {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  throw new Error("Spreadsheet tidak terhubung. Buka Ekstensi > Apps Script langsung dari Google Sheet Anda, atau isi SPREADSHEET_ID di baris 44.");
}

function initTaskSheet(ss) {
  let sheet = ss.getSheetByName("Tasks") || ss.getSheetByName("DailyTasks") || ss.getSheetByName(SHEET_NAME_TASKS);
  if (!sheet) {
    const all = ss.getSheets();
    if (all.length === 1 && all[0].getLastRow() <= 1) {
      sheet = all[0];
      sheet.setName("Tasks");
    } else {
      sheet = ss.insertSheet("Tasks");
    }
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Task ID", 
      "Task Title", 
      "Outline (Work/Improvement)", 
      "Department", 
      "Description", 
      "Date", 
      "Due Date", 
      "Status", 
      "Last Modified"
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange("A1:I1").setFontWeight("bold").setBackground("#e6f4ea");
  }
  return sheet;
}

function formatDate(val) {
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return String(val || "");
}

function responseJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export const DEFAULT_UPDATE_NOTES = `## Catatan Pembaruan Apps Script (v2.0 All-In-One)
- **Tanggal Update**: 18 Juni 2025
- **Tujuan**: Menggabungkan seluruh kode (Google Sheets Database + Webhook + Google Calendar) menjadi 1 file tunggal siap pakai.
- **Pembaruan Utama**:
  1. **Satu File Utuh**: Bagian 1 (Spreadsheet) dan Bagian 2 (Kalender) disatukan di dalam \`Code.gs\`.
  2. **Tinggal Copy & Paste**: Cukup tekan tombol "Copy Code Apps Script" dan tempel langsung ke script.google.com.
  3. **Fitur Lengkap**: Mendukung penambahan tugas (\`save_task\`), update status (\`update_status\`), hapus baris (\`delete_task\`), dan pembuatan jadwal kalender otomatis dengan prefix \`[Work]\` atau \`[Improvement]\`.
- **Langkah Deploy Singkat**:
  1. Buka https://script.google.com (atau dari Google Sheet: Ekstensi > Apps Script).
  2. Tempel seluruh kode ini ke dalam file \`Code.gs\`.
  3. Klik Terapkan (Deploy) > Penerapan baru > Aplikasi Web > Akses: Siapa saja.
  4. Selesai!`;

export const STORAGE_KEY_WEBHOOK_URL = 'tasklio_appscript_webhook_url';

/**
 * Helper to fetch the latest code. If user edited it, returns stored version;
 * otherwise returns DEFAULT_APPSCRIPT_CODE.
 */
export const getLatestAppsScriptCode = (): string => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CODE);
    if (stored && stored.length > 50) {
      return stored;
    }
  } catch {
    // ignore
  }
  return DEFAULT_APPSCRIPT_CODE;
};

export const getSavedWebhookUrl = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEY_WEBHOOK_URL) || '';
  } catch {
    return '';
  }
};

export const saveWebhookUrl = (url: string): void => {
  try {
    localStorage.setItem(STORAGE_KEY_WEBHOOK_URL, url.trim());
  } catch {
    // ignore
  }
};

