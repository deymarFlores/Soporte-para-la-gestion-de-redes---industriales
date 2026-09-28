import { type Request, type Response } from "express";
import { type MonitoringService } from "./services.js";
import { type RealtimeGateway } from "../../infrastructure/realtime/socketServer.js";
import { UnauthorizedAgentError } from "../../application/monitoring/useCases/reportStatus.useCase.js";
import { NodeMapper } from "../../domain/monitoring/mappers/node.mapper.js";
import { IncidentMapper } from "../../domain/monitoring/mappers/incident.mapper.js";

export class MonitoringController {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly realtime: RealtimeGateway
  ) {}

  reportStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const agentToken = req.header("x-agent-token");
      if (!agentToken) {
        res.status(401).json({ success: false, error: "Falta el header x-agent-token" });
        return;
      }

      const result = await this.monitoringService.reportStatus({
        agentToken,
        readings: req.body?.readings ?? [],
      });

      const hasChanges =
        result.openedIncidents.length > 0 || result.resolvedIncidents.length > 0 || result.updatedNodes.length > 0;

      if (hasChanges) {
        this.realtime.broadcastMonitoringUpdate({
          updatedNodes: NodeMapper.toResponseDTOArray(result.updatedNodes),
          openedIncidents: IncidentMapper.toResponseDTOArray(result.openedIncidents),
          resolvedIncidents: IncidentMapper.toResponseDTOArray(result.resolvedIncidents),
        });
      }

      res.status(202).json({ success: true, data: { unmatchedIps: result.unmatchedIps } });
    } catch (error) {
      if (error instanceof UnauthorizedAgentError) {
        res.status(401).json({ success: false, error: error.message });
        return;
      }
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  };

  getDashboardSummary = async (_req: Request, res: Response): Promise<void> => {
    try {
      const summary = await this.monitoringService.getDashboardSummary();
      res.json({ success: true, data: summary });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  };

  listIncidents = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nodeId, status, page, limit } = req.query;
      const incidents = await this.monitoringService.listIncidents({
        nodeId: typeof nodeId === "string" ? nodeId : undefined,
        status: typeof status === "string" ? status : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.json({ success: true, data: incidents });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  };
}
