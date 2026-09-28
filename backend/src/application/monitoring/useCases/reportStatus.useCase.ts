import { type NodeRepository } from "../repositories/node.repository.js";
import { type StatusEventRepository } from "../repositories/statusEvent.repository.js";
import { type IncidentRepository } from "../repositories/incident.repository.js";
import { IncidentCorrelationService } from "../../../domain/monitoring/services/incidentCorrelation.service.js";
import { NodeEntity } from "../../../domain/monitoring/entities/node.entity.js";
import { StatusEventEntity } from "../../../domain/monitoring/entities/statusEvent.entity.js";
import { IncidentEntity } from "../../../domain/monitoring/entities/incident.entity.js";
import { NODE_STATUS, type NodeStatus } from "../../../domain/monitoring/valueObjects/nodeStatus.js";

export class UnauthorizedAgentError extends Error {}

export interface ReportStatusReading {
  ip: string;
  status: NodeStatus;
  latencyMs?: number;
  packetLossPct?: number;
  metadata?: Record<string, unknown>;
}

export interface ReportStatusInput {
  agentToken: string;
  readings: ReportStatusReading[];
}

export interface ReportStatusResult {
  gateway: NodeEntity;
  updatedNodes: NodeEntity[];
  openedIncidents: IncidentEntity[];
  resolvedIncidents: IncidentEntity[];
  unmatchedIps: string[];
}

export default class ReportStatusUseCase {
  constructor(
    private readonly nodeRepository: NodeRepository,
    private readonly statusEventRepository: StatusEventRepository,
    private readonly incidentRepository: IncidentRepository,
    private readonly correlationService: IncidentCorrelationService = new IncidentCorrelationService()
  ) {}

  async execute(input: ReportStatusInput): Promise<ReportStatusResult> {
    const gateway = await this.nodeRepository.findByAgentToken(input.agentToken);
    if (!gateway) throw new UnauthorizedAgentError("Token de agente inválido");

    const now = new Date();
    const updatedNodes: NodeEntity[] = [];
    const openedIncidents: IncidentEntity[] = [];
    const resolvedIncidents: IncidentEntity[] = [];
    const unmatchedIps: string[] = [];

    await this.applyReading(gateway, NODE_STATUS.UP, "heartbeat", now, {
      updatedNodes,
      openedIncidents,
      resolvedIncidents,
    });
    gateway.recordHeartbeat(now);
    await this.nodeRepository.update(gateway);

    for (const reading of input.readings) {
      const node = await this.nodeRepository.findByIp(reading.ip);
      if (!node) {
        unmatchedIps.push(reading.ip);
        continue;
      }

      await this.applyReading(node, reading.status, "explicit", now, {
        updatedNodes,
        openedIncidents,
        resolvedIncidents,
        latencyMs: reading.latencyMs,
        packetLossPct: reading.packetLossPct,
        metadata: reading.metadata,
      });
    }

    return { gateway, updatedNodes, openedIncidents, resolvedIncidents, unmatchedIps };
  }

  private async applyReading(
    node: NodeEntity,
    newStatus: NodeStatus,
    source: "heartbeat" | "explicit",
    now: Date,
    acc: {
      updatedNodes: NodeEntity[];
      openedIncidents: IncidentEntity[];
      resolvedIncidents: IncidentEntity[];
      latencyMs?: number;
      packetLossPct?: number;
      metadata?: Record<string, unknown>;
    }
  ): Promise<void> {
    const previousStatus = node.currentStatus;

    const activeIncidentOnNode = await this.incidentRepository.findActiveByNodeId(node.id);
    const activeIncidentOnParent = node.parentId
      ? await this.incidentRepository.findActiveByNodeId(node.parentId)
      : null;

    const action = this.correlationService.decide({
      previousStatus,
      newStatus,
      activeIncidentOnNode,
      activeIncidentOnParent,
    });

    await this.statusEventRepository.create(
      new StatusEventEntity({
        nodeId: node.id,
        status: newStatus,
        latencyMs: acc.latencyMs ?? null,
        packetLossPct: acc.packetLossPct ?? null,
        metadata: acc.metadata ?? null,
        source,
        occurredAt: now,
      })
    );

    if (action.kind === "OPEN_INCIDENT") {
      const incident = await this.incidentRepository.create(
        new IncidentEntity({
          nodeId: node.id,
          type: action.incidentType,
          rootIncidentId: action.rootIncidentId,
          startedAt: now,
        })
      );
      acc.openedIncidents.push(incident);
    } else if (action.kind === "RESOLVE_INCIDENT" && activeIncidentOnNode) {
      activeIncidentOnNode.resolve(now);
      const incident = await this.incidentRepository.update(activeIncidentOnNode);
      acc.resolvedIncidents.push(incident);
    }

    if (node.hasStatusChanged(newStatus)) {
      node.applyStatus(newStatus, now);
      const updated = await this.nodeRepository.update(node);
      acc.updatedNodes.push(updated);
    }
  }
}
