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
        <h1 className="page-title">Mis equipos</h1>
        <p className="page-subtitle">Equipos a los que tienes acceso autorizado</p>
      </div>

      {loading ? (
        <p className="text-ink-muted">Cargando equipos…</p>
      ) : error ? (
        <div className="alert-danger">No se pudo cargar la lista de equipos: {error}</div>
      ) : myDevices.length === 0 ? (
        <div className="empty-state">No tienes equipos asignados todavía.</div>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {myDevices.map((device) => (
            <div key={device.id} className="card flex flex-col gap-3 p-5">
              <div className="flex flex-col gap-1">
                <span className="font-medium text-ink">{device.name}</span>
                <span className="font-mono text-xs text-ink-muted">{device.ip}</span>
              </div>
              <StatusBadge status={device.currentStatus} />
              {device.currentStatus === "UP" ? (
                <Link to={`/equipos/${device.id}/conectar`} className="btn btn-primary mt-2">
                  Conectar
                </Link>
              ) : (
                <button type="button" disabled className="btn btn-disabled mt-2">
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
