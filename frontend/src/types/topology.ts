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
  sitioId: string | null;
  descripcion: string;
  parametrosMonitoreo: string;
  habilitado: boolean;
  accesoRemotoHabilitado: boolean;
  parentId: string | null;
}

export type EquipoInput = Omit<EquipoRecord, "id" | "parentId">;

export interface EquipoView extends EquipoRecord {
  estado: NodeStatus;
  ultimaComprobacion: string | null;
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
}

export type TramoInput = Omit<TramoRecord, "id">;

export interface TramoView extends TramoRecord {
  estado: NodeStatus;
  origenNombre: string;
  destinoNombre: string;
}
