import { type IncidentRepository, type IncidentListFilters } from "../repositories/incident.repository.js";
import { IncidentMapper } from "../../../domain/monitoring/mappers/incident.mapper.js";
import { type IncidentResponseDTO } from "../../../domain/monitoring/dtos/incidentResponse.dto.js";

export default class ListIncidentsUseCase {
  constructor(private readonly incidentRepository: IncidentRepository) {}

  async execute(filters: IncidentListFilters): Promise<IncidentResponseDTO[]> {
    const incidents = await this.incidentRepository.findMany(filters);
    return IncidentMapper.toResponseDTOArray(incidents);
  }
}
