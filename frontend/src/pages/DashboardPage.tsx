import { useMonitoringDashboard, type ConnectionStatus } from "../hooks/useMonitoringDashboard.js";
import { OverallStatusBanner } from "../components/OverallStatusBanner.js";
import { SegmentChain } from "../components/SegmentChain.js";
import { IncidentPanel } from "../components/IncidentPanel.js";
import { ThemeToggle } from "../components/ThemeToggle.js";

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

export function DashboardPage() {
  const { nodes, activeIncidents, loading, error, connectionStatus } = useMonitoringDashboard();

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">Soporte de Red Industrial</h1>
          <p className="text-sm text-ink-muted">Enlace remoto — planta</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
            <span className={`h-1.5 w-1.5 rounded-full ${CONNECTION_COLOR[connectionStatus]}`} />
            {CONNECTION_LABEL[connectionStatus]}
          </span>
          <ThemeToggle />
        </div>
      </header>

      {loading ? (
        <p className="text-ink-muted">Cargando estado del enlace…</p>
      ) : error ? (
        <div className="rounded-lg border border-status-down/40 bg-status-down/10 px-4 py-3 text-status-down">
          No se pudo cargar el estado del enlace: {error}
        </div>
      ) : (
        <>
          <OverallStatusBanner incidents={activeIncidents} />

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">Tramos del enlace</h2>
            <SegmentChain nodes={nodes} />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">Incidentes activos</h2>
            <IncidentPanel incidents={activeIncidents} nodes={nodes} />
          </section>
        </>
      )}
    </div>
  );
}
