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
      <div
        ref={zoomRef}
        className="confirmation-overlay position-absolute top-50 start-50 translate-middle h-auto rounded bg-secondary d-flex flex-column align-items-center"
      >
        <img
          src={URL.createObjectURL(convertedAttachment)}
          alt="Uploaded"
          className="img-fluid mt-2"
          style={{ maxWidth: "90%", maxHeight: "90%" }}
        />
        <button className="btn btn-danger m-2" onClick={() => setIsZoomIn(false)}>
          Cancel
        </button>
      </div>
    );
  };

  return (
    <div>
      {isZoomIn && <ZoomInAttachment />}
      <div
        key={message._id}
        className={`mx-3 mb-2 mt-2 text-white rounded d-flex ${
          isUserSender ? "flex-row-reverse bg-primary" : "flex-row align-self-start bg-secondary"
        }`}
      >
        <div className="m-1 fs-6">
          <strong>{sender.name}</strong>
        </div>
        <div className="message-content d-flex flex-column">
          {convertedAttachment && (
            <div className="mx-3 mt-1 mb-1 fs-6" type="button" onClick={() => setIsZoomIn(true)}>
              <img
                src={URL.createObjectURL(convertedAttachment)}
                alt="Uploaded"
                className="img-fluid"
                style={{ maxWidth: "90%" }}
              />
            </div>
          )}
          {text && <div className="m-1 fs-6">{text}</div>}
        </div>
      </div>
    </div>
  );
}

export default Message;
