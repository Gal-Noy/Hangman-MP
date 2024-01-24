import React, { useState, useEffect } from "react";
import { useWebSocketContext } from "../../WebSocketContext";
import axios from "axios";
import ChatFeed from "./ChatFeed";
import InputBar from "./InputBar";

function Chat() {
  const { lastMessage, handleReceivedMessage } = useWebSocketContext();
  const [messages, setMessages] = useState([]);
  const [newMessageStatus, setNewMessageStatus] = useState("pending"); // "pending", "success", "error"
  const [isPendingFeed, setIsPendingFeed] = useState(true);
  const [feedError, setFeedError] = useState(null);

  // Initial fetch of messages
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_SERVER_URL}/api/chats/${import.meta.env.VITE_CHAT_ID}/messages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          const messages = res.data;
          console.log("messages: ", messages);
          setMessages(messages);
        } else {
          throw new Error("Could not fetch data");
        }
      })
      .then(() => setIsPendingFeed(false))
      .catch((err) => {
        console.error("Error fetching data: ", err);
        setIsPendingFeed(false);
        setFeedError("Could not fetch data.");
      });
  }, [isPendingFeed]);

  // Update messages when a new message is received
  useEffect(() => {
    handleReceivedMessage(
      lastMessage,
      "broadcastNewMessage",
      (content) => {
        const message = content.data;
        message.status = "success";
        const newMessages = [...messages, message];
        setMessages(newMessages);
      },
      () => {}
    );
  }, [lastMessage]);

  return (
    <div className="bg-gray-400 rounded d-flex flex-column w-50 h-90">
      <div className="users-list-header rounded bg-light mt-2 mx-2">
        <p className="text-center pt-2 fs-4 fw-bold text-dark">Lobby Chat</p>
      </div>
      <ChatFeed
        messages={messages}
        setMessages={setMessages}
        isPendingFeed={isPendingFeed}
        feedError={feedError}
        newMessageStatus={newMessageStatus}
      />
      <InputBar
        messages={messages}
        setMessages={setMessages}
        newMessageStatus={newMessageStatus}
        setNewMessageStatus={setNewMessageStatus}
      />
    </div>
  );
}

export default Chat;
