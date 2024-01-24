import React, { useEffect, useState } from "react";
import axios from "axios";
import { useWebSocketContext } from "../../WebSocketContext";
import { GrAttachment } from "react-icons/gr";
import { FcCancel } from "react-icons/fc";

function InputBar({ messages, setMessages, newMessageStatus, setNewMessageStatus }) {
  const { sendJsonMessage } = useWebSocketContext();
  const [newMessageText, setNewMessageText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [attachmentError, setAttachmentError] = useState(null);
  const [showAttachmentConfirmation, setShowAttachmentConfirmation] = useState(false);
  const [attachmentConfirmed, setAttachmentConfirmed] = useState(false);

  const handleSendMessage = () => {
    if (newMessageText === "" && !attachment) return;

    const newMessageObj = {
      text: newMessageText,
      sender: JSON.parse(localStorage.getItem("user")).name,
      status: newMessageStatus,
      attachment: attachment,
    };

    try {
      const newMessages = [...messages, newMessageObj];
      setMessages(newMessages);

      setNewMessageText("");
      setNewMessageStatus("pending");
      setAttachment(null);

      axios
        .post(`${import.meta.env.VITE_SERVER_URL}/api/chats/${import.meta.env.VITE_CHAT_ID}/messages`, newMessageObj, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        })
        .then((res) => {
          if (res.status === 200) {
            setNewMessageStatus("success");
            sendJsonMessage({
              type: "chat",
              content: {
                action: "sendMessage",
                data: newMessageObj,
              },
            });
          } else {
            setNewMessageStatus("error");
            throw new Error("Could not send message.");
          }
        })
        .catch((err) => {
          console.error("Error sending message: ", err);
          setNewMessageStatus("error");
        });
    } catch (err) {
      console.log(err);
    }
  };

  // const convertFileToBase64 = (file) => {
  //   return new Promise((resolve, reject) => {
  //     const fileReader = new FileReader();
  //     fileReader.readAsDataURL(file);

  //     fileReader.onload = () => {
  //       resolve(fileReader.result);
  //     };

  //     fileReader.onerror = (err) => {
  //       reject(err);
  //     };
  //   });
  // };

  const handleAttachmentChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      if (!selectedFile.type.startsWith("image/")) {
        setAttachment(null);
        setAttachmentError("Please select a valid image file.");

        setTimeout(() => {
          setAttachmentError(null);
        }, 3000);
      } else {
        // const base64SelectedFile = await convertFileToBase64(selectedFile);
        // setAttachment(base64SelectedFile);
        setAttachment(selectedFile);
        setAttachmentError(null);
        setAttachmentConfirmed(false);
        setShowAttachmentConfirmation(true);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAttachmentError(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [attachmentError]);

  const AttachmentConfirmation = () => {
    return (
      <div className="attachment-confirmation">
        {showAttachmentConfirmation && attachment && (
          <div className="confirmation-overlay position-absolute top-50 start-50 translate-middle h-auto rounded bg-secondary d-flex flex-column align-items-center">
            <img
              src={URL.createObjectURL(attachment)}
              alt="Uploaded"
              className="img-fluid mt-2"
              style={{ maxWidth: "90%", maxHeight: "90%" }}
            />
            <div className="buttons my-3">
              <button
                className="btn btn-success mx-2"
                onClick={() => {
                  setAttachmentConfirmed(true);
                  setShowAttachmentConfirmation(false);
                }}
              >
                Confirm
              </button>
              <button className="btn btn-danger mx-2" onClick={() => setShowAttachmentConfirmation(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="input-bar-component">
      <AttachmentConfirmation
        attachment={attachment}
        showAttachmentConfirmation={showAttachmentConfirmation}
        setShowAttachmentConfirmation={setShowAttachmentConfirmation}
        setAttachmentConfirmed={setAttachmentConfirmed}
      />
      <div className="chat-input rounded m-2">
        {attachmentError && (
          <div
            className="alert alert-danger position-absolute translate-middle-y start-45 z-3 mt-3 p-2 ms-2"
            role="alert"
          >
            {attachmentError}
          </div>
        )}
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Enter your message..."
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />
          {/* File input - hidden */}
          <input
            type="file"
            id="add-attch-input"
            className="d-none"
            onChange={handleAttachmentChange}
            inputprops={{ accept: "image/*" }}
          />
          {/* Attachment button */}
          {attachment && attachmentConfirmed && (
            <div className="cancel-btn" type="button" id="cancel-attachment-btn" onClick={() => setAttachment(null)}>
              <FcCancel />
            </div>
          )}
          <button
            className={"btn me-1 rounded-start" + (attachment && attachmentConfirmed ? " btn-dark" : " btn-secondary")}
            type="button"
            id="add-attch-btn"
            onClick={() => document.getElementById("add-attch-input").click()}
          >
            <GrAttachment />
          </button>
          {/* Send button */}
          <button className="btn btn-secondary rounded-end" type="button" id="send-msg-btn" onClick={handleSendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputBar;
