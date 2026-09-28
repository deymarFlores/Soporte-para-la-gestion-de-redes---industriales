import type CheckHeartbeatsUseCase from "../../../application/monitoring/useCases/checkHeartbeats.useCase.js";
import { type RealtimeGateway } from "../../realtime/socketServer.js";
import { NodeMapper } from "../../../domain/monitoring/mappers/node.mapper.js";
import { IncidentMapper } from "../../../domain/monitoring/mappers/incident.mapper.js";

export function startHeartbeatCheckJob(
  useCase: CheckHeartbeatsUseCase,
  realtime: RealtimeGateway,
  intervalMs: number
): NodeJS.Timeout {
  return setInterval(() => {
    useCase
      .execute()
      .then((result) => {
        if (result.openedIncidents.length === 0) return;
        realtime.broadcastMonitoringUpdate({
          updatedNodes: NodeMapper.toResponseDTOArray(result.updatedNodes),
          openedIncidents: IncidentMapper.toResponseDTOArray(result.openedIncidents),
          resolvedIncidents: [],
        });
      })
      .catch((error) => {
        console.error("Error revisando heartbeats de gateways:", error);
      });
  }, intervalMs);
}
