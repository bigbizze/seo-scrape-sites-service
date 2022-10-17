import express, { Express} from "express";
import { errorHandlingMiddleware } from "./utils/route-errors";
import { WebSocket } from "./utils";

const PORT = Number(process.env.PORT);

export const createServer = async (addRouteFn: (app: Express, ws: WebSocket.Server) => void) => {
  const app = express();
  app.use(express.json({ limit: "256mb" }));
  app.use(require("cors")({ origin: true }));
  const server = require('http').createServer(app);
  const wss: WebSocket.Server = new WebSocket.Server({
    server,
    handleProtocols: "sec-websocket-protocol"
  });
  app.use(errorHandlingMiddleware);
  addRouteFn(app, wss);
  app.use(errorHandlingMiddleware);
  server.listen(PORT, () => console.log(`listening on: ${ PORT }`));
};
