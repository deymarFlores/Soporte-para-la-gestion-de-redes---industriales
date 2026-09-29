import { useEffect, useMemo, useState } from "react";
import { useMonitoringDashboard, type ConnectionStatus } from "../hooks/useMonitoringDashboard.js";
import { listIncidents } from "../api/monitoring.js";
import { SegmentChain } from "../components/SegmentChain.js";
import { KpiCard } from "../components/KpiCard.js";
import type { IncidentResponseDTO, IncidentType, NodeResponseDTO } from "../types/monitoring.js";

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

const TYPE_LABEL: Record<IncidentType, string> = {
  INDIVIDUAL: "Individual",
  DEPENDENT: "Dependiente",
  HEARTBEAT_TIMEOUT: "Silencio del gateway",
};

function countNodesByStatus(nodes: NodeResponseDTO[], activeIncidents: IncidentResponseDTO[]) {
  let operational = 0;
  let degraded = 0;
  let down = 0;
  let unknown = 0;

  for (const node of nodes) {
    if (node.currentStatus === "UP") {
      operational += 1;
    } else if (node.currentStatus === "UNKNOWN") {
      unknown += 1;
    } else {
      const incident = activeIncidents.find((candidate) => candidate.nodeId === node.id);
      if (incident?.type === "DEPENDENT") degraded += 1;
      else down += 1;
    }
  }

  return { operational, degraded, down, unknown };
}

function countSegments(nodes: NodeResponseDTO[]) {
  const segments = nodes.filter((node) => node.parentId !== null);
  const operational = segments.filter((node) => node.currentStatus === "UP").length;
  return { total: segments.length, operational, affected: segments.length - operational };
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-BO", { dateStyle: "short", timeStyle: "short" });
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "en curso";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

export function DashboardPage() {
  const { nodes, activeIncidents, loading, error, connectionStatus } = useMonitoringDashboard();
  const [recentIncidents, setRecentIncidents] = useState<IncidentResponseDTO[]>([]);

  useEffect(() => {
    listIncidents()
      .then((all) => setRecentIncidents(all.slice(0, 5)))
      .catch(() => setRecentIncidents([]));
  }, []);

  const nodeStatusCounts = useMemo(() => countNodesByStatus(nodes, activeIncidents), [nodes, activeIncidents]);
  const segmentCounts = useMemo(() => countSegments(nodes), [nodes]);
  const plcNode = useMemo(() => nodes.find((node) => node.type === "PLC") ?? null, [nodes]);
  const nodeName = (id: string): string => nodes.find((node) => node.id === id)?.name ?? "Nodo desconocido";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Estado general de la infraestructura</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
          <span className={`status-dot h-1.5 w-1.5 ${CONNECTION_COLOR[connectionStatus]}`} />
          {CONNECTION_LABEL[connectionStatus]}
        </span>
      </div>

      {loading ? (
        <p className="text-ink-muted">Cargando estado de la infraestructura…</p>
      ) : error ? (
        <div className="alert-danger">No se pudo cargar el estado de la infraestructura: {error}</div>
      ) : (
        <>
          <section className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
            <KpiCard label="Equipos operativos" value={nodeStatusCounts.operational} />
            <KpiCard label="Equipos degradados" value={nodeStatusCounts.degraded} />
            <KpiCard label="Equipos fuera de servicio" value={nodeStatusCounts.down} />
            <KpiCard label="Tramos operativos" value={segmentCounts.operational} />
            <KpiCard label="Tramos afectados" value={segmentCounts.affected} />
            <KpiCard label="Incidentes activos" value={activeIncidents.length} />
            <KpiCard label="Sesiones remotas activas" value={0} hint="Módulo en desarrollo" />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="section-label">Estado general del enlace</h2>
            <SegmentChain nodes={nodes} />
          </section>

          <section className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
            <KpiCard
              label="Disponibilidad"
              value={nodes.length > 0 ? `${Math.round((nodeStatusCounts.operational / nodes.length) * 100)}%` : "—"}
              hint="Equipos operativos / total"
            />
            <KpiCard label="Latencia promedio" value="—" hint="Aún no expuesta por el backend" />
            <KpiCard label="Pérdida de paquetes" value="—" hint="Aún no expuesta por el backend" />
            <KpiCard
              label="Estado del PLC"
              value={plcNode ? (plcNode.currentStatus === "UP" ? "Conectado" : "Sin conexión") : "—"}
              hint="Conectividad, no estado RUN/STOP"
            />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="section-label">Incidentes recientes</h2>
            {recentIncidents.length === 0 ? (
              <div className="empty-state">No hay incidentes registrados todavía.</div>
            ) : (
              <ul className="flex flex-col gap-2">
                {recentIncidents.map((incident) => (
                  <li key={incident.id} className="card flex items-center justify-between gap-4 px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-ink">{nodeName(incident.nodeId)}</span>
                      <span className="text-xs text-ink-muted">
                        {TYPE_LABEL[incident.type]} · {formatDateTime(incident.startedAt)}
                      </span>
                    </div>
                    <span
                      className={`whitespace-nowrap text-sm ${
                        incident.status === "ACTIVE" ? "text-status-down" : "text-status-up"
                      }`}
                    >
                      {incident.status === "ACTIVE" ? "Activo" : formatDuration(incident.durationSeconds)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="section-label">Sesiones remotas</h2>
            <div className="empty-state">
              No hay sesiones activas registradas — el módulo de acceso remoto está en desarrollo.
            </div>
          </section>
        </>
      )}
    </div>
  );
}
