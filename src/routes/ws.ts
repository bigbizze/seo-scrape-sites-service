import { Express, NextFunction, Request, Response } from "express";
import httpProxy from "http-proxy";
import { parseData } from "../utils/general";
import { websocketLookup } from "../utils/websocket-lookup";
import { WebSocket } from "../utils";

export const createWebsocketRoute = (
  app: Express,
  wss: WebSocket.Server
) => {
  wss.on("connection", async function connection(ws: WebSocket) {
    console.log("ws connected");
    ws.onmessage = async function(msg: WebSocket.MessageEvent) {
      const data = parseData(msg.data);
      switch (data.type) {
        case "connection": {
          if (!websocketLookup.hasOwnProperty(data.sessionId)) {
            websocketLookup[data.sessionId] = [];
          }
          websocketLookup[data.sessionId].push({
            ws,
            timeConnected: new Date()
          });
        }
      }
    };
  });

  if (process.env.IS_LOCAL === "true") {
    const proxy = httpProxy.createProxy({
      target: {
        host: '0.0.0.0',
        port: process.env.PORT
      }
    });

    app.use("/ws", (req: Request, res: Response, next: NextFunction) => {
      proxy.web(req, res, {
        target: `ws://0.0.0.0:${process.env.PORT}`,
        ws: true
      }, next);
    });
  }
};
