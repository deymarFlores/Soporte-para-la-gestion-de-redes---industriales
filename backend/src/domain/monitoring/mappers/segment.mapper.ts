import { type SegmentEntity } from "../entities/segment.entity.js";
import { type SegmentResponseDTO } from "../dtos/segmentResponse.dto.js";

export class SegmentMapper {
  static toResponseDTO(entity: SegmentEntity): SegmentResponseDTO {
    return {
      id: entity.id as string,
      name: entity.name,
      originId: entity.originId,
      destinationId: entity.destinationId,
      connectionType: entity.connectionType,
      monitoringMethod: entity.monitoringMethod,
      checkIntervalSeconds: entity.checkIntervalSeconds,
      latencyThresholdMs: entity.latencyThresholdMs,
      packetLossThresholdPct: entity.packetLossThresholdPct,
      enabled: entity.enabled,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  static toResponseDTOArray(entities: SegmentEntity[]): SegmentResponseDTO[] {
    return entities.map((entity) => SegmentMapper.toResponseDTO(entity));
  }
}
