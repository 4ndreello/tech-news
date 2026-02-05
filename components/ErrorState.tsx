import React from "react";
import { WifiOff, Clock, ServerCrash, AlertTriangle, RefreshCw } from "lucide-react";
import { ErrorType, getErrorMessage } from "../utils/errorHandler";

interface ErrorStateProps {
  message: string;
  errorType?: ErrorType;
  retryCount?: number;
  maxRetries?: number;
  onRetry: () => void;
}

export default function ErrorState({
  message,
  errorType = ErrorType.Unknown,
  retryCount = 0,
  maxRetries = 3,
  onRetry
}: ErrorStateProps) {
  const errorInfo = getErrorMessage(errorType);

  const icons = {
    [ErrorType.Network]: WifiOff,
    [ErrorType.Timeout]: Clock,
    [ErrorType.ServerError]: ServerCrash,
    [ErrorType.NotFound]: AlertTriangle,
    [ErrorType.Unknown]: AlertTriangle,
  };

  const Icon = icons[errorType];

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-red-500/20">
        <Icon className="text-red-400" size={32} />
      </div>

      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {errorInfo.title}
      </h3>

      <p className="text-slate-600 dark:text-slate-400 mb-2">
        {errorInfo.message}
      </p>

      <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
        {errorInfo.suggestion}
      </p>

      {retryCount > 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
          Tentativa {retryCount} de {maxRetries}
        </p>
      )}

      <button
        onClick={onRetry}
        className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
      >
        <RefreshCw size={16} />
        Tentar novamente
      </button>
    </div>
  );
}
