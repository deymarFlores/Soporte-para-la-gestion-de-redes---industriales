import { type IncidentEntity } from "../entities/incident.entity.js";
import { type IncidentResponseDTO } from "../dtos/incidentResponse.dto.js";

export class IncidentMapper {
  static toResponseDTO(entity: IncidentEntity): IncidentResponseDTO {
    return {
      id: entity.id as string,
      nodeId: entity.nodeId,
      type: entity.type,
      status: entity.status,
      rootIncidentId: entity.rootIncidentId,
      startedAt: entity.startedAt.toISOString(),
      resolvedAt: entity.resolvedAt ? entity.resolvedAt.toISOString() : null,
      durationSeconds: entity.durationSeconds,
    };
  }

  static toResponseDTOArray(entities: IncidentEntity[]): IncidentResponseDTO[] {
    return entities.map((entity) => IncidentMapper.toResponseDTO(entity));
  }
}
