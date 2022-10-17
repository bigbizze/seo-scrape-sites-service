import { addMinutes, isAfter } from "date-fns";
import { WebSocket } from "./index";

export const websocketLookup: {[userId: string]: { timeConnected: Date, ws: WebSocket }[] } = {};

setInterval(() => {
  const now = new Date();
  for (const sessionId in websocketLookup) {
    let toDelete: number[] = [];
    for (let i = 0; i < websocketLookup[sessionId].length; i++)  {
      const expiresAt = addMinutes(websocketLookup[sessionId][i].timeConnected, 15);
      if (
        websocketLookup[sessionId][i].ws.readyState !== 1
        || isAfter(now, expiresAt)
      ) {
        websocketLookup[sessionId][i].ws.close();
        toDelete.push(i);
      }
    }
    websocketLookup[sessionId] =  websocketLookup[sessionId]
      .filter((_, i) => !toDelete.includes(i));
    if (!!websocketLookup[sessionId].length) {
      delete websocketLookup[sessionId];
    }
  }
}, 1000 * 60 * 3);

