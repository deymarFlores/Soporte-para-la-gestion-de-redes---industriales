import type { PrismaClient } from "@prisma/client";
import { type StatusEventRepository } from "../../../application/monitoring/repositories/statusEvent.repository.js";
import { StatusEventEntity } from "../../../domain/monitoring/entities/statusEvent.entity.js";
import type { NodeStatus } from "../../../domain/monitoring/valueObjects/nodeStatus.js";
import type { Prisma } from "@prisma/client";

export default class PrismaStatusEventRepository implements StatusEventRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(event: StatusEventEntity): Promise<StatusEventEntity> {
    const row = await this.prisma.statusEvent.create({
      data: {
        nodeId: event.nodeId,
        status: event.status,
        latencyMs: event.latencyMs,
        packetLossPct: event.packetLossPct,
        metadata: (event.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        source: event.source,
        occurredAt: event.occurredAt,
      },
    });

    return new StatusEventEntity({
      id: row.id,
      nodeId: row.nodeId,
      status: row.status as NodeStatus,
      latencyMs: row.latencyMs,
      packetLossPct: row.packetLossPct,
      metadata: row.metadata as Record<string, unknown> | null,
      source: row.source,
      occurredAt: row.occurredAt,
    });
  }
}
