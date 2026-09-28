import { useEffect, useState } from "react";
import { getDashboardSummary, listIncidents } from "../api/monitoring.js";
import type { IncidentResponseDTO, IncidentType, NodeResponseDTO } from "../types/monitoring.js";

const TYPE_LABEL: Record<IncidentType, string> = {
  INDIVIDUAL: "Individual",
  DEPENDENT: "Dependiente",
  HEARTBEAT_TIMEOUT: "Silencio del gateway",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-BO", { dateStyle: "short", timeStyle: "medium" });
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "en curso";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

export function IncidentsHistoryPage() {
  const [incidents, setIncidents] = useState<IncidentResponseDTO[]>([]);
  const [nodes, setNodes] = useState<NodeResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listIncidents(), getDashboardSummary()])
      .then(([incidentList, summary]) => {
        setIncidents(incidentList);
        setNodes(summary.nodes);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const nodeName = (id: string): string => nodes.find((node) => node.id === id)?.name ?? "Nodo desconocido";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Historial de incidentes</h1>
        <p className="text-sm text-ink-muted">Registro de fallas detectadas en la red</p>
      </div>

      {loading ? (
        <p className="text-ink-muted">Cargando historial…</p>
      ) : error ? (
        <div className="rounded-lg border border-status-down/40 bg-status-down/10 px-4 py-3 text-status-down">
          No se pudo cargar el historial: {error}
        </div>
      ) : incidents.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface-raised px-4 py-6 text-center text-ink-muted">
          Todavía no hay incidentes registrados.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-raised text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-medium">Nodo</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Inicio</th>
                <th className="px-4 py-3 font-medium">Duración</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-ink">{nodeName(incident.nodeId)}</td>
                  <td className="px-4 py-3 text-ink-muted">{TYPE_LABEL[incident.type]}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs ${
                        incident.status === "ACTIVE" ? "text-status-down" : "text-status-up"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          incident.status === "ACTIVE" ? "bg-status-down" : "bg-status-up"
                        }`}
                      />
                      {incident.status === "ACTIVE" ? "Activo" : "Resuelto"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-muted">{formatDateTime(incident.startedAt)}</td>
                  <td className="px-4 py-3 text-ink-muted">{formatDuration(incident.durationSeconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
