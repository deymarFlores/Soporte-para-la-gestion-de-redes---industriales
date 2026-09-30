export const INCIDENT_TYPE = {
  INDIVIDUAL: "INDIVIDUAL",
  DEPENDENT: "DEPENDENT",
  HEARTBEAT_TIMEOUT: "HEARTBEAT_TIMEOUT",
} as const;

export type IncidentType = (typeof INCIDENT_TYPE)[keyof typeof INCIDENT_TYPE];
