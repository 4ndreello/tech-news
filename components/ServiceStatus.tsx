import React, { useState, useEffect } from "react";
import { Signal, ChevronDown, CloudOff, Check, X } from "lucide-react";
import { ServiceStatus, ServiceStatusType, SourceStatus } from "../types";
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

interface ServiceStatusWidgetProps {
  feedSources?: SourceStatus[];
}

// Shared content component for both desktop dropdown and mobile bottom sheet
function StatusContent({ 
  feedSources, 
  services, 
  onClose 
}: { 
  feedSources?: SourceStatus[]; 
  services: ServiceStatus[];
  onClose?: () => void;
}) {
  return (
    <>
      {/* Mobile Header with close button */}
      {onClose && (
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800/50">
          <h2 className="text-lg font-semibold text-white">Status</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/5 text-slate-400"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Feed Sources Section */}
      {feedSources && feedSources.length > 0 && (
        <>
          <div className="p-3 border-b border-slate-800/50">
            <h3 className="text-sm font-semibold text-white">
              Fontes do Feed
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Último carregamento</p>
          </div>
          <div className="p-2 border-b border-slate-800/50">
            {feedSources.map((source) => (
              <div
                key={source.name}
                className="flex items-center justify-between px-3 py-2 rounded"
              >
                <span className="text-sm text-slate-300">
                  {source.name}
                </span>
                <div className="flex items-center gap-2">
                  {source.ok ? (
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  ) : (
                    <>
                      <span className="text-xs text-red-400 max-w-[100px] truncate" title={source.error || "Erro"}>
                        {source.error || "Erro"}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* External Services Section */}
      {services.length > 0 && (
        <>
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
        </>
      )}
    </>
  );
}

export default function ServiceStatusWidget({ feedSources }: ServiceStatusWidgetProps) {
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
    const interval = setInterval(loadStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Determinar status geral
  const hasDown = services.some((s) => s.status === ServiceStatusType.Down);
  const hasDegraded = services.some((s) => s.status === ServiceStatusType.Degraded);
  const hasFeedError = feedSources?.some((s) => !s.ok) || false;
  
  const overallStatus = hasDown || hasFeedError
    ? ServiceStatusType.Down
    : hasDegraded
      ? ServiceStatusType.Degraded
      : ServiceStatusType.Operational;

  if (loading && !feedSources?.length) return null;
  if (services.length === 0 && !feedSources?.length) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/5 transition-colors text-sm text-slate-400 hover:text-slate-300"
      >
        <Signal size={14} />
        <span className={`w-2 h-2 rounded-full ${getStatusColor(overallStatus)}`} />
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 md:bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Desktop Dropdown */}
          <div className="hidden md:block absolute right-0 mt-2 w-72 bg-[#0f172a] border border-slate-800/50 rounded-lg shadow-xl z-50 overflow-hidden">
            <StatusContent feedSources={feedSources} services={services} />
          </div>

          {/* Mobile Bottom Sheet */}
          <div className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-[#0f172a] rounded-t-2xl shadow-xl animate-slide-up">
            {/* Drag indicator */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-slate-700 rounded-full" />
            </div>
            {/* Scrollable content with max height */}
            <div className="max-h-[calc(80vh-3rem)] overflow-y-scroll pb-6 -webkit-overflow-scrolling-touch">
              <StatusContent 
                feedSources={feedSources} 
                services={services} 
                onClose={() => setIsOpen(false)} 
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
