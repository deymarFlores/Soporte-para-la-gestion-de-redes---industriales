import { type NodeRepository } from "../repositories/node.repository.js";
import { NodeEntity } from "../../../domain/monitoring/entities/node.entity.js";
import { type NodeType } from "../../../domain/monitoring/valueObjects/nodeType.js";

export interface UpdateNodeInput {
  name?: string;
  type?: NodeType;
  ip?: string;
  parentId?: string | null;
  siteId?: string | null;
  description?: string;
  monitoringParams?: string;
  enabled?: boolean;
  remoteAccessEnabled?: boolean;
}

export class NodeNotFoundError extends Error {}

export default class UpdateNodeUseCase {
  constructor(private readonly nodeRepository: NodeRepository) {}

  async execute(id: string, input: UpdateNodeInput): Promise<NodeEntity> {
    const existing = await this.nodeRepository.findById(id);
    if (!existing) throw new NodeNotFoundError(`Equipo ${id} no encontrado`);

    const updated = new NodeEntity({
      id: existing.id,
      name: input.name ?? existing.name,
      type: input.type ?? existing.type,
      ip: input.ip ?? existing.ip,
      parentId: input.parentId !== undefined ? input.parentId : existing.parentId,
      siteId: input.siteId !== undefined ? input.siteId : existing.siteId,
      description: input.description ?? existing.description,
      monitoringParams: input.monitoringParams ?? existing.monitoringParams,
      enabled: input.enabled ?? existing.enabled,
      remoteAccessEnabled: input.remoteAccessEnabled ?? existing.remoteAccessEnabled,
      agentToken: existing.agentToken,
      currentStatus: existing.currentStatus,
      lastHeartbeatAt: existing.lastHeartbeatAt,
      lastCheckedAt: existing.lastCheckedAt,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    return this.nodeRepository.update(updated);
  }
}
