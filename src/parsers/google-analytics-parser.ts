import { ScrapeSiteJobEnqueue, ScrapeSiteResult } from "../types";
import { siteRequestCache } from "../utils/site-request-cache";
import { ParseFnReturn } from "./index";

export const googleAnalyticsParser = async (
  params: ScrapeSiteJobEnqueue,
  result: ScrapeSiteResult
): Promise<ParseFnReturn> => {
  const html = await siteRequestCache.getSite(
    params.placeId,
    params.website
  );
  if (!/(googletagmanager\.com)|(gtag\()|(google-analytics\.com)|(GoogleAnalyticsObject)/ig.test(html)) {
    return {
      needs: [
        ...result.needs,
        { reason: "NoGoogleAnalytics", confidence: "Definitely" }
      ]
    };
  }
};



