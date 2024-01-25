import React, { useState, useEffect } from "react";
import { useWebSocketContext } from "../../WebSocketContext";
import ChatFeed from "./ChatFeed";
import InputBar from "./InputBar";
import { useSelector } from "react-redux";

function Chat() {
  const roomData = useSelector((state) => state.clientState.roomData);
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
    <div className="bg-gray-400 rounded d-flex flex-column w-50 h-100 ms-1">
      <div className="users-list-header rounded bg-light mt-2 mx-2">
        <p className="text-center pt-2 fs-4 fw-bold text-dark">
          {!roomData ? "Lobby Chat" : `${roomData.name} - chat`}
        </p>
      </div>
      <ChatFeed messages={messages} />
      <InputBar messages={messages} setMessages={setMessages} roomId={roomData?.id} />
    </div>
  );
}

export default Chat;
