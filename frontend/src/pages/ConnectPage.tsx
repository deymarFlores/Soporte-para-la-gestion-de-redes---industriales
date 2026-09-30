import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDashboardSummary } from "../api/monitoring.js";
import { useAuth } from "../context/AuthContext.js";
import { useSessions } from "../context/SessionsContext.js";
import type { NodeResponseDTO } from "../types/monitoring.js";
import type { AccessSessionRecord } from "../types/session.js";

type FlowState = "loading" | "not-allowed" | "unavailable" | "ready" | "requesting" | "connected" | "error";

const SESSION_SECONDS = 20 * 60;

export function ConnectPage() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { user } = useAuth();
  const { requestAccess, endSession } = useSessions();
  const navigate = useNavigate();

  const [node, setNode] = useState<NodeResponseDTO | null>(null);
  const [flow, setFlow] = useState<FlowState>("loading");
  const [motivo, setMotivo] = useState("");
  const [requestError, setRequestError] = useState<string | null>(null);
  const [session, setSession] = useState<AccessSessionRecord | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(SESSION_SECONDS);

  useEffect(() => {
    getDashboardSummary()
      .then((summary) => {
        const found = summary.nodes.find((candidate) => candidate.id === nodeId) ?? null;
        setNode(found);

        const allowed = Boolean(found && user?.allowedDeviceIds?.includes(found.id));
        if (!found || !allowed) setFlow("not-allowed");
        else if (found.currentStatus !== "UP") setFlow("unavailable");
        else setFlow("ready");
      })
      .catch(() => setFlow("error"));
  }, [nodeId, user]);

  useEffect(() => {
    if (flow !== "connected" || !session) return undefined;

    function tick(): void {
      const elapsed = (Date.now() - new Date(session!.startedAt).getTime()) / 1000;
      const remaining = Math.max(0, Math.round(session!.maxDurationSeconds - elapsed));
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        setSession(null);
        setFlow("ready");
      }
    }

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [flow, session]);

  async function startConnection(): Promise<void> {
    if (!node) return;
    setFlow("requesting");
    setRequestError(null);
    try {
      const newSession = await requestAccess({ nodeId: node.id, reason: motivo, maxDurationSeconds: SESSION_SECONDS });
      setSession(newSession);
      setFlow("connected");
    } catch (error) {
      setRequestError((error as Error).message);
      setFlow("ready");
    }
  }

  async function disconnect(): Promise<void> {
    if (session) await endSession(session.id);
    setSession(null);
    setFlow("ready");
  }

  const timeLabel = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (remainingSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [remainingSeconds]);

  if (flow === "loading") return <p className="text-ink-muted">Verificando acceso…</p>;

  if (flow === "not-allowed") {
    return <div className="alert-danger">No tienes autorización para conectarte a este equipo.</div>;
  }

  if (flow === "error" || !node) {
    return <div className="alert-danger">No se pudo cargar la información del equipo.</div>;
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <button
        type="button"
        onClick={() => navigate("/acceso-remoto/equipos")}
        className="w-fit text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
      >
        ← Volver a mis equipos
      </button>

      <div>
        <h1 className="page-title">Conectar a {node.name}</h1>
        <p className="font-mono text-sm text-ink-muted">{node.ip}</p>
      </div>

      <span className="w-fit rounded-full border border-border px-2.5 py-1 text-xs text-ink-muted">
        Sesión real y auditada — el túnel SSH hacia el equipo todavía es una simulación visual
      </span>

      {flow === "unavailable" && (
        <div className="alert-danger">
          Este equipo está caído en este momento. No es posible iniciar una conexión.
        </div>
      )}

      {(flow === "ready" || flow === "requesting") && (
        <div className="card flex flex-col gap-4 p-5">
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Usuario</dt>
              <dd className="text-ink">{user?.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Tiempo máximo de sesión</dt>
              <dd className="text-ink">{SESSION_SECONDS / 60} min</dd>
            </div>
          </dl>

          <div className="flex flex-col gap-1.5">
            <label className="field-label" htmlFor="motivo">
              Motivo de acceso
            </label>
            <input
              id="motivo"
              required
              placeholder="Ej. Ajuste de parámetros del PLC"
              className="input"
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              disabled={flow === "requesting"}
            />
          </div>

          {requestError && <p className="text-sm text-status-down">{requestError}</p>}

          <button
            type="button"
            onClick={() => void startConnection()}
            disabled={motivo.trim() === "" || flow === "requesting"}
            className="btn btn-primary w-fit px-4 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {flow === "requesting" ? "Solicitando…" : "Solicitar conexión"}
          </button>
        </div>
      )}

      {flow === "connected" && session && (
        <div className="alert-success flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-status-up">
              <span className="status-dot h-2 w-2 bg-status-up" />
              Conectado
            </span>
            <span className="font-mono text-sm text-ink">{timeLabel}</span>
          </div>

          <p className="text-sm text-ink-muted">
            Sesión #{session.id.slice(0, 8)} registrada y con tiempo limitado. Apunta TIA Portal a{" "}
            <code className="font-mono text-ink">127.0.0.1:102</code>.
          </p>

          <code className="overflow-x-auto rounded-md bg-surface px-3 py-2 font-mono text-xs text-ink-muted">
            ssh -L 102:localhost:40102 tunnel@vps.tu-dominio.com
          </code>

          <button type="button" onClick={() => void disconnect()} className="btn btn-danger-outline w-fit">
            Desconectar
          </button>
        </div>
      )}
    </div>
  );
}
