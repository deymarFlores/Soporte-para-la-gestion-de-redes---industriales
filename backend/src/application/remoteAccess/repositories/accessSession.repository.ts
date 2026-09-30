import { type AccessSessionEntity } from "../../../domain/remoteAccess/entities/accessSession.entity.js";

export interface AccessSessionListFilters {
  userId?: string;
  nodeId?: string;
  status?: string;
}

export interface AccessSessionRepository {
  create(session: AccessSessionEntity): Promise<AccessSessionEntity>;
  update(session: AccessSessionEntity): Promise<AccessSessionEntity>;
  findById(id: string): Promise<AccessSessionEntity | null>;
  findActiveByNodeId(nodeId: string): Promise<AccessSessionEntity | null>;
  findAllActive(): Promise<AccessSessionEntity[]>;
  findMany(filters: AccessSessionListFilters): Promise<AccessSessionEntity[]>;
}
