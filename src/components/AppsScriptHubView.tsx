import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Save, 
  RotateCcw, 
  ExternalLink, 
  FileText, 
  Sparkles, 
  Terminal, 
  BookOpen, 
  Clock, 
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Link2,
  Globe,
  RefreshCw,
  AlertCircle,
  X
} from 'lucide-react';
import { 
  DEFAULT_APPSCRIPT_CODE, 
  DEFAULT_UPDATE_NOTES,
  STORAGE_KEY_CODE, 
  STORAGE_KEY_NOTES, 
  STORAGE_KEY_TITLE,
  getSavedWebhookUrl,
  saveWebhookUrl
} from '../data/appsScriptCode';

interface AppsScriptHubViewProps {
  onShowToast?: (msg: string) => void;
  onBackToCalendar?: () => void;
  onSyncSpreadsheet?: () => Promise<void>;
}

export const AppsScriptHubView: React.FC<AppsScriptHubViewProps> = ({
  onShowToast,
  onBackToCalendar,
  onSyncSpreadsheet,
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'notes'>('code');
  const [code, setCode] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CODE);
      return stored || DEFAULT_APPSCRIPT_CODE;
    } catch {
      return DEFAULT_APPSCRIPT_CODE;
    }
  });

  const [updateTitle, setUpdateTitle] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TITLE);
      return stored || 'Google Apps Script Sync Engine v2.0 (All-In-One)';
    } catch {
      return 'Google Apps Script Sync Engine v2.0 (All-In-One)';
    }
  });

  const [updateNotes, setUpdateNotes] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_NOTES);
      return stored || DEFAULT_UPDATE_NOTES;
    } catch {
      return DEFAULT_UPDATE_NOTES;
    }
  });

  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [isCopiedNotes, setIsCopiedNotes] = useState(false);
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Webhook URL state
  const [webhookUrl, setWebhookUrl] = useState<string>(() => getSavedWebhookUrl());
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSaveWebhook = (urlToSave?: string) => {
    const val = (urlToSave !== undefined ? urlToSave : webhookUrl).trim();
    saveWebhookUrl(val);
    setWebhookUrl(val);
    setWebhookTestResult(null);
    if (onShowToast) onShowToast(val ? 'Webhook URL berhasil disimpan!' : 'Webhook URL dihapus');
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) {
      if (onShowToast) onShowToast('Silakan paste Webhook URL terlebih dahulu');
      return;
    }
    setIsTestingWebhook(true);
    setWebhookTestResult(null);
    try {
      const testUrl = webhookUrl.includes('?') ? `${webhookUrl}&ping=1` : `${webhookUrl}?ping=1`;
      await fetch(testUrl, { method: 'GET', mode: 'no-cors' });
      setIsTestingWebhook(false);
      setWebhookTestResult({
        success: true,
        message: 'Koneksi ke Webhook Apps Script berhasil dihubungi!'
      });
      if (onShowToast) onShowToast('Koneksi Webhook berhasil!');
    } catch (err: any) {
      setIsTestingWebhook(false);
      setWebhookTestResult({
        success: false,
        message: 'Gagal menghubungi Webhook: ' + (err.message || 'Periksa kembali URL atau izin akses web app.')
      });
    }
  };

  // Sync to local storage
  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY_CODE, code);
      localStorage.setItem(STORAGE_KEY_NOTES, updateNotes);
      localStorage.setItem(STORAGE_KEY_TITLE, updateTitle);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      if (onShowToast) onShowToast('Perubahan Apps Script berhasil disimpan!');
    } catch {
      if (onShowToast) onShowToast('Gagal menyimpan ke penyimpanan lokal');
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopiedCode(true);
      setTimeout(() => setIsCopiedCode(false), 2500);
      if (onShowToast) onShowToast('Kode lengkap Apps Script (1 file) berhasil disalin!');
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setIsCopiedCode(true);
      setTimeout(() => setIsCopiedCode(false), 2500);
      if (onShowToast) onShowToast('Kode lengkap Apps Script (1 file) berhasil disalin!');
    }
  };

  const handleCopyNotes = async () => {
    try {
      await navigator.clipboard.writeText(updateNotes);
      setIsCopiedNotes(true);
      setTimeout(() => setIsCopiedNotes(false), 2500);
      if (onShowToast) onShowToast('Catatan update berhasil disalin!');
    } catch {
      setIsCopiedNotes(true);
      setTimeout(() => setIsCopiedNotes(false), 2500);
    }
  };

  const handleResetDefault = () => {
    setCode(DEFAULT_APPSCRIPT_CODE);
    setUpdateNotes(DEFAULT_UPDATE_NOTES);
    setUpdateTitle('Google Apps Script Sync Engine v2.0 (All-In-One)');
    localStorage.setItem(STORAGE_KEY_CODE, DEFAULT_APPSCRIPT_CODE);
    localStorage.setItem(STORAGE_KEY_NOTES, DEFAULT_UPDATE_NOTES);
    localStorage.setItem(STORAGE_KEY_TITLE, 'Google Apps Script Sync Engine v2.0 (All-In-One)');
    if (onShowToast) onShowToast('Template standar tunggal telah dipulihkan');
  };

  const currentDisplayCode = code;
  const lineCount = currentDisplayCode.split('\n').length;

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-50/60 overflow-y-auto select-none">
      {/* Top Header */}
      <div className="px-4 sm:px-6 py-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#00897b]/10 text-[#00897b] flex items-center justify-center shrink-0">
            <Terminal className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Apps Script Data & Update Hub
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                1 File Utuh (All-In-One)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Seluruh kode Sheets Database dan Google Calendar sudah disatukan ke dalam 1 file tunggal.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onBackToCalendar && (
            <button
              onClick={onBackToCalendar}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Kembali ke Kalender
            </button>
          )}

          <button
            onClick={handleResetDefault}
            title="Reset ke template standar tunggal"
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isSaved
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
            }`}
          >
            {isSaved ? <Check className="w-4 h-4 stroke-[3]" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Tersimpan!' : 'Simpan Update'}</span>
          </button>

          {/* Primary Copy Button */}
          <button
            onClick={handleCopyCode}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs md:text-sm shadow-md transition-all active:scale-95 cursor-pointer ${
              isCopiedCode
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                : 'bg-[#f6c445] hover:bg-[#eab32f] text-slate-900'
            }`}
          >
            {isCopiedCode ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Kode Tersalin! (1 File Siap Paste)</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 stroke-[2.5]" />
                <span>Copy Code Apps Script (1 File)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 md:p-8 flex-1 max-w-6xl w-full mx-auto flex flex-col gap-6">
        
        {/* Webhook URL Live Connection Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                webhookUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                <Link2 className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Koneksi Webhook Google Apps Script
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                    webhookUrl 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${webhookUrl ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    {webhookUrl ? 'Webhook Tersambung' : 'Belum Ada URL'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Setelah klik tombol <b>Deploy (Terapkan)</b> di Google Apps Script, salin URL Aplikasi Web lalu paste di kolom ini.
                </p>
              </div>
            </div>
          </div>

          {/* Input & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="Paste Webhook URL di sini: https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00897b]/20 focus:border-[#00897b] bg-slate-50/60 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleSaveWebhook()}
                className="px-4 py-2 rounded-xl bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Simpan URL</span>
              </button>

              <button
                type="button"
                onClick={handleTestWebhook}
                disabled={isTestingWebhook || !webhookUrl}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingWebhook ? 'animate-spin text-[#00897b]' : 'text-slate-500'}`} />
                <span>{isTestingWebhook ? 'Menguji...' : 'Tes Ping'}</span>
              </button>

              {onSyncSpreadsheet && (
                <button
                  type="button"
                  onClick={() => onSyncSpreadsheet()}
                  disabled={!webhookUrl}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Sinkronkan Data Spreadsheet</span>
                </button>
              )}

              {webhookUrl && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Hapus Webhook URL yang tersimpan?')) {
                      handleSaveWebhook('');
                    }
                  }}
                  className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Hapus URL"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Test Result Feedback */}
          {webhookTestResult && (
            <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
              webhookTestResult.success 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}>
              {webhookTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{webhookTestResult.message}</span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 flex-wrap gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-[#00897b]" />
              <span>1. Kode Lengkap (Tinggal Copy ke Code.gs)</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'notes'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-violet-600" />
              <span>2. Catatan Update & Info Versi</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'code' && (
              <button
                onClick={() => setIsEditingCode(!isEditingCode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isEditingCode
                    ? 'bg-teal-50 border-[#00897b] text-[#00897b]'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {isEditingCode ? 'Selesai Mengedit' : 'Edit Kode Manual'}
              </button>
            )}
            <a
              href="https://script.google.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-[#00897b] transition-colors cursor-pointer"
            >
              <span>Buka script.google.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Tab 1: Single Unified Code Viewer */}
        {activeTab === 'code' ? (
          <div className="flex flex-col gap-3">
            {/* Informational Banner */}
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-emerald-950">
                  Semua Kode Sudah Disatukan Jadi 1 File Saja
                </p>
                <p className="text-emerald-800 mt-0.5 leading-relaxed">
                  Bagian <b>Google Sheets (Penyimpan Data)</b> dan Bagian <b>Google Calendar (Jadwal Otomatis)</b> sudah dirangkum utuh dalam satu naskah. Anda tinggal klik tombol kuning <b>"Copy Code Apps Script (1 File)"</b> di atas lalu paste langsung ke file <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-900">Code.gs</code> di Apps Script.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
              {/* Code Box Bar */}
              <div className="px-5 py-3 bg-slate-900 text-slate-300 flex items-center justify-between border-b border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="ml-2 text-slate-300 font-sans font-bold">
                    Code.gs (All-In-One Unified Script: Sheets + Calendar)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    • {lineCount} baris
                  </span>
                </div>

                {/* Fast Copy Button inside code header */}
                <button
                  onClick={handleCopyCode}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${
                    isCopiedCode
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white'
                  }`}
                >
                  {isCopiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Body */}
              {isEditingCode ? (
                <div className="p-4 bg-slate-950">
                  <textarea
                    rows={26}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-transparent text-emerald-300 font-mono text-xs leading-relaxed focus:outline-none resize-y selection:bg-teal-800"
                    placeholder="Paste or write your Google Apps Script code here..."
                    spellCheck={false}
                  />
                </div>
              ) : (
                <div className="p-4 bg-slate-950 overflow-x-auto max-h-[580px] overflow-y-auto">
                  <pre className="text-emerald-300 font-mono text-xs leading-relaxed select-text">
                    <code>{currentDisplayCode}</code>
                  </pre>
                </div>
              )}

              {/* Bottom Code Bar */}
              <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Cukup 1 file: tempel langsung ke Code.gs dan klik Deploy.</span>
                <button
                  onClick={handleCopyCode}
                  className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Seluruh Kode (1 File)</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 3: Update Notes & Changelog */
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Data Update & Catatan Rilis Apps Script
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tuliskan informasi pembaharuan, parameter sheet, atau webhook URL yang sedang aktif.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyNotes}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCopiedNotes
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isCopiedNotes ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopiedNotes ? 'Catatan Tersalin!' : 'Copy Catatan'}</span>
                </button>
                <button
                  onClick={handleSave}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                >
                  Simpan Catatan
                </button>
              </div>
            </div>

            {/* Title / Version Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Judul / Versi Update
              </label>
              <input
                type="text"
                value={updateTitle}
                onChange={(e) => setUpdateTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00897b]/20 focus:border-[#00897b] transition-all bg-white"
                placeholder="Contoh: Apps Script Sync v1.3 - Update Work & Improvement Outline"
              />
            </div>

            {/* Notes Content */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Isi Catatan & Dokumentasi Update
              </label>
              <textarea
                rows={12}
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00897b]/20 focus:border-[#00897b] transition-all bg-slate-50 resize-y"
                placeholder="Tuliskan dokumentasi update kode disini..."
              />
            </div>
          </div>
        )}

        {/* 4-Step Quick Deployment Guide */}
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-3xl border border-teal-200/60 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#00897b]" />
            <h4 className="text-xs sm:text-sm font-bold text-teal-950">
              Panduan Cepat Deploy di Google Apps Script
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-white/80 p-3.5 rounded-2xl border border-teal-100 flex flex-col gap-1">
              <span className="w-5 h-5 rounded-full bg-[#00897b] text-white text-[11px] font-bold flex items-center justify-center">1</span>
              <p className="font-bold text-slate-900 mt-1">Buka script.google.com</p>
              <p className="text-[11px] text-slate-600">Klik "Proyek Baru" atau buka dari menu Ekstensi Google Spreadsheet.</p>
            </div>

            <div className="bg-white/80 p-3.5 rounded-2xl border border-teal-100 flex flex-col gap-1">
              <span className="w-5 h-5 rounded-full bg-[#00897b] text-white text-[11px] font-bold flex items-center justify-center">2</span>
              <p className="font-bold text-slate-900 mt-1">Copy & Tempel Kode</p>
              <p className="text-[11px] text-slate-600">Klik tombol <b>Copy Code</b> di atas dan paste menggantikan isi <code className="bg-slate-100 px-1 rounded">Code.gs</code>.</p>
            </div>

            <div className="bg-white/80 p-3.5 rounded-2xl border border-teal-100 flex flex-col gap-1">
              <span className="w-5 h-5 rounded-full bg-[#00897b] text-white text-[11px] font-bold flex items-center justify-center">3</span>
              <p className="font-bold text-slate-900 mt-1">Deploy Sebagai Web App</p>
              <p className="text-[11px] text-slate-600">Pilih <b>Terapkan &gt; Penerapan baru &gt; Aplikasi Web</b>, set akses ke <i>"Siapa saja"</i>.</p>
            </div>

            <div className="bg-white/80 p-3.5 rounded-2xl border border-teal-100 flex flex-col gap-1">
              <span className="w-5 h-5 rounded-full bg-[#00897b] text-white text-[11px] font-bold flex items-center justify-center">4</span>
              <p className="font-bold text-slate-900 mt-1">Salin Webhook URL</p>
              <p className="text-[11px] text-slate-600">Simpan URL aplikasi web untuk menghubungkan data langsung ke Task Tracker.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
