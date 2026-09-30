import { useEffect, useState } from "react";
import { useSessions } from "../../context/SessionsContext.js";
import { useTopology } from "../../context/TopologyContext.js";

function elapsedLabel(startedAt: string, now: number): string {
  const seconds = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

function remainingLabel(startedAt: string, maxDurationSeconds: number, now: number): string {
  const elapsed = Math.floor((now - new Date(startedAt).getTime()) / 1000);
  const remaining = Math.max(0, maxDurationSeconds - elapsed);
  const minutes = Math.floor(remaining / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (remaining % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function SesionesActivasPage() {
  const { activeSessions, endSession } = useSessions();
  const { equipos } = useTopology();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const sitioDe = (equipoId: string): string => equipos.find((equipo) => equipo.id === equipoId)?.sitioNombre ?? "—";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="page-title">Sesiones activas</h1>
        <p className="page-subtitle">Conexiones remotas en curso, de todos los usuarios</p>
      </div>

      {activeSessions.length === 0 ? (
        <div className="empty-state">No hay sesiones activas en este momento.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Equipo</th>
                <th className="px-4 py-3 font-medium">Sitio</th>
                <th className="px-4 py-3 font-medium">Inicio</th>
                <th className="px-4 py-3 font-medium">Transcurrido</th>
                <th className="px-4 py-3 font-medium">Restante</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {activeSessions.map((session) => (
                <tr key={session.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-ink">{session.userName}</td>
                  <td className="px-4 py-3 text-ink-muted">{session.equipoNombre}</td>
                  <td className="px-4 py-3 text-ink-muted">{sitioDe(session.equipoId)}</td>
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {new Date(session.startedAt).toLocaleTimeString("es-BO")}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-muted">{elapsedLabel(session.startedAt, now)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-status-up">
                    {remainingLabel(session.startedAt, session.maxDurationSeconds, now)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void endSession(session.id)}
                      className="text-xs text-status-down hover:underline"
                    >
                      Cerrar sesión
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
