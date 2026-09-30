import { type SegmentRepository } from "../repositories/segment.repository.js";
import { SegmentMapper } from "../../../domain/monitoring/mappers/segment.mapper.js";
import { type SegmentResponseDTO } from "../../../domain/monitoring/dtos/segmentResponse.dto.js";

export default class ListSegmentsUseCase {
  constructor(private readonly segmentRepository: SegmentRepository) {}

  async execute(): Promise<SegmentResponseDTO[]> {
    const segments = await this.segmentRepository.findAll();
    return SegmentMapper.toResponseDTOArray(segments);
  }
}
