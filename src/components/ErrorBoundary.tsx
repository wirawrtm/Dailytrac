import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { firebaseConfig, FirestoreErrorInfo } from '../firebase';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
  parsedInfo: FirestoreErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
    parsedInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    let parsedInfo: FirestoreErrorInfo | null = null;
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed === 'object' && 'operationType' in parsed) {
        parsedInfo = parsed as FirestoreErrorInfo;
      }
    } catch {
      // standard error
    }
    return {
      hasError: true,
      errorMessage: error.message || 'Terjadi kesalahan pada aplikasi.',
      parsedInfo,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, errorMessage: '', parsedInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const rawError = this.state.parsedInfo?.error || this.state.errorMessage;
      const isQuotaError = rawError.includes('Quota exceeded');
      const isFreeTierDailyQuota = rawError.includes("Free daily read units per project");
      const upgradeUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data?openUpgradeDialog=true`;

      return (
        <div className="h-full w-full flex items-center justify-center bg-[#eef3f1] p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-6 flex flex-col gap-4 text-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {isQuotaError ? 'Kuota Firestore Terlampaui' : 'Terjadi Kesalahan Database'}
                </h2>
                <p className="text-xs text-slate-500">
                  {this.state.parsedInfo
                    ? `Operasi: ${this.state.parsedInfo.operationType} (${this.state.parsedInfo.path || '-'})`
                    : 'Sinkronisasi Firebase mengalami kendala.'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 break-words font-mono">
              {isQuotaError
                ? 'Quota exceeded. Kuota harian gratis akan di-reset besok. Detail kuota tersedia di kolom Spark plan (Enterprise edition) pada Firebase Pricing.'
                : rawError}
            </div>

            {isFreeTierDailyQuota && (
              <a
                href={upgradeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors"
              >
                <span>Buka Firebase Console Upgrade</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              type="button"
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#00796b] hover:bg-[#00695c] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Muat Ulang Aplikasi</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
