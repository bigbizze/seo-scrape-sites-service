import { ScrapeSiteJobEnqueue, ScrapeSiteResult } from "../types";
import { ParseFnReturn } from "./index";
import { siteRequestCache } from "../utils/site-request-cache";

type WpTestReturn = { i: number, result: boolean };
const hasWpContent = async (
  i: number,
  params: ScrapeSiteJobEnqueue
): Promise<WpTestReturn> => {
  try {
    const html = await siteRequestCache.getSite(
      params.placeId,
      params.website
    );
    if (/\/wp-content\//ig.test(html)) {
      return { i, result: true };
    }
  } catch (e) {}
  return { i, result: false };
};

const hasWpLicenseText = async (
  i: number,
  params: ScrapeSiteJobEnqueue
): Promise<WpTestReturn> => {
  try {
    const paramSite = new URL(params.website);
    const uri = `${paramSite.protocol.replace(/:/ig, "")}://${paramSite.host}/license.txt`;
    const txt = await siteRequestCache.getSite(
      params.placeId,
      uri
    );
    if (/wordpress/ig.test(txt)) {
      return { i, result: true };
    }
  } catch (e) {}
  return { i, result: false };
};

const hasWpLogin = async (
  i: number,
  params: ScrapeSiteJobEnqueue
): Promise<WpTestReturn> => {
  try {
    const paramSite = new URL(params.website);
    const uri = `${paramSite.protocol.replace(/:/ig, "")}://${paramSite.host}/wp-login.php`;
    const html = await siteRequestCache.getSite(
      params.placeId,
      uri
    );
    if (/wordpress/ig.test(html)) {
      return { i, result: true };
    }
  } catch (e) {}
  return { i, result: false };
};

export const wordpressParser = async (
  params: ScrapeSiteJobEnqueue
): Promise<ParseFnReturn> => {
  try {
    let wpPromises: { idx: number, promise: Promise<WpTestReturn> }[] = [ hasWpContent, hasWpLicenseText, hasWpLogin ]
      .map((fn, i) => ({
        idx: i,
        promise: fn(i, params)
      }));
    while (!!wpPromises.length) {
      const { result, i } = await Promise.any(wpPromises.map(x => x.promise));
      if (result) {
        return { isWordpress: true };
      }
      wpPromises = wpPromises.filter(x => x.idx !== i);
    }
  } catch (e) {
    console.error(e);
  }
};
