import prisma from "../../infrastructure/database/prismaClient.js";
import { SiteService } from "./services.js";
import { SiteController } from "./controller.js";
import PrismaSiteRepository from "../../infrastructure/sites/repositories/SiteRepository.Impl.js";
import CreateSiteUseCase from "../../application/sites/useCases/createSite.useCase.js";
import UpdateSiteUseCase from "../../application/sites/useCases/updateSite.useCase.js";
import DeleteSiteUseCase from "../../application/sites/useCases/deleteSite.useCase.js";
import ListSitesUseCase from "../../application/sites/useCases/listSites.useCase.js";

export class SiteDependencies {
  static createController(): SiteController {
    const siteRepository = new PrismaSiteRepository(prisma);

    const siteService = new SiteService({
      createSiteUseCase: new CreateSiteUseCase(siteRepository),
      updateSiteUseCase: new UpdateSiteUseCase(siteRepository),
      deleteSiteUseCase: new DeleteSiteUseCase(siteRepository),
      listSitesUseCase: new ListSitesUseCase(siteRepository),
    });

    return new SiteController(siteService);
  }
}
