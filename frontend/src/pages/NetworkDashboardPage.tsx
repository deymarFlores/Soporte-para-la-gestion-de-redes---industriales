import { useMonitoringDashboard, type ConnectionStatus } from "../hooks/useMonitoringDashboard.js";
import { OverallStatusBanner } from "../components/OverallStatusBanner.js";
import { SegmentChain } from "../components/SegmentChain.js";
import { IncidentPanel } from "../components/IncidentPanel.js";

const CONNECTION_LABEL: Record<ConnectionStatus, string> = {
  connecting: "Conectando…",
  online: "En vivo",
  offline: "Sin conexión en vivo",
};

const CONNECTION_COLOR: Record<ConnectionStatus, string> = {
  connecting: "bg-status-unknown",
  online: "bg-status-up",
  offline: "bg-status-down",
};

export function NetworkDashboardPage() {
  const { nodes, activeIncidents, loading, error, connectionStatus } = useMonitoringDashboard();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Estado de la red</h1>
          <p className="page-subtitle">Enlace remoto — planta</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
          <span className={`status-dot h-1.5 w-1.5 ${CONNECTION_COLOR[connectionStatus]}`} />
          {CONNECTION_LABEL[connectionStatus]}
        </span>
      </div>

      {loading ? (
        <p className="text-ink-muted">Cargando estado del enlace…</p>
      ) : error ? (
        <div className="alert-danger">No se pudo cargar el estado del enlace: {error}</div>
      ) : (
        <>
          <OverallStatusBanner incidents={activeIncidents} />

          <section className="flex flex-col gap-3">
            <h2 className="section-label">Tramos del enlace</h2>
            <SegmentChain nodes={nodes} />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="section-label">Incidentes activos</h2>
            <IncidentPanel incidents={activeIncidents} nodes={nodes} />
          </section>
        </>
      )}
    </div>
  );
}
