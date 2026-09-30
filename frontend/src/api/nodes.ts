import { apiGet, apiPost, apiPut, apiDelete } from "./client.js";
import type { EquipoInput, EquipoRecord } from "../types/topology.js";
import type { NodeResponseDTO } from "../types/monitoring.js";

export function toEquipoRecord(dto: NodeResponseDTO): EquipoRecord {
  return {
    id: dto.id,
    nombre: dto.name,
    tipo: dto.type,
    ip: dto.ip ?? "",
    sitioId: dto.siteId,
    descripcion: dto.description ?? "",
    parametrosMonitoreo: dto.monitoringParams ?? "",
    habilitado: dto.enabled,
    accesoRemotoHabilitado: dto.remoteAccessEnabled,
    parentId: dto.parentId,
  };
}

function toApiBody(input: Partial<EquipoInput>) {
  return {
    name: input.nombre,
    type: input.tipo,
    ip: input.ip,
    siteId: input.sitioId,
    description: input.descripcion,
    monitoringParams: input.parametrosMonitoreo,
    enabled: input.habilitado,
    remoteAccessEnabled: input.accesoRemotoHabilitado,
  };
}

export async function listEquipos(): Promise<NodeResponseDTO[]> {
  return apiGet<NodeResponseDTO[]>("/api/equipos");
}

export async function createEquipo(input: EquipoInput): Promise<NodeResponseDTO> {
  return apiPost<NodeResponseDTO>("/api/equipos", toApiBody(input));
}

export async function updateEquipo(id: string, input: Partial<EquipoInput>): Promise<NodeResponseDTO> {
  return apiPut<NodeResponseDTO>(`/api/equipos/${id}`, toApiBody(input));
}

export async function deleteEquipo(id: string): Promise<void> {
  await apiDelete<null>(`/api/equipos/${id}`);
}
