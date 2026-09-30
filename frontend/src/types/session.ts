export type SessionStatus = "ACTIVA" | "FINALIZADA" | "EXPIRADA";

export interface AccessSessionRecord {
  id: string;
  userId: string;
  userName: string;
  equipoId: string;
  equipoNombre: string;
  motivo: string;
  startedAt: string;
  endedAt: string | null;
  maxDurationSeconds: number;
  status: SessionStatus;
}
