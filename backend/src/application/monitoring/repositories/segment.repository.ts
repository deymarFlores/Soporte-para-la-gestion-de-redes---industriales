import { type SegmentEntity } from "../../../domain/monitoring/entities/segment.entity.js";

export interface SegmentRepository {
  create(segment: SegmentEntity): Promise<SegmentEntity>;
  update(segment: SegmentEntity): Promise<SegmentEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<SegmentEntity | null>;
  findAll(): Promise<SegmentEntity[]>;
}
