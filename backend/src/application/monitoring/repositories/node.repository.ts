import { type NodeEntity } from "../../../domain/monitoring/entities/node.entity.js";

export interface NodeRepository {
  findById(id: string): Promise<NodeEntity | null>;
  findByIp(ip: string): Promise<NodeEntity | null>;
  findByAgentToken(agentToken: string): Promise<NodeEntity | null>;
  findAll(): Promise<NodeEntity[]>;
  update(node: NodeEntity): Promise<NodeEntity>;
}
