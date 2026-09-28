import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardSummary } from "../api/monitoring.js";
import { useAuth } from "../context/AuthContext.js";
import { StatusBadge } from "../components/StatusBadge.js";
import type { NodeResponseDTO } from "../types/monitoring.js";

export function EquipmentListPage() {
  const { user } = useAuth();
  const [nodes, setNodes] = useState<NodeResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardSummary()
      .then((summary) => {
        setNodes(summary.nodes);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const allowedIps = user?.allowedDeviceIps ?? [];
  const myDevices = nodes.filter((node) => node.ip && allowedIps.includes(node.ip));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Mis equipos</h1>
        <p className="text-sm text-ink-muted">Equipos a los que tienes acceso autorizado</p>
      </div>

      {loading ? (
        <p className="text-ink-muted">Cargando equipos…</p>
      ) : error ? (
        <div className="rounded-lg border border-status-down/40 bg-status-down/10 px-4 py-3 text-status-down">
          No se pudo cargar la lista de equipos: {error}
        </div>
      ) : myDevices.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface-raised px-4 py-6 text-center text-ink-muted">
          No tienes equipos asignados todavía.
        </div>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {myDevices.map((device) => (
            <div
              key={device.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-surface-raised p-5"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium text-ink">{device.name}</span>
                <span className="font-mono text-xs text-ink-muted">{device.ip}</span>
              </div>
              <StatusBadge status={device.currentStatus} />
              {device.currentStatus === "UP" ? (
                <Link
                  to={`/equipos/${device.id}/conectar`}
                  className="mt-2 rounded-md bg-accent px-3 py-2 text-center text-sm font-medium text-surface transition-colors duration-200 hover:bg-accent-strong active:scale-[0.98]"
                >
                  Conectar
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-2 cursor-not-allowed rounded-md border border-border px-3 py-2 text-sm text-ink-muted opacity-60"
                >
                  No disponible
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
