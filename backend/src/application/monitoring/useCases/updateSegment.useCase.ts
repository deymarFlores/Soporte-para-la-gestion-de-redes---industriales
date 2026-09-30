import { type SegmentRepository } from "../repositories/segment.repository.js";
import { type NodeRepository } from "../repositories/node.repository.js";
import { SegmentEntity } from "../../../domain/monitoring/entities/segment.entity.js";

export interface UpdateSegmentInput {
  name?: string;
  originId?: string;
  destinationId?: string;
  connectionType?: string;
  monitoringMethod?: string;
  checkIntervalSeconds?: number;
  latencyThresholdMs?: number;
  packetLossThresholdPct?: number;
  enabled?: boolean;
}

export class SegmentNotFoundError extends Error {}

export default class UpdateSegmentUseCase {
  constructor(
    private readonly segmentRepository: SegmentRepository,
    private readonly nodeRepository: NodeRepository
  ) {}

  async execute(id: string, input: UpdateSegmentInput): Promise<SegmentEntity> {
    const existing = await this.segmentRepository.findById(id);
    if (!existing) throw new SegmentNotFoundError(`Tramo ${id} no encontrado`);

    const updated = new SegmentEntity({
      id: existing.id,
      name: input.name ?? existing.name,
      originId: input.originId ?? existing.originId,
      destinationId: input.destinationId ?? existing.destinationId,
      connectionType: input.connectionType ?? existing.connectionType,
      monitoringMethod: input.monitoringMethod ?? existing.monitoringMethod,
      checkIntervalSeconds: input.checkIntervalSeconds ?? existing.checkIntervalSeconds,
      latencyThresholdMs: input.latencyThresholdMs ?? existing.latencyThresholdMs,
      packetLossThresholdPct: input.packetLossThresholdPct ?? existing.packetLossThresholdPct,
      enabled: input.enabled ?? existing.enabled,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    const saved = await this.segmentRepository.update(updated);

    if (updated.originId !== existing.originId || updated.destinationId !== existing.destinationId) {
      const destination = await this.nodeRepository.findById(updated.destinationId);
      if (destination) {
        destination.setParent(updated.originId);
        await this.nodeRepository.update(destination);
      }
    }

    return saved;
  }
}
