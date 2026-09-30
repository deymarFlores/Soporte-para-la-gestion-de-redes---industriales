import { type AccessSessionEntity } from "../entities/accessSession.entity.js";
import { type AccessSessionResponseDTO } from "../dtos/accessSessionResponse.dto.js";

export class AccessSessionMapper {
  static toResponseDTO(entity: AccessSessionEntity, userName: string, nodeName: string): AccessSessionResponseDTO {
    return {
      id: entity.id as string,
      userId: entity.userId,
      userName,
      nodeId: entity.nodeId,
      nodeName,
      reason: entity.reason,
      maxDurationSeconds: entity.maxDurationSeconds,
      status: entity.status,
      startedAt: entity.startedAt.toISOString(),
      endedAt: entity.endedAt ? entity.endedAt.toISOString() : null,
    };
  }
}
