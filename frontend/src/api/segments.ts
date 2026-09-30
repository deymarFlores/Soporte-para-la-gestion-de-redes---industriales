import { apiGet, apiPost, apiPut, apiDelete } from "./client.js";
import type { TramoInput, TramoRecord } from "../types/topology.js";

interface SegmentApiDTO {
  id: string;
  name: string;
  originId: string;
  destinationId: string;
  connectionType: string;
  monitoringMethod: string;
  checkIntervalSeconds: number;
  latencyThresholdMs: number;
  packetLossThresholdPct: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

function toTramoRecord(dto: SegmentApiDTO): TramoRecord {
  return {
    id: dto.id,
    nombre: dto.name,
    origenEquipoId: dto.originId,
    destinoEquipoId: dto.destinationId,
    tipoConexion: dto.connectionType,
    metodoMonitoreo: dto.monitoringMethod,
    intervaloComprobacionSegundos: dto.checkIntervalSeconds,
    umbralLatenciaMs: dto.latencyThresholdMs,
    umbralPerdidaPct: dto.packetLossThresholdPct,
    habilitado: dto.enabled,
  };
}

function toApiBody(input: Partial<TramoInput>) {
  return {
    name: input.nombre,
    originId: input.origenEquipoId,
    destinationId: input.destinoEquipoId,
    connectionType: input.tipoConexion,
    monitoringMethod: input.metodoMonitoreo,
    checkIntervalSeconds: input.intervaloComprobacionSegundos,
    latencyThresholdMs: input.umbralLatenciaMs,
    packetLossThresholdPct: input.umbralPerdidaPct,
    enabled: input.habilitado,
  };
}

export async function listTramos(): Promise<TramoRecord[]> {
  const dtos = await apiGet<SegmentApiDTO[]>("/api/tramos");
  return dtos.map(toTramoRecord);
}

export async function createTramo(input: TramoInput): Promise<TramoRecord> {
  const dto = await apiPost<SegmentApiDTO>("/api/tramos", toApiBody(input));
  return toTramoRecord(dto);
}

export async function updateTramo(id: string, input: Partial<TramoInput>): Promise<TramoRecord> {
  const dto = await apiPut<SegmentApiDTO>(`/api/tramos/${id}`, toApiBody(input));
  return toTramoRecord(dto);
}

export async function deleteTramo(id: string): Promise<void> {
  await apiDelete<null>(`/api/tramos/${id}`);
}
