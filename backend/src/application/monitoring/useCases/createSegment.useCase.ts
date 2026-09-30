import { type SegmentRepository } from "../repositories/segment.repository.js";
import { type NodeRepository } from "../repositories/node.repository.js";
import { SegmentEntity } from "../../../domain/monitoring/entities/segment.entity.js";

export interface CreateSegmentInput {
  name: string;
  originId: string;
  destinationId: string;
  connectionType?: string;
  monitoringMethod?: string;
  checkIntervalSeconds?: number;
  latencyThresholdMs?: number;
  packetLossThresholdPct?: number;
  enabled?: boolean;
}

export class NodeNotFoundForSegmentError extends Error {}

/**
 * Al crear un tramo, además de guardarlo, sincroniza el parentId del equipo destino —
 * es lo que el motor de correlación de incidentes usa para decidir causa raíz vs. síntoma.
 * El tramo es la fuente administrativa de la topología; parentId es su caché de lectura rápida.
 */
export default class CreateSegmentUseCase {
  constructor(
    private readonly segmentRepository: SegmentRepository,
    private readonly nodeRepository: NodeRepository
  ) {}

  async execute(input: CreateSegmentInput): Promise<SegmentEntity> {
    const [origin, destination] = await Promise.all([
      this.nodeRepository.findById(input.originId),
      this.nodeRepository.findById(input.destinationId),
    ]);
    if (!origin || !destination) throw new NodeNotFoundForSegmentError("Origen o destino no encontrado");

    const segment = new SegmentEntity({ ...input });
    const created = await this.segmentRepository.create(segment);

    destination.setParent(origin.id as string);
    await this.nodeRepository.update(destination);

    return created;
  }
}
