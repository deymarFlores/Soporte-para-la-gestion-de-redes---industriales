import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getDashboardSummary } from "../api/monitoring.js";
import { API_URL } from "../api/client.js";
import type { NodeResponseDTO, IncidentResponseDTO, MonitoringUpdateEvent } from "../types/monitoring.js";

export type ConnectionStatus = "connecting" | "online" | "offline";

interface DashboardState {
  nodes: NodeResponseDTO[];
  activeIncidents: IncidentResponseDTO[];
  loading: boolean;
  error: string | null;
  connectionStatus: ConnectionStatus;
}

export function useMonitoringDashboard(): DashboardState {
  const [state, setState] = useState<DashboardState>({
    nodes: [],
    activeIncidents: [],
    loading: true,
    error: null,
    connectionStatus: "connecting",
  });

  useEffect(() => {
    let cancelled = false;

    getDashboardSummary()
      .then((summary) => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          nodes: summary.nodes,
          activeIncidents: summary.activeIncidents,
          loading: false,
        }));
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setState((prev) => ({ ...prev, loading: false, error: error.message }));
      });

    const socket: Socket = io(API_URL, { transports: ["websocket"] });

    socket.on("connect", () => setState((prev) => ({ ...prev, connectionStatus: "online" })));
    socket.on("disconnect", () => setState((prev) => ({ ...prev, connectionStatus: "offline" })));
    socket.on("connect_error", () => setState((prev) => ({ ...prev, connectionStatus: "offline" })));

    socket.on("monitoring:update", (event: MonitoringUpdateEvent) => {
      setState((prev) => {
        const nodesById = new Map(prev.nodes.map((node) => [node.id, node]));
        for (const updated of event.updatedNodes) nodesById.set(updated.id, updated);

        const incidentsById = new Map(prev.activeIncidents.map((incident) => [incident.id, incident]));
        for (const opened of event.openedIncidents) incidentsById.set(opened.id, opened);
        for (const resolved of event.resolvedIncidents) incidentsById.delete(resolved.id);

        return {
          ...prev,
          nodes: Array.from(nodesById.values()),
          activeIncidents: Array.from(incidentsById.values()),
        };
      });
    });

    return () => {
      cancelled = true;
      socket.disconnect();
    };
  }, []);

  return state;
}
