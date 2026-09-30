import { type NodeRepository } from "../repositories/node.repository.js";
import { NodeNotFoundError } from "./updateNode.useCase.js";

export class NodeInUseError extends Error {}
export { NodeNotFoundError };

export default class DeleteNodeUseCase {
  constructor(private readonly nodeRepository: NodeRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.nodeRepository.findById(id);
    if (!existing) throw new NodeNotFoundError(`Equipo ${id} no encontrado`);

    await this.nodeRepository.delete(id);
  }
}
