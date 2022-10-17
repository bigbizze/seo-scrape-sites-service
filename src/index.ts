import "./utils";
import { httpRoutes } from "./routes";
import { createServer } from "./create-server";
import { makeTaskProcessor } from "./tasks";

export const taskProcessor = makeTaskProcessor();
createServer((app, ws) => {
  for (const route of httpRoutes) {
    route(app, ws);
  }
})
  .catch(console.error);


