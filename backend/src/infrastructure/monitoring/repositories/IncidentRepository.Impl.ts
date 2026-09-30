import type { PrismaClient, Incident as IncidentRow } from "@prisma/client";
import {
  type IncidentRepository,
  type IncidentListFilters,
} from "../../../application/monitoring/repositories/incident.repository.js";
import { IncidentEntity } from "../../../domain/monitoring/entities/incident.entity.js";
import type { IncidentType } from "../../../domain/monitoring/valueObjects/incidentType.js";
import type { IncidentStatus } from "../../../domain/monitoring/valueObjects/incidentStatus.js";
import { INCIDENT_STATUS } from "../../../domain/monitoring/valueObjects/incidentStatus.js";

function toEntity(row: IncidentRow): IncidentEntity {
  return new IncidentEntity({
    id: row.id,
    nodeId: row.nodeId,
    type: row.type as IncidentType,
    status: row.status as IncidentStatus,
    rootIncidentId: row.rootIncidentId,
    startedAt: row.startedAt,
    resolvedAt: row.resolvedAt,
    durationSeconds: row.durationSeconds,
  });
}

export default class PrismaIncidentRepository implements IncidentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(incident: IncidentEntity): Promise<IncidentEntity> {
    const row = await this.prisma.incident.create({
      data: {
        nodeId: incident.nodeId,
        type: incident.type,
        status: incident.status,
        rootIncidentId: incident.rootIncidentId,
        startedAt: incident.startedAt,
      },
    });
    return toEntity(row);
  }

  async update(incident: IncidentEntity): Promise<IncidentEntity> {
    const row = await this.prisma.incident.update({
      where: { id: incident.id },
      data: {
        status: incident.status,
        resolvedAt: incident.resolvedAt,
        durationSeconds: incident.durationSeconds,
      },
    });
    return toEntity(row);
  }

  async findActiveByNodeId(nodeId: string): Promise<IncidentEntity | null> {
    const row = await this.prisma.incident.findFirst({
      where: { nodeId, status: INCIDENT_STATUS.ACTIVE },
    });
    return row ? toEntity(row) : null;
  }

  async findAllActive(): Promise<IncidentEntity[]> {
    const rows = await this.prisma.incident.findMany({
      where: { status: INCIDENT_STATUS.ACTIVE },
      orderBy: { startedAt: "desc" },
    });
    return rows.map(toEntity);
  }

  async findMany(filters: IncidentListFilters): Promise<IncidentEntity[]> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;

    const rows = await this.prisma.incident.findMany({
      where: {
        nodeId: filters.nodeId,
        status: filters.status as IncidentStatus | undefined,
      },
      orderBy: { startedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return rows.map(toEntity);
  }
}
