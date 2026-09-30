import type ReportStatusUseCase from "../../application/monitoring/useCases/reportStatus.useCase.js";
import type { ReportStatusInput, ReportStatusResult } from "../../application/monitoring/useCases/reportStatus.useCase.js";
import type GetDashboardSummaryUseCase from "../../application/monitoring/useCases/getDashboardSummary.useCase.js";
import type ListIncidentsUseCase from "../../application/monitoring/useCases/listIncidents.useCase.js";
import type ListNodesUseCase from "../../application/monitoring/useCases/listNodes.useCase.js";
import type CreateNodeUseCase from "../../application/monitoring/useCases/createNode.useCase.js";
import type { CreateNodeInput } from "../../application/monitoring/useCases/createNode.useCase.js";
import type UpdateNodeUseCase from "../../application/monitoring/useCases/updateNode.useCase.js";
import type { UpdateNodeInput } from "../../application/monitoring/useCases/updateNode.useCase.js";
import type DeleteNodeUseCase from "../../application/monitoring/useCases/deleteNode.useCase.js";
import type ListSegmentsUseCase from "../../application/monitoring/useCases/listSegments.useCase.js";
import type CreateSegmentUseCase from "../../application/monitoring/useCases/createSegment.useCase.js";
import type { CreateSegmentInput } from "../../application/monitoring/useCases/createSegment.useCase.js";
import type UpdateSegmentUseCase from "../../application/monitoring/useCases/updateSegment.useCase.js";
import type { UpdateSegmentInput } from "../../application/monitoring/useCases/updateSegment.useCase.js";
import type DeleteSegmentUseCase from "../../application/monitoring/useCases/deleteSegment.useCase.js";
import type { IncidentListFilters } from "../../application/monitoring/repositories/incident.repository.js";
import { NodeMapper } from "../../domain/monitoring/mappers/node.mapper.js";
import { SegmentMapper } from "../../domain/monitoring/mappers/segment.mapper.js";
import type { DashboardSummaryDTO } from "../../domain/monitoring/dtos/dashboardSummary.dto.js";
import type { IncidentResponseDTO } from "../../domain/monitoring/dtos/incidentResponse.dto.js";
import type { NodeResponseDTO } from "../../domain/monitoring/dtos/nodeResponse.dto.js";
import type { SegmentResponseDTO } from "../../domain/monitoring/dtos/segmentResponse.dto.js";

export interface MonitoringServiceDependencies {
  reportStatusUseCase: ReportStatusUseCase;
  getDashboardSummaryUseCase: GetDashboardSummaryUseCase;
  listIncidentsUseCase: ListIncidentsUseCase;
  listNodesUseCase: ListNodesUseCase;
  createNodeUseCase: CreateNodeUseCase;
  updateNodeUseCase: UpdateNodeUseCase;
  deleteNodeUseCase: DeleteNodeUseCase;
  listSegmentsUseCase: ListSegmentsUseCase;
  createSegmentUseCase: CreateSegmentUseCase;
  updateSegmentUseCase: UpdateSegmentUseCase;
  deleteSegmentUseCase: DeleteSegmentUseCase;
}

export class MonitoringService {
  constructor(private readonly deps: MonitoringServiceDependencies) {}

  async reportStatus(input: ReportStatusInput): Promise<ReportStatusResult> {
    return this.deps.reportStatusUseCase.execute(input);
  }

  async getDashboardSummary(): Promise<DashboardSummaryDTO> {
    return this.deps.getDashboardSummaryUseCase.execute();
  }

  async listIncidents(filters: IncidentListFilters): Promise<IncidentResponseDTO[]> {
    return this.deps.listIncidentsUseCase.execute(filters);
  }

  async listNodes(): Promise<NodeResponseDTO[]> {
    return this.deps.listNodesUseCase.execute();
  }

  async createNode(input: CreateNodeInput): Promise<NodeResponseDTO> {
    const node = await this.deps.createNodeUseCase.execute(input);
    return NodeMapper.toResponseDTO(node);
  }

  async updateNode(id: string, input: UpdateNodeInput): Promise<NodeResponseDTO> {
    const node = await this.deps.updateNodeUseCase.execute(id, input);
    return NodeMapper.toResponseDTO(node);
  }

  async deleteNode(id: string): Promise<void> {
    return this.deps.deleteNodeUseCase.execute(id);
  }

  async listSegments(): Promise<SegmentResponseDTO[]> {
    return this.deps.listSegmentsUseCase.execute();
  }

  async createSegment(input: CreateSegmentInput): Promise<SegmentResponseDTO> {
    const segment = await this.deps.createSegmentUseCase.execute(input);
    return SegmentMapper.toResponseDTO(segment);
  }

  async updateSegment(id: string, input: UpdateSegmentInput): Promise<SegmentResponseDTO> {
    const segment = await this.deps.updateSegmentUseCase.execute(id, input);
    return SegmentMapper.toResponseDTO(segment);
  }

  async deleteSegment(id: string): Promise<void> {
    return this.deps.deleteSegmentUseCase.execute(id);
  }
}
