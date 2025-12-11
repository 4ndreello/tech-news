import React from 'react';
import { WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';

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
      
      <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
        {message}
      </p>
      
      <button 
        onClick={onRetry}
        className="group flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:border-white/20 text-slate-200"
      >
        <RefreshCw size={18} className="text-blue-400 group-hover:rotate-180 transition-transform duration-500" />
        <span>Tentar novamente</span>
      </button>
    </div>
  );
}
