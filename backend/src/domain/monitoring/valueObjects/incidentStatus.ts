export const INCIDENT_STATUS = {
  ACTIVE: "ACTIVE",
  RESOLVED: "RESOLVED",
} as const;

export type IncidentStatus = (typeof INCIDENT_STATUS)[keyof typeof INCIDENT_STATUS];
