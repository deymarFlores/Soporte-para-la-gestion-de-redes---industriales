import type { IncidentResponseDTO, IncidentType, NodeResponseDTO } from "../types/monitoring.js";

const TYPE_LABEL: Record<IncidentType, string> = {
  INDIVIDUAL: "Individual",
  DEPENDENT: "Dependiente de otro tramo",
  HEARTBEAT_TIMEOUT: "Silencio del gateway",
};

function elapsedSince(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "hace instantes";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `hace ${hours} h ${minutes % 60} min`;
}

export function IncidentPanel({
  incidents,
  nodes,
}: {
  incidents: IncidentResponseDTO[];
  nodes: NodeResponseDTO[];
}) {
  if (incidents.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface-raised px-4 py-6 text-center text-ink-muted">
        No hay incidentes activos.
      </div>
    );
  }

  const nodeName = (id: string): string => nodes.find((node) => node.id === id)?.name ?? "Nodo desconocido";

  return (
    <ul className="flex flex-col gap-2">
      {incidents.map((incident) => (
        <li
          key={incident.id}
          className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface-raised px-4 py-3"
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-ink">{nodeName(incident.nodeId)}</span>
            <span className="text-xs text-ink-muted">{TYPE_LABEL[incident.type]}</span>
          </div>
          <span className="whitespace-nowrap text-sm text-status-down">{elapsedSince(incident.startedAt)}</span>
        </li>
      ))}
    </ul>
  );
}
