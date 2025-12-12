import React from "react";
import { WifiOff, AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center animate-[fadeIn_0.5s_ease-out]">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-red-500/20">
        <WifiOff className="text-red-400" size={32} />
      </div>

      <h3 className="text-xl font-semibold text-slate-100 mb-2">
        Ops, algo deu errado
      </h3>
    </div>
  );
}
