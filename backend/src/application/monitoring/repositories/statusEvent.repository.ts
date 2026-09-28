import { type StatusEventEntity } from "../../../domain/monitoring/entities/statusEvent.entity.js";

export interface StatusEventRepository {
  create(event: StatusEventEntity): Promise<StatusEventEntity>;
}
