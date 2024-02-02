import React, { useState, useEffect } from "react";
import { useWebSocketContext } from "../../WebSocketContext";
import ChatFeed from "./ChatFeed";
import InputBar from "./InputBar";
import { useSelector } from "react-redux";
import "../../styles/Chat.scss";

function Chat() {
  const { roomData } = useSelector((state) => state.clientState);
  const { lastJsonMessage } = useWebSocketContext();
  const [messages, setMessages] = useState([]);

  // Update messages when a new message is received
  useEffect(() => {
    if (lastJsonMessage) {
      const { type, content } = lastJsonMessage;
      if (type === "receiveChatMessage") {
        const { data, success } = content;
        if (success) {
          const newMessages = [...messages, data];
          setMessages(newMessages);
        } else {
          console.log("Error receiving message");
        }
      }
    }
  }, [lastJsonMessage]);

  return (
    <div className="chat-container">
      {!roomData && (
        <div className="chat-header-container">
          <span className="chat-header-text">LOBBY CHAT</span>
        </div>
      )}
      <ChatFeed messages={messages} />
      <InputBar messages={messages} setMessages={setMessages} roomId={roomData?.id} />
    </div>
  );
}

export default Chat;
