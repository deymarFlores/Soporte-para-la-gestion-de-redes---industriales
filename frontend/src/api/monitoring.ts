import { apiGet } from "./client.js";
import type { DashboardSummaryDTO, IncidentResponseDTO } from "../types/monitoring.js";

export function getDashboardSummary(): Promise<DashboardSummaryDTO> {
  return apiGet<DashboardSummaryDTO>("/api/dashboard/summary");
}

export function listIncidents(): Promise<IncidentResponseDTO[]> {
  return apiGet<IncidentResponseDTO[]>("/api/incidents");
}
