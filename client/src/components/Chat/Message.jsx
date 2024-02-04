import React, { useRef, useState, useEffect } from "react";
import { b64toBlob } from "../../utils/utils";

function Message({ message }) {
  const { sender, text, attachment } = message;
  const convertedAttachment = attachment ? b64toBlob(attachment, "image/") : null;
  const [isZoomIn, setIsZoomIn] = useState(false);
  const isUserSender = sender.id === JSON.parse(localStorage.getItem("user"))._id;
  const zoomRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (zoomRef.current && !zoomRef.current.contains(event.target)) {
        setIsZoomIn(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [zoomRef]);

  const ZoomInAttachment = () => {
    return (
      <div ref={zoomRef} className="zoom-in-attachment-container">
        <img src={URL.createObjectURL(convertedAttachment)} alt="Uploaded" className="zoom-in-attachment-img" />
      </div>
    );
  };

  return (
    <div className={`message-container${isUserSender ? " user-sender" : " contact-sender"}`}>
      {!isUserSender && (
        <div className="message-sender-name">
          <strong>{sender.name}</strong>
        </div>
      )}
      <div className="message-content">
        {convertedAttachment && (
          <div className="message-content-attachment" type="button" onClick={() => setIsZoomIn(true)}>
            <img
              src={URL.createObjectURL(convertedAttachment)}
              alt="Attachment"
              className="message-content-attachment-img"
            />
            {isZoomIn && <ZoomInAttachment />}
          </div>
        )}
        {text && <div className="message-content-text">{text}</div>}
      </div>
    </div>
  );
}

export default Message;
