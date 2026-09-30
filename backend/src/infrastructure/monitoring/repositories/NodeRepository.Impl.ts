import { Prisma, type PrismaClient, type Node as NodeRow } from "@prisma/client";
import { type NodeRepository } from "../../../application/monitoring/repositories/node.repository.js";
import { NodeEntity } from "../../../domain/monitoring/entities/node.entity.js";
import type { NodeType } from "../../../domain/monitoring/valueObjects/nodeType.js";
import type { NodeStatus } from "../../../domain/monitoring/valueObjects/nodeStatus.js";
import { NodeInUseError } from "../../../application/monitoring/useCases/deleteNode.useCase.js";

function toEntity(row: NodeRow): NodeEntity {
  return new NodeEntity({
    id: row.id,
    name: row.name,
    type: row.type as NodeType,
    ip: row.ip,
    parentId: row.parentId,
    siteId: row.siteId,
    description: row.description,
    monitoringParams: row.monitoringParams,
    enabled: row.enabled,
    remoteAccessEnabled: row.remoteAccessEnabled,
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

  async create(node: NodeEntity): Promise<NodeEntity> {
    const row = await this.prisma.node.create({
      data: {
        name: node.name,
        type: node.type,
        ip: node.ip,
        parentId: node.parentId,
        siteId: node.siteId,
        description: node.description,
        monitoringParams: node.monitoringParams,
        enabled: node.enabled,
        remoteAccessEnabled: node.remoteAccessEnabled,
        agentToken: node.agentToken,
        currentStatus: node.currentStatus,
      },
    });
    return toEntity(row);
  }

  async update(node: NodeEntity): Promise<NodeEntity> {
    const row = await this.prisma.node.update({
      where: { id: node.id },
      data: {
        name: node.name,
        type: node.type,
        ip: node.ip,
        parentId: node.parentId,
        siteId: node.siteId,
        description: node.description,
        monitoringParams: node.monitoringParams,
        enabled: node.enabled,
        remoteAccessEnabled: node.remoteAccessEnabled,
        currentStatus: node.currentStatus,
        lastHeartbeatAt: node.lastHeartbeatAt,
        lastCheckedAt: node.lastCheckedAt,
      },
    });
    return toEntity(row);
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.node.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new NodeInUseError("No se puede eliminar un equipo con tramos, incidentes o sesiones asociadas");
      }
      throw error;
    }
  }

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
}
