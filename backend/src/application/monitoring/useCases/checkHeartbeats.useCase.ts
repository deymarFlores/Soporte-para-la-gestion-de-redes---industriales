import { type NodeRepository } from "../repositories/node.repository.js";
import { type IncidentRepository } from "../repositories/incident.repository.js";
import { NodeEntity } from "../../../domain/monitoring/entities/node.entity.js";
import { IncidentEntity } from "../../../domain/monitoring/entities/incident.entity.js";
import { NODE_STATUS } from "../../../domain/monitoring/valueObjects/nodeStatus.js";
import { INCIDENT_TYPE } from "../../../domain/monitoring/valueObjects/incidentType.js";

export interface CheckHeartbeatsResult {
  updatedNodes: NodeEntity[];
  openedIncidents: IncidentEntity[];
}

/**
 * Detecta silencio de un gateway (sin reportes en más de `timeoutSeconds`): no sabemos qué
 * falló exactamente (enlace, hardware, o el propio gateway), así que el incidente se ancla
 * al gateway mismo en vez de inventar precisión que la falta de reportes no permite dar.
 */
export default class CheckHeartbeatsUseCase {
  constructor(
    private readonly nodeRepository: NodeRepository,
    private readonly incidentRepository: IncidentRepository,
    private readonly timeoutSeconds: number
  ) {}

  async execute(): Promise<CheckHeartbeatsResult> {
    const now = new Date();
    const nodes = await this.nodeRepository.findAll();
    const gateways = nodes.filter((node) => node.isGateway);

    const updatedNodes: NodeEntity[] = [];
    const openedIncidents: IncidentEntity[] = [];

    for (const gateway of gateways) {
      const referenceTime = gateway.lastHeartbeatAt ?? gateway.createdAt;
      const elapsedSeconds = (now.getTime() - referenceTime.getTime()) / 1000;

      if (elapsedSeconds <= this.timeoutSeconds) continue;

      const activeIncident = await this.incidentRepository.findActiveByNodeId(gateway.id);
      if (activeIncident) continue;

      const incident = await this.incidentRepository.create(
        new IncidentEntity({
          nodeId: gateway.id,
          type: INCIDENT_TYPE.HEARTBEAT_TIMEOUT,
          startedAt: now,
        })
      );
      openedIncidents.push(incident);

      if (gateway.hasStatusChanged(NODE_STATUS.DOWN)) {
        gateway.applyStatus(NODE_STATUS.DOWN, now);
        const updated = await this.nodeRepository.update(gateway);
        updatedNodes.push(updated);
      }
    }

    return { updatedNodes, openedIncidents };
  }
}
