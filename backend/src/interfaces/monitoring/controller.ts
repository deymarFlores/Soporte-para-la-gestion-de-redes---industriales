import { type Request, type Response } from "express";
import { type MonitoringService } from "./services.js";
import { type MonitoringBroadcaster } from "../../infrastructure/realtime/MonitoringBroadcaster.js";
import { type TopologyBroadcaster } from "../../infrastructure/realtime/TopologyBroadcaster.js";
import { UnauthorizedAgentError } from "../../application/monitoring/useCases/reportStatus.useCase.js";
import { NodeNotFoundError } from "../../application/monitoring/useCases/updateNode.useCase.js";
import { NodeInUseError } from "../../application/monitoring/useCases/deleteNode.useCase.js";
import { NodeNotFoundForSegmentError } from "../../application/monitoring/useCases/createSegment.useCase.js";
import { SegmentNotFoundError } from "../../application/monitoring/useCases/updateSegment.useCase.js";
import { NodeMapper } from "../../domain/monitoring/mappers/node.mapper.js";
import { IncidentMapper } from "../../domain/monitoring/mappers/incident.mapper.js";

export class MonitoringController {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly monitoringBroadcaster: MonitoringBroadcaster,
    private readonly topologyBroadcaster: TopologyBroadcaster
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
        this.monitoringBroadcaster.broadcastUpdate({
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

  listNodes = async (_req: Request, res: Response): Promise<void> => {
    try {
      const nodes = await this.monitoringService.listNodes();
      res.json({ success: true, data: nodes });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  };

  createNode = async (req: Request, res: Response): Promise<void> => {
    try {
      const node = await this.monitoringService.createNode(req.body);
      this.topologyBroadcaster.broadcastChange({ kind: "node", action: "created", id: node.id });
      res.status(201).json({ success: true, data: node });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  };

  updateNode = async (req: Request, res: Response): Promise<void> => {
    try {
      const node = await this.monitoringService.updateNode(req.params["id"] as string, req.body);
      this.topologyBroadcaster.broadcastChange({ kind: "node", action: "updated", id: node.id });
      res.json({ success: true, data: node });
    } catch (error) {
      if (error instanceof NodeNotFoundError) {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  };

  deleteNode = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params["id"] as string;
      await this.monitoringService.deleteNode(id);
      this.topologyBroadcaster.broadcastChange({ kind: "node", action: "deleted", id });
      res.json({ success: true, data: null });
    } catch (error) {
      if (error instanceof NodeNotFoundError) {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      if (error instanceof NodeInUseError) {
        res.status(409).json({ success: false, error: error.message });
        return;
      }
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  };

  listSegments = async (_req: Request, res: Response): Promise<void> => {
    try {
      const segments = await this.monitoringService.listSegments();
      res.json({ success: true, data: segments });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  };

  createSegment = async (req: Request, res: Response): Promise<void> => {
    try {
      const segment = await this.monitoringService.createSegment(req.body);
      this.topologyBroadcaster.broadcastChange({ kind: "segment", action: "created", id: segment.id });
      res.status(201).json({ success: true, data: segment });
    } catch (error) {
      if (error instanceof NodeNotFoundForSegmentError) {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  };

  updateSegment = async (req: Request, res: Response): Promise<void> => {
    try {
      const segment = await this.monitoringService.updateSegment(req.params["id"] as string, req.body);
      this.topologyBroadcaster.broadcastChange({ kind: "segment", action: "updated", id: segment.id });
      res.json({ success: true, data: segment });
    } catch (error) {
      if (error instanceof SegmentNotFoundError) {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  };

  deleteSegment = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params["id"] as string;
      await this.monitoringService.deleteSegment(id);
      this.topologyBroadcaster.broadcastChange({ kind: "segment", action: "deleted", id });
      res.json({ success: true, data: null });
    } catch (error) {
      if (error instanceof SegmentNotFoundError) {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  };
}
