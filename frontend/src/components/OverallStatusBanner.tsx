import type { IncidentResponseDTO } from "../types/monitoring.js";

type OverallStatus = "operational" | "degraded" | "down";

function deriveOverallStatus(incidents: IncidentResponseDTO[]): OverallStatus {
  if (incidents.some((incident) => incident.type === "HEARTBEAT_TIMEOUT")) return "down";
  if (incidents.length > 0) return "degraded";
  return "operational";
}

const COPY: Record<OverallStatus, { label: string; dotColor: string }> = {
  operational: { label: "Enlace operativo", dotColor: "bg-status-up" },
  degraded: { label: "Enlace degradado", dotColor: "bg-status-degraded" },
  down: { label: "Enlace sin comunicación", dotColor: "bg-status-down" },
};

export function OverallStatusBanner({ incidents }: { incidents: IncidentResponseDTO[] }) {
  const overall = deriveOverallStatus(incidents);
  const copy = COPY[overall];

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-raised px-5 py-4">
      <span className={`h-3 w-3 shrink-0 rounded-full ${copy.dotColor} transition-colors duration-200`} />
      <div className="flex flex-col">
        <span className="text-lg font-semibold text-ink">{copy.label}</span>
        {incidents.length > 0 && (
          <span className="text-sm text-ink-muted">
            {incidents.length} {incidents.length === 1 ? "incidente activo" : "incidentes activos"}
          </span>
        )}
      </div>
    </div>
  );
}
