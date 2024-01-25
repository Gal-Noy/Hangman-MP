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
    <div className="chat-feed rounded bg-light m-2 h-100 overflow-auto">
      <div className="chat-messages d-flex flex-column align-items-end">
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
      </div>
    </div>
  );
}

export default ChatFeed;
