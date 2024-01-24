import { useEffect, useRef } from "react";
import Message from "./Message";

function ChatFeed({ messages, setMessages, isPendingFeed, feedError, newMessageStatus }) {
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      const updatedMessages = messages.map((message, index) => {
        if (index === messages.length - 1) {
          return { ...message, status: newMessageStatus };
        }
        return message;
      });

      setMessages(updatedMessages);

      // Scroll to the bottom when a new message is added
      if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
      }
    }
  }, [newMessageStatus]);

  return (
    <div className="chat-feed rounded bg-light m-2 h-500 overflow-auto">
      <div className="chat-messages d-flex flex-column align-items-end">
        {feedError && (
          <div className="alert alert-danger mb-2" role="alert">
            {feedError}
          </div>
        )}
        {!feedError && isPendingFeed && <p>Loading...</p>}
        {!feedError && messages.map((message, index) => <Message key={index} message={message} />)}
      </div>
    </div>
  );
}

export default ChatFeed;
