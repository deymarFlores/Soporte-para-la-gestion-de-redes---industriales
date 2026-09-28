import { type NodeRepository } from "../repositories/node.repository.js";
import { type IncidentRepository } from "../repositories/incident.repository.js";
import { NodeMapper } from "../../../domain/monitoring/mappers/node.mapper.js";
import { IncidentMapper } from "../../../domain/monitoring/mappers/incident.mapper.js";
import { type DashboardSummaryDTO } from "../../../domain/monitoring/dtos/dashboardSummary.dto.js";

export default class GetDashboardSummaryUseCase {
  constructor(
    private readonly nodeRepository: NodeRepository,
    private readonly incidentRepository: IncidentRepository
  ) {}

  async execute(): Promise<DashboardSummaryDTO> {
    const [nodes, activeIncidents] = await Promise.all([
      this.nodeRepository.findAll(),
      this.incidentRepository.findAllActive(),
    ]);

    return {
      nodes: NodeMapper.toResponseDTOArray(nodes),
      activeIncidents: IncidentMapper.toResponseDTOArray(activeIncidents),
    };
  }
}
