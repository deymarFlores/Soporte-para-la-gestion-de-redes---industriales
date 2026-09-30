import { apiGet, apiPost } from "./client.js";
import type { AccessSessionRecord, SessionStatus } from "../types/session.js";

type ApiSessionStatus = "ACTIVE" | "ENDED" | "EXPIRED";

interface AccessSessionApiDTO {
  id: string;
  userId: string;
  userName: string;
  nodeId: string;
  nodeName: string;
  reason: string;
  maxDurationSeconds: number;
  status: ApiSessionStatus;
  startedAt: string;
  endedAt: string | null;
}

const STATUS_FROM_API: Record<ApiSessionStatus, SessionStatus> = {
  ACTIVE: "ACTIVA",
  ENDED: "FINALIZADA",
  EXPIRED: "EXPIRADA",
};

function toRecord(dto: AccessSessionApiDTO): AccessSessionRecord {
  return {
    id: dto.id,
    userId: dto.userId,
    userName: dto.userName,
    equipoId: dto.nodeId,
    equipoNombre: dto.nodeName,
    motivo: dto.reason,
    startedAt: dto.startedAt,
    endedAt: dto.endedAt,
    maxDurationSeconds: dto.maxDurationSeconds,
    status: STATUS_FROM_API[dto.status],
  };
}

export async function requestAccess(input: {
  nodeId: string;
  reason: string;
  maxDurationSeconds: number;
}): Promise<AccessSessionRecord> {
  const dto = await apiPost<AccessSessionApiDTO>("/api/acceso-remoto/solicitar", input);
  return toRecord(dto);
}

export async function endSession(id: string): Promise<AccessSessionRecord> {
  const dto = await apiPost<AccessSessionApiDTO>(`/api/acceso-remoto/sesiones/${id}/finalizar`);
  return toRecord(dto);
}

export async function listActiveSessions(): Promise<AccessSessionRecord[]> {
  const dtos = await apiGet<AccessSessionApiDTO[]>("/api/acceso-remoto/sesiones");
  return dtos.map(toRecord);
}

export async function listSessionHistory(): Promise<AccessSessionRecord[]> {
  const dtos = await apiGet<AccessSessionApiDTO[]>("/api/acceso-remoto/historial");
  return dtos.map(toRecord);
}
