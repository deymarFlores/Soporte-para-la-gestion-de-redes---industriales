import type ReportStatusUseCase from "../../application/monitoring/useCases/reportStatus.useCase.js";
import type { ReportStatusInput, ReportStatusResult } from "../../application/monitoring/useCases/reportStatus.useCase.js";
import type GetDashboardSummaryUseCase from "../../application/monitoring/useCases/getDashboardSummary.useCase.js";
import type ListIncidentsUseCase from "../../application/monitoring/useCases/listIncidents.useCase.js";
import type { IncidentListFilters } from "../../application/monitoring/repositories/incident.repository.js";
import type { DashboardSummaryDTO } from "../../domain/monitoring/dtos/dashboardSummary.dto.js";
import type { IncidentResponseDTO } from "../../domain/monitoring/dtos/incidentResponse.dto.js";

export interface MonitoringServiceDependencies {
  reportStatusUseCase: ReportStatusUseCase;
  getDashboardSummaryUseCase: GetDashboardSummaryUseCase;
  listIncidentsUseCase: ListIncidentsUseCase;
}

export class MonitoringService {
  private readonly reportStatusUseCase: ReportStatusUseCase;
  private readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase;
  private readonly listIncidentsUseCase: ListIncidentsUseCase;

  constructor({ reportStatusUseCase, getDashboardSummaryUseCase, listIncidentsUseCase }: MonitoringServiceDependencies) {
    this.reportStatusUseCase = reportStatusUseCase;
    this.getDashboardSummaryUseCase = getDashboardSummaryUseCase;
    this.listIncidentsUseCase = listIncidentsUseCase;
  }

  async reportStatus(input: ReportStatusInput): Promise<ReportStatusResult> {
    return this.reportStatusUseCase.execute(input);
  }

  async getDashboardSummary(): Promise<DashboardSummaryDTO> {
    return this.getDashboardSummaryUseCase.execute();
  }

  async listIncidents(filters: IncidentListFilters): Promise<IncidentResponseDTO[]> {
    return this.listIncidentsUseCase.execute(filters);
  }
}
