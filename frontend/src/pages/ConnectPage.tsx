import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDashboardSummary } from "../api/monitoring.js";
import { useAuth } from "../context/AuthContext.js";
import type { NodeResponseDTO } from "../types/monitoring.js";

type FlowState =
  | "loading"
  | "not-allowed"
  | "unavailable"
  | "ready"
  | "checking"
  | "tunneling"
  | "connected"
  | "error";

const SESSION_SECONDS = 20 * 60;

export function ConnectPage() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [node, setNode] = useState<NodeResponseDTO | null>(null);
  const [flow, setFlow] = useState<FlowState>("loading");
  const [remainingSeconds, setRemainingSeconds] = useState(SESSION_SECONDS);
  const [mockPort, setMockPort] = useState<number | null>(null);

  useEffect(() => {
    getDashboardSummary()
      .then((summary) => {
        const found = summary.nodes.find((candidate) => candidate.id === nodeId) ?? null;
        setNode(found);

        const allowed = Boolean(found?.ip && user?.allowedDeviceIps?.includes(found.ip));
        if (!found || !allowed) setFlow("not-allowed");
        else if (found.currentStatus !== "UP") setFlow("unavailable");
        else setFlow("ready");
      })
      .catch(() => setFlow("error"));
  }, [nodeId, user]);

  useEffect(() => {
    if (flow !== "connected") return undefined;
    if (remainingSeconds <= 0) {
      setFlow("ready");
      return undefined;
    }
    const timer = window.setTimeout(() => setRemainingSeconds((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [flow, remainingSeconds]);

  function startConnection(): void {
    setFlow("checking");
    window.setTimeout(() => {
      setFlow("tunneling");
      window.setTimeout(() => {
        setMockPort(40000 + Math.floor(Math.random() * 10000));
        setRemainingSeconds(SESSION_SECONDS);
        setFlow("connected");
      }, 1400);
    }, 700);
  }

  function disconnect(): void {
    setFlow("ready");
    setMockPort(null);
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
    return (
      <div className="rounded-lg border border-status-down/40 bg-status-down/10 px-4 py-3 text-status-down">
        No tienes autorización para conectarte a este equipo.
      </div>
    );
  }

  if (flow === "error" || !node) {
    return (
      <div className="rounded-lg border border-status-down/40 bg-status-down/10 px-4 py-3 text-status-down">
        No se pudo cargar la información del equipo.
      </div>
    );
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <button
        type="button"
        onClick={() => navigate("/equipos")}
        className="w-fit text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
      >
        ← Volver a mis equipos
      </button>

      <div>
        <h1 className="text-xl font-semibold text-ink">Conectar a {node.name}</h1>
        <p className="font-mono text-sm text-ink-muted">{node.ip}</p>
      </div>

      <span className="w-fit rounded-full border border-border px-2.5 py-1 text-xs text-ink-muted">
        Vista previa — flujo simulado, pendiente de implementación real
      </span>

      {flow === "unavailable" && (
        <div className="rounded-lg border border-status-down/40 bg-status-down/10 px-4 py-3 text-status-down">
          Este equipo está caído en este momento. No es posible iniciar una conexión.
        </div>
      )}

      {flow === "ready" && (
        <button
          type="button"
          onClick={startConnection}
          className="w-fit rounded-md bg-accent px-4 py-2 text-sm font-medium text-surface transition-colors duration-200 hover:bg-accent-strong active:scale-[0.98]"
        >
          Conectar
        </button>
      )}

      {(flow === "checking" || flow === "tunneling") && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-raised px-4 py-3 text-ink-muted">
          <span className="h-2 w-2 animate-pulse rounded-full bg-status-degraded" />
          {flow === "checking"
            ? "Verificando disponibilidad del equipo…"
            : "Estableciendo túnel seguro (certificado temporal)…"}
        </div>
      )}

      {flow === "connected" && (
        <div className="flex flex-col gap-4 rounded-lg border border-status-up/40 bg-status-up/10 p-5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-status-up">
              <span className="h-2 w-2 rounded-full bg-status-up" />
              Conectado
            </span>
            <span className="font-mono text-sm text-ink">{timeLabel}</span>
          </div>

          <p className="text-sm text-ink-muted">
            Sesión válida por tiempo limitado. Apunta TIA Portal a{" "}
            <code className="font-mono text-ink">127.0.0.1:102</code>.
          </p>

          <code className="overflow-x-auto rounded-md bg-surface px-3 py-2 font-mono text-xs text-ink-muted">
            ssh -L 102:localhost:{mockPort} tunnel@vps.tu-dominio.com
          </code>

          <button
            type="button"
            onClick={disconnect}
            className="w-fit rounded-md border border-border px-3 py-2 text-sm text-ink-muted transition-colors duration-200 hover:border-status-down hover:text-status-down"
          >
            Desconectar
          </button>
        </div>
      )}
    </div>
  );
}
