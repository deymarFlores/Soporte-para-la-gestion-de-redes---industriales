import { type Request, type Response } from "express";
import { type SiteService } from "./services.js";
import { SiteNotFoundError } from "../../application/sites/useCases/updateSite.useCase.js";
import { SiteInUseError } from "../../application/sites/useCases/deleteSite.useCase.js";

export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const site = await this.siteService.create(req.body);
      res.status(201).json({ success: true, data: site });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const site = await this.siteService.update(req.params["id"] as string, req.body);
      res.json({ success: true, data: site });
    } catch (error) {
      if (error instanceof SiteNotFoundError) {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.siteService.delete(req.params["id"] as string);
      res.json({ success: true, data: null });
    } catch (error) {
      if (error instanceof SiteNotFoundError) {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      if (error instanceof SiteInUseError) {
        res.status(409).json({ success: false, error: error.message });
        return;
      }
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  };

  list = async (_req: Request, res: Response): Promise<void> => {
    try {
      const sites = await this.siteService.list();
      res.json({ success: true, data: sites });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  };
}
