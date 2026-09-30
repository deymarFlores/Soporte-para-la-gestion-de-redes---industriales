import { type SiteRepository } from "../repositories/site.repository.js";
import { SiteEntity } from "../../../domain/sites/entities/site.entity.js";

export interface CreateSiteInput {
  name: string;
  location?: string;
  description?: string;
  enabled?: boolean;
}

export default class CreateSiteUseCase {
  constructor(private readonly siteRepository: SiteRepository) {}

  async execute(input: CreateSiteInput): Promise<SiteEntity> {
    const site = new SiteEntity({ ...input });
    return this.siteRepository.create(site);
  }
}
