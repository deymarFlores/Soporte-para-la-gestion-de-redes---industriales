import type CheckHeartbeatsUseCase from "../../../application/monitoring/useCases/checkHeartbeats.useCase.js";
import { type MonitoringBroadcaster } from "../../realtime/MonitoringBroadcaster.js";
import { NodeMapper } from "../../../domain/monitoring/mappers/node.mapper.js";
import { IncidentMapper } from "../../../domain/monitoring/mappers/incident.mapper.js";

export function startHeartbeatCheckJob(
  useCase: CheckHeartbeatsUseCase,
  broadcaster: MonitoringBroadcaster,
  intervalMs: number
): NodeJS.Timeout {
  return setInterval(() => {
    useCase
      .execute()
      .then((result) => {
        if (result.openedIncidents.length === 0) return;
        broadcaster.broadcastUpdate({
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
