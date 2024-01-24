import expressWs from "express-ws";
import authHandler from "./authHandler.js";
import roomsManager from "./roomsManager.js";
import { v4 } from "uuid";

export const clients = {};

const handleSocket = (app) => {
  expressWs(app);

  app.ws("/ws", (ws, req) => {
    const clientId = v4();
    clients[clientId] = ws;
    console.log(`Client connected with id ${clientId}`);

    ws.on("message", function message(data, isBinary) {
      try {
        const message = isBinary ? data : JSON.parse(data);
        const { type, content } = message;

        const handler = {
          auth: authHandler,
          room: roomsManager,
        }[type];

        if (handler) {
          handler(content, ws);
        }
      } catch (e) {
        console.log(e);
      }
    });

    ws.on("close", () => {
      console.log(`Client disconnected with id ${clientId}`);
      delete clients[clientId];
    });
  });
};

export default handleSocket;
