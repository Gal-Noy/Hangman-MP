import React, { useState, useEffect } from "react";
import { useWebSocketContext } from "../../WebSocketContext";
import ChatFeed from "./ChatFeed";
import InputBar from "./InputBar";
import { useSelector } from "react-redux";
import "../../styles/Chat.css";

function Chat() {
  const { roomData } = useSelector((state) => state.clientState);
  const inRoom = !!roomData;
  const { lastJsonMessage } = useWebSocketContext();
  const [messages, setMessages] = useState([]);

  // Update messages when a new message is received
  useEffect(() => {
    if (lastJsonMessage) {
      const { type, content } = lastJsonMessage;
      if (type === "receiveChatMessage") {
        const { data, success } = content;
        if (success) {
          const newMessages = [...messages, { messageType: "chat", messageData: data }];
          setMessages(newMessages);
        }
      }
      if (type === "receiveChatLog") {
        const { data, success } = content;
        if (success) {
          const newMessages = [...messages, { messageType: "log", messageData: data }];
          setMessages(newMessages);
        }
      }
    }
  }, [lastJsonMessage]);
  return (
    <div className={`chat-container${inRoom ? " in-room" : ""}`}>
      <div className="chat-header-container">
        <span className={`chat-header-text${inRoom ? " in-room" : ""}`}>{inRoom ? "ROOM CHAT" : "LOBBY CHAT"}</span>
      </div>

      <ChatFeed messages={messages} inRoom={inRoom} />
      <InputBar roomId={roomData?.id} />
    </div>
  );
}

export default Chat;
