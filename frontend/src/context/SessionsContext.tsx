import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { requestAccess as requestAccessApi, endSession as endSessionApi, listActiveSessions } from "../api/sessions.js";
import type { AccessSessionRecord } from "../types/session.js";

const POLL_INTERVAL_MS = 5000;

interface SessionsContextValue {
  activeSessions: AccessSessionRecord[];
  sessionsLoading: boolean;
  requestAccess: (input: { nodeId: string; reason: string; maxDurationSeconds: number }) => Promise<AccessSessionRecord>;
  endSession: (id: string) => Promise<void>;
  refreshActiveSessions: () => Promise<void>;
}

const SessionsContext = createContext<SessionsContextValue | null>(null);

/**
 * Las sesiones activas se consultan por polling (cada 5s) en vez de vía WebSocket: el backend
 * ya emite `sessions:update`, pero el frontend todavía no está suscrito a ese evento — ver nota
 * en el readme. El polling alcanza para reflejar expiraciones automáticas del servidor.
 */
export function SessionsProvider({ children }: { children: ReactNode }) {
  const [activeSessions, setActiveSessions] = useState<AccessSessionRecord[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  async function refreshActiveSessions(): Promise<void> {
    try {
      const sessions = await listActiveSessions();
      setActiveSessions(sessions);
    } catch {
      // se reintenta en el próximo ciclo de polling
    } finally {
      setSessionsLoading(false);
    }
  }

  useEffect(() => {
    void refreshActiveSessions();
    const timer = window.setInterval(() => void refreshActiveSessions(), POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  const value: SessionsContextValue = {
    activeSessions,
    sessionsLoading,
    requestAccess: async (input) => {
      const session = await requestAccessApi(input);
      await refreshActiveSessions();
      return session;
    },
    endSession: async (id) => {
      await endSessionApi(id);
      await refreshActiveSessions();
    },
    refreshActiveSessions,
  };

  return <SessionsContext.Provider value={value}>{children}</SessionsContext.Provider>;
}

export function useSessions(): SessionsContextValue {
  const context = useContext(SessionsContext);
  if (!context) throw new Error("useSessions debe usarse dentro de SessionsProvider");
  return context;
}
