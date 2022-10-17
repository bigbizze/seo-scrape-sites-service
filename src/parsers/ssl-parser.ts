import fetch from "node-fetch";
import { MarketingIssue, ScrapeSiteJobEnqueue, ScrapeSiteResult } from "../types";
import { siteRequestCache } from "../utils/site-request-cache";
import { ParseFnReturn } from "./index";

const testUpdatedSSL = async (
  params: ScrapeSiteJobEnqueue
): Promise<MarketingIssue | undefined | void> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000)
  const paramSite = new URL(params.website);
  paramSite.protocol = "https";
  params.website = paramSite.toString();
  try {
    await siteRequestCache.getSite(params.placeId, params.website, {
      signal: controller.signal as any
    });
  } catch (e) {
    if (e instanceof Error && !!e?.name && e.name === "AbortError") {
      return "SlowOrNotLoadingWebsite";
    }
    return "NoSSL";
  } finally {
    clearTimeout(timeoutId);
  }
};

const testSSL = async (
  params: ScrapeSiteJobEnqueue
): Promise<MarketingIssue | undefined | void> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(params.website, {
      method: "HEAD",
      redirect: "manual",
      timeout: 3000,
      signal: controller.signal as any
    });
    if (res.ok) {
      const responseUri = new URL(res.url);
      if (responseUri.protocol.replace(/:/ig, "") !== "https") {
        return "NoSSLRedirect";
      }
    } else {
      if (res.status !== 301 && res.status !== 307) {
        return "NoSSLRedirect";
      }
    }
  } catch (e) {
    if (!(e instanceof Error)) {
      return console.error(e);
    } else if (e.name === "AbortError") {
      return "SlowOrNotLoadingWebsite";
    }
  } finally {
    clearTimeout(timeoutId);
  }
};

const testLoadingSpeed = async (
  params: ScrapeSiteJobEnqueue
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    await siteRequestCache.getSite(params.placeId, params.website, {
      signal: controller.signal as any
    });
  } catch (e) {
    if (e instanceof Error && !!e?.name && e.name === "AbortError") {
      return "SlowOrNotLoadingWebsite";
    }
  } finally {
    clearTimeout(timeoutId)
  }
};

export const sslParser = async (
  params: ScrapeSiteJobEnqueue,
  result: ScrapeSiteResult
): Promise<ParseFnReturn> => {
  const paramSite = new URL(params.website);
  if (paramSite.protocol.replace(/:/ig, "") === "https") {
    const slowLoadingTestResult = await testLoadingSpeed(params);
    if (!slowLoadingTestResult) {
      return;
    }
    return {
      needs: [
        ...result.needs,
        { reason: "SlowOrNotLoadingWebsite", confidence: "Definitely" }
      ]
    };
  }
  const sslResult = await testSSL(params);
  if (!sslResult) {
    const newWebsite = new URL(params.website.toString());
    newWebsite.protocol = "https";
    return {
      website: newWebsite.toString()
    };
  } else if (sslResult === "SlowOrNotLoadingWebsite") {
    return {
      needs: [
        ...result.needs,
        { reason: "SlowOrNotLoadingWebsite", confidence: "Definitely" }
      ]
    };
  }
  const needsSSLResult = await testUpdatedSSL(params);
  if (!needsSSLResult) {
    return {
      needs: [
        ...result.needs,
        { reason: "NoSSLRedirect", confidence: "Definitely" }
      ]
    };
  } else if (needsSSLResult === "SlowOrNotLoadingWebsite") {
    return {
      needs: [
        ...result.needs,
        { reason: "SlowOrNotLoadingWebsite", confidence: "Definitely" }
      ]
    };
  }
  return {
    needs: [
      ...result.needs,
      { reason: "NoSSL", confidence: "Definitely" }
    ]
  };
};


