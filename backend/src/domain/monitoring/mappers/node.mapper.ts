import { type NodeEntity } from "../entities/node.entity.js";
import { type NodeResponseDTO } from "../dtos/nodeResponse.dto.js";

export class NodeMapper {
  static toResponseDTO(entity: NodeEntity): NodeResponseDTO {
    return {
      id: entity.id as string,
      name: entity.name,
      type: entity.type,
      ip: entity.ip,
      parentId: entity.parentId,
      siteId: entity.siteId,
      description: entity.description,
      monitoringParams: entity.monitoringParams,
      enabled: entity.enabled,
      remoteAccessEnabled: entity.remoteAccessEnabled,
      currentStatus: entity.currentStatus,
      lastHeartbeatAt: entity.lastHeartbeatAt ? entity.lastHeartbeatAt.toISOString() : null,
      lastCheckedAt: entity.lastCheckedAt ? entity.lastCheckedAt.toISOString() : null,
    };
  }

  static toResponseDTOArray(entities: NodeEntity[]): NodeResponseDTO[] {
    return entities.map((entity) => NodeMapper.toResponseDTO(entity));
  }
}
