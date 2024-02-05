import React, { createContext, useContext } from "react";

const WebSocketContext = createContext();

const WebSocketProvider = ({ children, value }) => (
  <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
);

const useWebSocketContext = () => useContext(WebSocketContext);

export { WebSocketProvider, useWebSocketContext };
