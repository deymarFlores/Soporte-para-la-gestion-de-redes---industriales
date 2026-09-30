import { apiGet, apiPost, apiPut, apiDelete } from "./client.js";
import type { SitioInput, SitioRecord } from "../types/topology.js";

interface SiteApiDTO {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

function toSitioRecord(dto: SiteApiDTO): SitioRecord {
  return {
    id: dto.id,
    nombre: dto.name,
    ubicacion: dto.location ?? "",
    descripcion: dto.description ?? "",
    habilitado: dto.enabled,
    createdAt: dto.createdAt,
  };
}

function toApiBody(input: Partial<SitioInput>) {
  return {
    name: input.nombre,
    location: input.ubicacion,
    description: input.descripcion,
    enabled: input.habilitado,
  };
}

export async function listSitios(): Promise<SitioRecord[]> {
  const dtos = await apiGet<SiteApiDTO[]>("/api/sitios");
  return dtos.map(toSitioRecord);
}

export async function createSitio(input: SitioInput): Promise<SitioRecord> {
  const dto = await apiPost<SiteApiDTO>("/api/sitios", toApiBody(input));
  return toSitioRecord(dto);
}

export async function updateSitio(id: string, input: Partial<SitioInput>): Promise<SitioRecord> {
  const dto = await apiPut<SiteApiDTO>(`/api/sitios/${id}`, toApiBody(input));
  return toSitioRecord(dto);
}

export async function deleteSitio(id: string): Promise<void> {
  await apiDelete<null>(`/api/sitios/${id}`);
}
