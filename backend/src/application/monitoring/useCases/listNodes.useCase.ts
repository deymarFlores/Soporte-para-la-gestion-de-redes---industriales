import { type NodeRepository } from "../repositories/node.repository.js";
import { NodeMapper } from "../../../domain/monitoring/mappers/node.mapper.js";
import { type NodeResponseDTO } from "../../../domain/monitoring/dtos/nodeResponse.dto.js";

export default class ListNodesUseCase {
  constructor(private readonly nodeRepository: NodeRepository) {}

  async execute(): Promise<NodeResponseDTO[]> {
    const nodes = await this.nodeRepository.findAll();
    return NodeMapper.toResponseDTOArray(nodes);
  }
}
