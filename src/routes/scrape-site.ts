import { Express, Request, Response } from "express";
import { RouteError } from "../utils/route-errors";
import { v4 as uuid } from "uuid";
import { taskProcessor } from "../index";
import { ScrapeSiteJobEnqueue } from "../types";

export interface LeadRequest {
  id: string,
  placeId: string,
  website: string,
  isWordpress: boolean | null
}

export interface CheckSiteRequestBody {
  sessionId: string,
  leads: LeadRequest[]
}

type CheckSiteRequest = Request<{}, {}, CheckSiteRequestBody>;

const checkSite = (
  app: Express
) => {
  app.get("/site-scrape/test", (req: Request, res: Response) => {
    return res.json({ hello: "world" });
  })
  app.post("/site-scrape/check-site", async (req: CheckSiteRequest, res: Response) => {
    if (
      !req.body.hasOwnProperty("sessionId")
      || !req.body.hasOwnProperty("leads")
    ) {
      throw new RouteError(400, `no placeId or not uri!`);
    }
    console.log(`checking websites for ${req.body.leads.length} leads`);
    const _taskProcessor = await taskProcessor;
    const requestId = uuid();
    const toScrape: ScrapeSiteJobEnqueue[] = [];
    for (const lead of req.body.leads) {
      toScrape.push({
        ...lead,
        requestId,
        sessionId: req.body.sessionId,
      });
    }
    _taskProcessor.addJobs(toScrape)
      .catch(console.error);
    return res.sendStatus(200);
  });
};

export const createScrapeRequestRoute = (
  app: Express
) => {
  checkSite(app);
};
