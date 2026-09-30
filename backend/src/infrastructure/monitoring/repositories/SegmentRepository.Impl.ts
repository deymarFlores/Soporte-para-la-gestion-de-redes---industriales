import type { PrismaClient, Segment as SegmentRow } from "@prisma/client";
import { type SegmentRepository } from "../../../application/monitoring/repositories/segment.repository.js";
import { SegmentEntity } from "../../../domain/monitoring/entities/segment.entity.js";

function toEntity(row: SegmentRow): SegmentEntity {
  return new SegmentEntity({
    id: row.id,
    name: row.name,
    originId: row.originId,
    destinationId: row.destinationId,
    connectionType: row.connectionType,
    monitoringMethod: row.monitoringMethod,
    checkIntervalSeconds: row.checkIntervalSeconds,
    latencyThresholdMs: row.latencyThresholdMs,
    packetLossThresholdPct: row.packetLossThresholdPct,
    enabled: row.enabled,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export default class PrismaSegmentRepository implements SegmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(segment: SegmentEntity): Promise<SegmentEntity> {
    const row = await this.prisma.segment.create({
      data: {
        name: segment.name,
        originId: segment.originId,
        destinationId: segment.destinationId,
        connectionType: segment.connectionType,
        monitoringMethod: segment.monitoringMethod,
        checkIntervalSeconds: segment.checkIntervalSeconds,
        latencyThresholdMs: segment.latencyThresholdMs,
        packetLossThresholdPct: segment.packetLossThresholdPct,
        enabled: segment.enabled,
      },
    });
    return toEntity(row);
  }

  async update(segment: SegmentEntity): Promise<SegmentEntity> {
    const row = await this.prisma.segment.update({
      where: { id: segment.id },
      data: {
        name: segment.name,
        originId: segment.originId,
        destinationId: segment.destinationId,
        connectionType: segment.connectionType,
        monitoringMethod: segment.monitoringMethod,
        checkIntervalSeconds: segment.checkIntervalSeconds,
        latencyThresholdMs: segment.latencyThresholdMs,
        packetLossThresholdPct: segment.packetLossThresholdPct,
        enabled: segment.enabled,
      },
    });
    return toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.segment.delete({ where: { id } });
  }

  async findById(id: string): Promise<SegmentEntity | null> {
    const row = await this.prisma.segment.findUnique({ where: { id } });
    return row ? toEntity(row) : null;
  }

  async findAll(): Promise<SegmentEntity[]> {
    const rows = await this.prisma.segment.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map(toEntity);
  }
}
