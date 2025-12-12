import React, { useState, useEffect } from "react";
import { Activity, ChevronDown } from "lucide-react";
import { ServiceStatus, ServiceStatusType } from "../types";
import { fetchServiceStatus } from "../services/api";

const getStatusColor = (status: ServiceStatusType): string => {
  switch (status) {
    case ServiceStatusType.Operational:
      return "bg-green-500";
    case ServiceStatusType.Degraded:
      return "bg-yellow-500";
    case ServiceStatusType.Down:
      return "bg-red-500";
    default:
      return "bg-slate-500";
  }
};

const getStatusText = (status: ServiceStatusType): string => {
  switch (status) {
    case ServiceStatusType.Operational:
      return "Operacional";
    case ServiceStatusType.Degraded:
      return "Degradado";
    case ServiceStatusType.Down:
      return "Fora do ar";
    default:
      return "Desconhecido";
  }
};

export default function ServiceStatusWidget() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const data = await fetchServiceStatus();
        setServices(data?.services || []);
      } catch (err) {
        console.error("Failed to load service status", err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
    // Atualizar a cada 5 minutos
    const interval = setInterval(loadStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || services.length === 0) return null;

  // Determinar status geral (pior status entre todos os serviços)
  const hasDown = services.some((s) => s.status === ServiceStatusType.Down);
  const hasDegraded = services.some(
    (s) => s.status === ServiceStatusType.Degraded,
  );
  const overallStatus = hasDown
    ? ServiceStatusType.Down
    : hasDegraded
      ? ServiceStatusType.Degraded
      : ServiceStatusType.Operational;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/5 transition-colors text-sm text-slate-400 hover:text-slate-300"
      >
        <Activity size={14} />
        <span
          className={`w-2 h-2 rounded-full ${getStatusColor(overallStatus)}`}
        />
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-full max-w-64 bg-[#0f172a] border border-slate-800/50 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-slate-800/50">
              <h3 className="text-sm font-semibold text-white">
                Status dos Serviços
              </h3>
            </div>
            <div className="p-2 max-h-80 overflow-y-auto">
              {services.map((service) => (
                <a
                  key={service.name}
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded transition-colors cursor-pointer"
                >
                  <span className="text-sm text-slate-300 hover:text-white transition-colors">
                    {service.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {getStatusText(service.status)}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${getStatusColor(service.status)}`}
                    />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
