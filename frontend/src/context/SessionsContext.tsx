import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AccessSessionRecord, SessionStatus } from "../types/session.js";
import { generateId } from "../utils/id.js";

const STORAGE_KEY = "access-sessions";

interface SessionsContextValue {
  sessions: AccessSessionRecord[];
  startSession: (data: {
    userId: string;
    userName: string;
    equipoId: string;
    equipoNombre: string;
    motivo: string;
    maxDurationSeconds: number;
  }) => string;
  endSession: (id: string, status: Exclude<SessionStatus, "ACTIVA">) => void;
}

const SessionsContext = createContext<SessionsContextValue | null>(null);

function readStoredSessions(): AccessSessionRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AccessSessionRecord[]) : [];
  } catch {
    return [];
  }
}

function writeStoredSessions(sessions: AccessSessionRecord[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // almacenamiento no disponible (ej. modo privado); las sesiones no persisten entre pestañas
  }
}

/**
 * Persistida en localStorage (no solo en memoria) para que "Sesiones activas" e "Historial de
 * accesos" reflejen conexiones iniciadas desde otra pestaña del mismo navegador — útil para
 * demostrar el módulo con dos roles distintos abiertos a la vez, sin backend real detrás.
 */
export function SessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<AccessSessionRecord[]>(readStoredSessions);

  useEffect(() => {
    function handleStorage(event: StorageEvent): void {
      if (event.key === STORAGE_KEY) setSessions(readStoredSessions());
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function persist(next: AccessSessionRecord[]): void {
    setSessions(next);
    writeStoredSessions(next);
  }

  const value: SessionsContextValue = {
    sessions,
    startSession: (data) => {
      const id = generateId("sesion");
      const record: AccessSessionRecord = {
        id,
        ...data,
        startedAt: new Date().toISOString(),
        endedAt: null,
        status: "ACTIVA",
      };
      persist([record, ...sessions]);
      return id;
    },
    endSession: (id, status) => {
      persist(
        sessions.map((session) =>
          session.id === id ? { ...session, status, endedAt: new Date().toISOString() } : session
        )
      );
    },
  };

  return <SessionsContext.Provider value={value}>{children}</SessionsContext.Provider>;
}

export function useSessions(): SessionsContextValue {
  const context = useContext(SessionsContext);
  if (!context) throw new Error("useSessions debe usarse dentro de SessionsProvider");
  return context;
}
