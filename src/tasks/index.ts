import { makeTaskProcessor, OnJobSuccessFn, ProcessCreateSiteJobFn } from "./task-processor";
import { applyParsers } from "../parsers";
import { websocketLookup } from "../utils/websocket-lookup";
export { makeTaskProcessor };

export const processTaskFn: ProcessCreateSiteJobFn = applyParsers;

export const onTaskSuccessFn: OnJobSuccessFn = async result => {
  if (!websocketLookup.hasOwnProperty(result.sessionId)) {
    throw new Error("missing connection for userId!");
  }
  for (const { ws } of websocketLookup[result.sessionId]) {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({
        type: "scrapeSiteUpdateLead",
        data: result
      }))
    }
  }
};
