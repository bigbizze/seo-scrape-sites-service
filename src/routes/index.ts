import { createScrapeRequestRoute } from "./scrape-site";
import { Express } from "express";
import { createWebsocketRoute } from "./ws";
import { WebSocket } from "../utils";

type RouteFn = (
  app: Express,
  ws: WebSocket.Server
) => void;

export const httpRoutes: RouteFn[] = [
  createWebsocketRoute,
  createScrapeRequestRoute
];

export {  };







