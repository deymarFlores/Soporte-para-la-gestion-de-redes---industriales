import { type IncidentEntity } from "../../../domain/monitoring/entities/incident.entity.js";

export interface IncidentListFilters {
  nodeId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface IncidentRepository {
  create(incident: IncidentEntity): Promise<IncidentEntity>;
  update(incident: IncidentEntity): Promise<IncidentEntity>;
  findActiveByNodeId(nodeId: string): Promise<IncidentEntity | null>;
  findAllActive(): Promise<IncidentEntity[]>;
  findMany(filters: IncidentListFilters): Promise<IncidentEntity[]>;
}
