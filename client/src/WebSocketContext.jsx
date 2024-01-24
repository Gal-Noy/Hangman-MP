import React, { createContext, useContext } from "react";

const WebSocketContext = createContext();

const WebSocketProvider = ({ children, value }) => (
  <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
);

const useWebSocketContext = () => useContext(WebSocketContext);

const handleReceivedMessage = (message, typeName, handleContent, handleWrongType) => {
  try {
    if (message) {
      const { type, content } = JSON.parse(message.data);
      if (type === typeName) {
        handleContent(content);
      } else {
        handleWrongType();
      }
    }
  } catch (e) {
    console.log(e);
  }
};

export { WebSocketProvider, useWebSocketContext, handleReceivedMessage };
