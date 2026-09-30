import { type NodeRepository } from "../repositories/node.repository.js";
import { NodeEntity } from "../../../domain/monitoring/entities/node.entity.js";
import { type NodeType } from "../../../domain/monitoring/valueObjects/nodeType.js";

export interface CreateNodeInput {
  name: string;
  type: NodeType;
  ip?: string;
  parentId?: string;
  siteId?: string;
  description?: string;
  monitoringParams?: string;
  enabled?: boolean;
  remoteAccessEnabled?: boolean;
}

export default class CreateNodeUseCase {
  constructor(private readonly nodeRepository: NodeRepository) {}

  async execute(input: CreateNodeInput): Promise<NodeEntity> {
    const node = new NodeEntity({ ...input });
    return this.nodeRepository.create(node);
  }
}
