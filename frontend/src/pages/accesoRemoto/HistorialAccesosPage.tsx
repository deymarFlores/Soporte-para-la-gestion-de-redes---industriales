import { useMemo, useState } from "react";
import { useSessions } from "../../context/SessionsContext.js";
import { useTopology } from "../../context/TopologyContext.js";
import type { SessionStatus } from "../../types/session.js";

const STATUS_LABEL: Record<SessionStatus, string> = {
  ACTIVA: "Activa",
  FINALIZADA: "Finalizada",
  EXPIRADA: "Expirada por tiempo",
};

function formatDateTime(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString("es-BO", { dateStyle: "short", timeStyle: "short" }) : "—";
}

function formatDuration(startedAt: string, endedAt: string | null): string {
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  const seconds = Math.max(0, Math.floor((end - new Date(startedAt).getTime()) / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

export function HistorialAccesosPage() {
  const { sessions } = useSessions();
  const { equipos } = useTopology();

  const [userFilter, setUserFilter] = useState("");
  const [equipoFilter, setEquipoFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | SessionStatus>("");

  const sitioDe = (equipoId: string): string => equipos.find((equipo) => equipo.id === equipoId)?.sitioNombre ?? "—";

  const usuarios = useMemo(() => Array.from(new Set(sessions.map((session) => session.userName))), [sessions]);
  const equiposUsados = useMemo(() => Array.from(new Set(sessions.map((session) => session.equipoNombre))), [sessions]);

  const filtered = useMemo(
    () =>
      sessions.filter(
        (session) =>
          (userFilter === "" || session.userName === userFilter) &&
          (equipoFilter === "" || session.equipoNombre === equipoFilter) &&
          (statusFilter === "" || session.status === statusFilter)
      ),
    [sessions, userFilter, equipoFilter, statusFilter]
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="page-title">Historial de accesos</h1>
        <p className="page-subtitle">Auditoría de conexiones remotas pasadas</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select className="input w-44" value={userFilter} onChange={(event) => setUserFilter(event.target.value)}>
          <option value="">Todos los usuarios</option>
          {usuarios.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select className="input w-44" value={equipoFilter} onChange={(event) => setEquipoFilter(event.target.value)}>
          <option value="">Todos los equipos</option>
          {equiposUsados.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select
          className="input w-44"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as "" | SessionStatus)}
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVA">Activa</option>
          <option value="FINALIZADA">Finalizada</option>
          <option value="EXPIRADA">Expirada por tiempo</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No hay accesos registrados todavía.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Equipo</th>
                <th className="px-4 py-3 font-medium">Sitio</th>
                <th className="px-4 py-3 font-medium">Inicio</th>
                <th className="px-4 py-3 font-medium">Fin</th>
                <th className="px-4 py-3 font-medium">Duración</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((session) => (
                <tr key={session.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-ink">{session.userName}</td>
                  <td className="px-4 py-3 text-ink-muted">{session.equipoNombre}</td>
                  <td className="px-4 py-3 text-ink-muted">{sitioDe(session.equipoId)}</td>
                  <td className="px-4 py-3 text-xs text-ink-muted">{formatDateTime(session.startedAt)}</td>
                  <td className="px-4 py-3 text-xs text-ink-muted">{formatDateTime(session.endedAt)}</td>
                  <td className="px-4 py-3 text-ink-muted">{formatDuration(session.startedAt, session.endedAt)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs ${session.status === "ACTIVA" ? "text-status-up" : "text-ink-muted"}`}
                    >
                      {STATUS_LABEL[session.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{session.motivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
