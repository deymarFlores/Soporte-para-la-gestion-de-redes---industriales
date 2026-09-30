import { type SiteRepository } from "../repositories/site.repository.js";
import { SiteMapper } from "../../../domain/sites/mappers/site.mapper.js";
import { type SiteResponseDTO } from "../../../domain/sites/dtos/siteResponse.dto.js";

export default class ListSitesUseCase {
  constructor(private readonly siteRepository: SiteRepository) {}

  async execute(): Promise<SiteResponseDTO[]> {
    const sites = await this.siteRepository.findAll();
    return SiteMapper.toResponseDTOArray(sites);
  }
}
