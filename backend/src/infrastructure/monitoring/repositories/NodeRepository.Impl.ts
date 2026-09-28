import type { PrismaClient, Node as NodeRow } from "@prisma/client";
import { type NodeRepository } from "../../../application/monitoring/repositories/node.repository.js";
import { NodeEntity } from "../../../domain/monitoring/entities/node.entity.js";
import type { NodeType } from "../../../domain/monitoring/valueObjects/nodeType.js";
import type { NodeStatus } from "../../../domain/monitoring/valueObjects/nodeStatus.js";

function toEntity(row: NodeRow): NodeEntity {
  return new NodeEntity({
    id: row.id,
    name: row.name,
    type: row.type as NodeType,
    ip: row.ip,
    parentId: row.parentId,
    agentToken: row.agentToken,
    currentStatus: row.currentStatus as NodeStatus,
    lastHeartbeatAt: row.lastHeartbeatAt,
    lastCheckedAt: row.lastCheckedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export default class PrismaNodeRepository implements NodeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<NodeEntity | null> {
    const row = await this.prisma.node.findUnique({ where: { id } });
    return row ? toEntity(row) : null;
  }

  async findByIp(ip: string): Promise<NodeEntity | null> {
    const row = await this.prisma.node.findFirst({ where: { ip } });
    return row ? toEntity(row) : null;
  }

  async findByAgentToken(agentToken: string): Promise<NodeEntity | null> {
    const row = await this.prisma.node.findUnique({ where: { agentToken } });
    return row ? toEntity(row) : null;
  }

  async findAll(): Promise<NodeEntity[]> {
    const rows = await this.prisma.node.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map(toEntity);
  }

  async update(node: NodeEntity): Promise<NodeEntity> {
    const row = await this.prisma.node.update({
      where: { id: node.id },
      data: {
        currentStatus: node.currentStatus,
        lastHeartbeatAt: node.lastHeartbeatAt,
        lastCheckedAt: node.lastCheckedAt,
      },
    });
    return toEntity(row);
  }
}
