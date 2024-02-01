import { useEffect, useRef } from "react";
import Message from "./Message";

function ChatFeed({ messages }) {
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      // Scroll to the bottom when a new message is added
      if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="chat-feed">
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
    </div>
  );
}

export default ChatFeed;
