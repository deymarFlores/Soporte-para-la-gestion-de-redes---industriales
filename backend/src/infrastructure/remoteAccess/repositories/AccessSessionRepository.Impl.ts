import type { PrismaClient, AccessSession as AccessSessionRow } from "@prisma/client";
import {
  type AccessSessionRepository,
  type AccessSessionListFilters,
} from "../../../application/remoteAccess/repositories/accessSession.repository.js";
import { AccessSessionEntity } from "../../../domain/remoteAccess/entities/accessSession.entity.js";
import type { AccessSessionStatus } from "../../../domain/remoteAccess/valueObjects/accessSessionStatus.js";
import { ACCESS_SESSION_STATUS } from "../../../domain/remoteAccess/valueObjects/accessSessionStatus.js";

function toEntity(row: AccessSessionRow): AccessSessionEntity {
  return new AccessSessionEntity({
    id: row.id,
    userId: row.userId,
    nodeId: row.nodeId,
    reason: row.reason,
    maxDurationSeconds: row.maxDurationSeconds,
    status: row.status as AccessSessionStatus,
    startedAt: row.startedAt,
    endedAt: row.endedAt,
  });
}

export default class PrismaAccessSessionRepository implements AccessSessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(session: AccessSessionEntity): Promise<AccessSessionEntity> {
    const row = await this.prisma.accessSession.create({
      data: {
        userId: session.userId,
        nodeId: session.nodeId,
        reason: session.reason,
        maxDurationSeconds: session.maxDurationSeconds,
        status: session.status,
        startedAt: session.startedAt,
      },
    });
    return toEntity(row);
  }

  async update(session: AccessSessionEntity): Promise<AccessSessionEntity> {
    const row = await this.prisma.accessSession.update({
      where: { id: session.id },
      data: {
        status: session.status,
        endedAt: session.endedAt,
      },
    });
    return toEntity(row);
  }

  async findById(id: string): Promise<AccessSessionEntity | null> {
    const row = await this.prisma.accessSession.findUnique({ where: { id } });
    return row ? toEntity(row) : null;
  }

  async findActiveByNodeId(nodeId: string): Promise<AccessSessionEntity | null> {
    const row = await this.prisma.accessSession.findFirst({
      where: { nodeId, status: ACCESS_SESSION_STATUS.ACTIVE },
    });
    return row ? toEntity(row) : null;
  }

  async findAllActive(): Promise<AccessSessionEntity[]> {
    const rows = await this.prisma.accessSession.findMany({
      where: { status: ACCESS_SESSION_STATUS.ACTIVE },
      orderBy: { startedAt: "desc" },
    });
    return rows.map(toEntity);
  }

  async findMany(filters: AccessSessionListFilters): Promise<AccessSessionEntity[]> {
    const rows = await this.prisma.accessSession.findMany({
      where: {
        userId: filters.userId,
        nodeId: filters.nodeId,
        status: filters.status as AccessSessionStatus | undefined,
      },
      orderBy: { startedAt: "desc" },
    });
    return rows.map(toEntity);
  }
}
