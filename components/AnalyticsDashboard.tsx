import { useEffect, useState } from "react";
import {
  RefreshCw,
  XCircle,
} from "lucide-react";
import { AnalyticsStatsResponse, ProcessingStepStats } from "../types";
import { fetchAnalyticsStats, saveStatsToHistory } from "../services/api";

function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-800/50 rounded-lg p-4">
            <div className="h-3 bg-slate-700/50 rounded w-16 mb-2" />
            <div className="h-8 bg-slate-700/50 rounded w-12" />
          </div>
        ))}
      </div>
      <div className="bg-slate-800/50 rounded-lg p-4">
        <div className="h-4 bg-slate-700/50 rounded w-32 mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6 bg-slate-700/50 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

function getHealthColor(successRate: number): string {
  if (successRate >= 90) return "bg-green-500";
  if (successRate >= 70) return "bg-yellow-500";
  return "bg-red-500";
}

function getHealthIcon(successRate: number) {
  const color = successRate >= 90 ? "bg-green-400" : successRate >= 70 ? "bg-yellow-400" : "bg-red-400";
  return <span className={`w-2 h-2 rounded-full ${color}`} />;
}

function ProcessingStep({ name, stats }: { name: string; stats: ProcessingStepStats }) {
  const successRate = stats.total > 0 ? (stats.successful / stats.total) * 100 : 0;
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {getHealthIcon(successRate)}
          <span className="text-slate-200 capitalize">{name}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span>{successRate.toFixed(0)}%</span>
          <span className="text-xs">{stats.avgDuration}ms</span>
        </div>
      </div>
      <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full ${getHealthColor(successRate)} transition-all`}
          style={{ width: `${successRate}%` }}
        />
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async (showRefresh = false, skipCache = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const result = await fetchAnalyticsStats(skipCache);
      setData(result);
      saveStatsToHistory(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(() => loadStats(true, true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="bg-slate-900/30 rounded-lg border border-slate-800/50 p-6">
        <SkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900/30 rounded-lg border border-slate-800/50 p-6 text-center">
        <XCircle size={32} className="text-red-400 mx-auto mb-3" />
        <p className="text-sm text-red-400 mb-3">{error}</p>
        <button
          onClick={() => loadStats()}
          className="text-sm text-blue-400 hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { warehouse, processing, generatedAt } = data;

  const warehouseStats = [
    { label: "Raw", value: warehouse.rawCount },
    { label: "Enriched", value: warehouse.enrichedCount },
    { label: "Ranked", value: warehouse.rankedCount },
    { label: "Mixed", value: warehouse.mixedCount },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/30 rounded-lg border border-slate-800/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-100">Warehouse</h3>
          </div>
          <button
            onClick={() => loadStats(true, true)}
            disabled={refreshing}
            className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors rounded"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {warehouseStats.map(({ label, value }) => (
            <div
              key={label}
              className="bg-slate-800/40 rounded-lg p-3 flex flex-col"
            >
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                {label}
              </div>
              <span className="text-2xl font-bold text-slate-100">
                {value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/30 rounded-lg border border-slate-800/50 p-4">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-semibold text-slate-100">Pipeline Health</h3>
        </div>

        <div className="space-y-4">
          <ProcessingStep name="fetch" stats={processing.fetch} />
          <ProcessingStep name="enrich" stats={processing.enrich} />
          <ProcessingStep name="rank" stats={processing.rank} />
          <ProcessingStep name="mix" stats={processing.mix} />
        </div>
      </div>

      <div className="bg-slate-900/30 rounded-lg border border-slate-800/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-semibold text-slate-100">Performance</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["fetch", "enrich", "rank", "mix"] as const).map((step) => (
            <div
              key={step}
              className="bg-slate-800/40 rounded-lg p-3 text-center"
            >
              <div className="text-xs text-slate-400 capitalize mb-1">{step}</div>
              <span className="text-lg font-semibold text-slate-100">
                {processing[step].avgDuration}
                <span className="text-xs text-slate-500 ml-0.5">ms</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-slate-500">
        Atualizado em {new Date(generatedAt).toLocaleString("pt-BR")}
      </div>
    </div>
  );
}
