// noinspection ExceptionCaughtLocallyJS

import { IS_DEV, SITE_API_URL } from "./utils/general";
import { ScrapeSiteResult } from "./types";
import fetch from "node-fetch";
import * as https from "https";

export const updateApiDb = async (
  result: ScrapeSiteResult
) => {
  try {
    const res = await fetch(SITE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...result,
        website: result.website.toString()
      }),
      agent: IS_DEV ? new https.Agent({
        rejectUnauthorized: false,
      }) : undefined
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
  } catch (e) {
    console.error(e);
  }
};


