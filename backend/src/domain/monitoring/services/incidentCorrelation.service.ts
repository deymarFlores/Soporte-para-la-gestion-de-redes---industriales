import { NODE_STATUS, type NodeStatus } from "../valueObjects/nodeStatus.js";
import { INCIDENT_TYPE, type IncidentType } from "../valueObjects/incidentType.js";
import { type IncidentEntity } from "../entities/incident.entity.js";

export type CorrelationAction =
  | { kind: "OPEN_INCIDENT"; incidentType: IncidentType; rootIncidentId: string | null }
  | { kind: "RESOLVE_INCIDENT" }
  | { kind: "NONE" };

export interface CorrelationInput {
  previousStatus: NodeStatus;
  newStatus: NodeStatus;
  activeIncidentOnNode: IncidentEntity | null;
  activeIncidentOnParent: IncidentEntity | null;
}

/**
 * Decide qué acción tomar sobre los incidentes de un nodo a partir de un cambio de estado,
 * usando la cadena padre-hijo para distinguir una falla propia de una falla heredada de un
 * tramo superior (evita reportar como incidentes independientes los síntomas de una misma causa).
 */
export class IncidentCorrelationService {
  decide(input: CorrelationInput): CorrelationAction {
    const { previousStatus, newStatus, activeIncidentOnNode, activeIncidentOnParent } = input;

    if (previousStatus === newStatus) {
      return { kind: "NONE" };
    }

    if (newStatus === NODE_STATUS.DOWN) {
      if (activeIncidentOnNode) return { kind: "NONE" };

      if (activeIncidentOnParent) {
        return {
          kind: "OPEN_INCIDENT",
          incidentType: INCIDENT_TYPE.DEPENDENT,
          rootIncidentId: activeIncidentOnParent.id ?? null,
        };
      }

      return { kind: "OPEN_INCIDENT", incidentType: INCIDENT_TYPE.INDIVIDUAL, rootIncidentId: null };
    }

    if (newStatus === NODE_STATUS.UP && activeIncidentOnNode) {
      return { kind: "RESOLVE_INCIDENT" };
    }

    return { kind: "NONE" };
  }
}
