// noinspection ExceptionCaughtLocallyJS

import fetch, { RequestInit } from "node-fetch";

class SiteRequestCache {
  mutexLock: {[placeId: string]: boolean} = {};
  siteContentLookup: {[placeId: string]: string} = {};
  async getSite(
    placeId: string,
    website: string | URL,
    init?: RequestInit
  ): Promise<string> {
    let attempts = 0;
    while (this.mutexLock[placeId]) {
      if (attempts > 100) {
        throw new Error(`unable to make request for placeId: ${placeId}`);
      }
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }
    if (this.siteContentLookup.hasOwnProperty(placeId)) {
      return this.siteContentLookup[placeId];
    }
    this.mutexLock[placeId] = true;
    try {
      const res = await fetch(website, {
        method: "GET",
        timeout: 3000,
        ...init
      });
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      const html = await res.text();
      if (html.trim() !== "") {
        this.siteContentLookup[placeId] = html;
      }
      return html;
    } catch (e) {
      throw e;
    } finally {
      this.mutexLock[placeId] = false;
    }
  }
  removeSite(
    placeId: string
  ) {
    if (this.siteContentLookup.hasOwnProperty(placeId)) {
      delete this.siteContentLookup[placeId];
    }
  }
}

export const siteRequestCache = new SiteRequestCache();
