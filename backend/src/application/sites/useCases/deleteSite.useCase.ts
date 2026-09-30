import { type SiteRepository } from "../repositories/site.repository.js";
import { SiteNotFoundError } from "./updateSite.useCase.js";

export class SiteInUseError extends Error {}
export { SiteNotFoundError };

export default class DeleteSiteUseCase {
  constructor(private readonly siteRepository: SiteRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.siteRepository.findById(id);
    if (!existing) throw new SiteNotFoundError(`Sitio ${id} no encontrado`);

    await this.siteRepository.delete(id);
  }
}
