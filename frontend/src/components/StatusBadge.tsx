import type { NodeStatus } from "../types/monitoring.js";

const STATUS_LABEL: Record<NodeStatus, string> = {
  UP: "Disponible",
  DOWN: "Caído",
  UNKNOWN: "Sin datos",
};

const STATUS_COLOR: Record<NodeStatus, string> = {
  UP: "bg-status-up",
  DOWN: "bg-status-down",
  UNKNOWN: "bg-status-unknown",
};

export function StatusBadge({ status }: { status: NodeStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
      <span className={`h-2 w-2 rounded-full ${STATUS_COLOR[status]} transition-colors duration-200`} />
      {STATUS_LABEL[status]}
    </span>
  );
}
