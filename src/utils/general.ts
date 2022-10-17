import { WsEvents } from "../types";
import path from "path";

require('dotenv').config({
  path: path.resolve(require('app-root-path').path, ".env")
});

export const IS_DEV = process.env.IS_DEV === "true";

export const SITE_API_URL = !IS_DEV
  ? `${process.env.LIVE_DOMAIN}/api/updateLeads`
  : "https://0.0.0.0:44386/api/updateLeads"

process.on('uncaughtException', (err: Error) => {
  console.error(err, 'The main process');
});

process.on('unhandledRejection', err => {
  console.error(err as any, 'A main process Promise');
});

export const parseData = (data: string | Buffer | ArrayBuffer | Buffer[]): WsEvents => {
  if (typeof data === "string") {
    return JSON.parse(data);
  } else if (Buffer.isBuffer(data)) {
    return parseData(data.toString());
  } else if (Array.isArray(data)) {
    return parseData(data.map(x => x.toString()).join(""));
  } else {
    const enc = new TextDecoder("utf-8");
    return parseData(enc.decode(data));
  }
};
