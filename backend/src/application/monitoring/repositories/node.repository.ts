import { type NodeEntity } from "../../../domain/monitoring/entities/node.entity.js";

export interface NodeRepository {
  create(node: NodeEntity): Promise<NodeEntity>;
  update(node: NodeEntity): Promise<NodeEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<NodeEntity | null>;
  findByIp(ip: string): Promise<NodeEntity | null>;
  findByAgentToken(agentToken: string): Promise<NodeEntity | null>;
  findAll(): Promise<NodeEntity[]>;
}
