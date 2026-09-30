import { type SiteRepository } from "../repositories/site.repository.js";
import { SiteEntity } from "../../../domain/sites/entities/site.entity.js";

export interface UpdateSiteInput {
  name?: string;
  location?: string;
  description?: string;
  enabled?: boolean;
}

export class SiteNotFoundError extends Error {}

export default class UpdateSiteUseCase {
  constructor(private readonly siteRepository: SiteRepository) {}

  async execute(id: string, input: UpdateSiteInput): Promise<SiteEntity> {
    const existing = await this.siteRepository.findById(id);
    if (!existing) throw new SiteNotFoundError(`Sitio ${id} no encontrado`);

    const updated = new SiteEntity({
      id: existing.id,
      name: input.name ?? existing.name,
      location: input.location ?? existing.location,
      description: input.description ?? existing.description,
      enabled: input.enabled ?? existing.enabled,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    return this.siteRepository.update(updated);
  }
}
