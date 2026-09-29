import type { NodeType, NodeStatus } from "./monitoring.js";

export interface SitioRecord {
  id: string;
  nombre: string;
  ubicacion: string;
  descripcion: string;
  habilitado: boolean;
  createdAt: string;
}

export type SitioInput = Omit<SitioRecord, "id" | "createdAt">;

export interface EquipoRecord {
  id: string;
  nombre: string;
  tipo: NodeType;
  ip: string;
  sitioId: string;
  descripcion: string;
  parametrosMonitoreo: string;
  habilitado: boolean;
  accesoRemotoHabilitado: boolean;
  createdAt: string;
}

export type EquipoInput = Omit<EquipoRecord, "id" | "createdAt">;

/** Estado real tomado del backend cuando el equipo coincide con un nodo monitoreado por IP. */
export type EstadoOperativo = NodeStatus | "SIN_MONITOREO";

export interface EquipoView extends EquipoRecord {
  estado: EstadoOperativo;
  ultimaComprobacion: string | null;
  vinculadoBackend: boolean;
  sitioNombre: string;
}

export interface TramoRecord {
  id: string;
  nombre: string;
  origenEquipoId: string;
  destinoEquipoId: string;
  tipoConexion: string;
  metodoMonitoreo: string;
  intervaloComprobacionSegundos: number;
  umbralLatenciaMs: number;
  umbralPerdidaPct: number;
  habilitado: boolean;
  createdAt: string;
}

export type TramoInput = Omit<TramoRecord, "id" | "createdAt">;

export interface TramoView extends TramoRecord {
  estado: EstadoOperativo;
  origenNombre: string;
  destinoNombre: string;
}
