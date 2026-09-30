import type CreateSiteUseCase from "../../application/sites/useCases/createSite.useCase.js";
import type { CreateSiteInput } from "../../application/sites/useCases/createSite.useCase.js";
import type UpdateSiteUseCase from "../../application/sites/useCases/updateSite.useCase.js";
import type { UpdateSiteInput } from "../../application/sites/useCases/updateSite.useCase.js";
import type DeleteSiteUseCase from "../../application/sites/useCases/deleteSite.useCase.js";
import type ListSitesUseCase from "../../application/sites/useCases/listSites.useCase.js";
import { SiteMapper } from "../../domain/sites/mappers/site.mapper.js";
import type { SiteResponseDTO } from "../../domain/sites/dtos/siteResponse.dto.js";

export interface SiteServiceDependencies {
  createSiteUseCase: CreateSiteUseCase;
  updateSiteUseCase: UpdateSiteUseCase;
  deleteSiteUseCase: DeleteSiteUseCase;
  listSitesUseCase: ListSitesUseCase;
}

export class SiteService {
  constructor(private readonly deps: SiteServiceDependencies) {}

  async create(input: CreateSiteInput): Promise<SiteResponseDTO> {
    const site = await this.deps.createSiteUseCase.execute(input);
    return SiteMapper.toResponseDTO(site);
  }

  async update(id: string, input: UpdateSiteInput): Promise<SiteResponseDTO> {
    const site = await this.deps.updateSiteUseCase.execute(id, input);
    return SiteMapper.toResponseDTO(site);
  }

  async delete(id: string): Promise<void> {
    return this.deps.deleteSiteUseCase.execute(id);
  }

  async list(): Promise<SiteResponseDTO[]> {
    return this.deps.listSitesUseCase.execute();
  }
}
