import React, { useState, useEffect } from "react";
import { useWebSocketContext } from "../../WebSocketContext";
import { convertToBase64 } from "../../utils/utils";

function InputBar({ roomId }) {
  const { sendJsonMessage } = useWebSocketContext();
  const [newMessageText, setNewMessageText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [attachmentError, setAttachmentError] = useState(null);
  const [showAttachmentConfirmation, setShowAttachmentConfirmation] = useState(false);
  const [attachmentConfirmed, setAttachmentConfirmed] = useState(false);

  const handleSendMessage = async () => {
    if (newMessageText === "" && !attachment) return;

    const user = JSON.parse(localStorage.getItem("user"));

    let base64;
    if (attachment) {
      base64 = await convertToBase64(attachment);
    }

    const newMessageObj = {
      roomId: !roomId ? 0 : roomId,
      text: newMessageText,
      sender: {
        id: user._id,
        name: user.name,
      },
      attachment: !attachment ? null : base64.split(",")[1],
    };

    sendJsonMessage({
      type: "chats",
      content: {
        action: "send",
        data: newMessageObj,
      },
    });

    setNewMessageText("");
    setAttachment(null);
  };

  const handleAttachmentChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      if (!selectedFile.type.startsWith("image/")) {
        setAttachment(null);
        setAttachmentError("Please select a valid image file.");
      } else {
        setAttachment(selectedFile);
        setAttachmentError(null);
        setAttachmentConfirmed(false);
        setShowAttachmentConfirmation(true);
      }
    }
  };

  const AttachmentConfirmation = () => {
    return (
      <div className="attachment-confirmation-container">
        <img className="attachment-confirmation-img" src={URL.createObjectURL(attachment)} alt="Attachment preview" />
        <div className="attachment-confirmation-buttons">
          <button
            className="attachment-confirmation-btn"
            onClick={() => {
              setAttachmentConfirmed(true);
              setShowAttachmentConfirmation(false);
            }}
          >
            Confirm
          </button>
          <button className="attachment-confirmation-btn" onClick={() => setShowAttachmentConfirmation(false)}>
            Cancel
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (attachmentError) {
      setAttachmentError(null);
    }
  }, []);

  return (
    <div className={`input-bar-container${roomId ? " in-room" : ""}`}>
      {showAttachmentConfirmation && attachment && <AttachmentConfirmation />}
      <div className="input-bar">
        {attachmentError && (
          <div className="input-bar-attachment-error" role="alert">
            {attachmentError}
          </div>
        )}
        <input
          className="input-bar-message-input"
          type="text"
          placeholder="Enter your message..."
          value={newMessageText}
          onChange={(e) => {
            if (attachmentError) {
              setAttachmentError(null);
            }
            setNewMessageText(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <input
          className="input-bar-attachment-input"
          id="add-attachment-input"
          type="file"
          onChange={handleAttachmentChange}
          inputprops={{ accept: "image/*" }}
        />
        <div className="input-bar-attachment-button-container">
          {attachment && attachmentConfirmed && (
            <span
              className="material-symbols-outlined"
              id="cancel-attachment-button"
              onClick={() => setAttachment(null)}
            >
              cancel
            </span>
          )}
          <button
            className={"input-bar-attachment-button" + (attachment && attachmentConfirmed ? " attached" : "")}
            type="button"
            onClick={() => document.getElementById("add-attachment-input").click()}
          >
            <span className="material-symbols-outlined">attach_file</span>
          </button>
        </div>
        <button className="input-bar-send-button" type="button" onClick={handleSendMessage}>
          <span className="material-symbols-outlined">send</span>
        </button>
      </div>
    </div>
  );
}

export default InputBar;
