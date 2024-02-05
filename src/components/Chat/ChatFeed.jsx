import { useEffect, useRef } from "react";
import Message from "./Message";
import LogMessage from "./LogMessage";

function ChatFeed(props) {
  const { messages, inRoom } = props;
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
    <div className={`chat-feed${inRoom ? " in-room" : ""}`}>
      {messages.map((message, index) =>
        message.messageType === "chat" ? (
          <Message message={message.messageData} key={index} />
        ) : (
          <LogMessage message={message.messageData} key={index} />
        )
      )}
    </div>
  );
}

export default ChatFeed;
