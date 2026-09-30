import { type SegmentRepository } from "../repositories/segment.repository.js";
import { type NodeRepository } from "../repositories/node.repository.js";
import { SegmentNotFoundError } from "./updateSegment.useCase.js";

export { SegmentNotFoundError };

export default class DeleteSegmentUseCase {
  constructor(
    private readonly segmentRepository: SegmentRepository,
    private readonly nodeRepository: NodeRepository
  ) {}

  async execute(id: string): Promise<void> {
    const segment = await this.segmentRepository.findById(id);
    if (!segment) throw new SegmentNotFoundError(`Tramo ${id} no encontrado`);

    await this.segmentRepository.delete(id);

    const destination = await this.nodeRepository.findById(segment.destinationId);
    if (destination && destination.parentId === segment.originId) {
      destination.setParent(null);
      await this.nodeRepository.update(destination);
    }
  }
}
