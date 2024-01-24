function Message({ message }) {
  const { sender, text, status, attachment } = message;
  const isUserSender = sender === JSON.parse(localStorage.getItem("user")).name;

  return (
    <div
      key={message._id}
      className={`mx-3 mb-2 mt-2 text-white rounded d-flex ${
        isUserSender ? "flex-row-reverse bg-primary" : "flex-row align-self-start bg-secondary"
      }`}
    >
      <div className="mx-2 mt-1">{status === "success" ? "✅" : status === "pending" ? "🕒" : "❌"}</div>
      <div className="m-1 fs-6">
        <strong>{sender}</strong>
      </div>
      <div className="message-content d-flex flex-column">
        {attachment && (
          <div className="mx-3 mt-1 mb-1 fs-6">
            <img
              src={URL.createObjectURL(attachment)}
              alt="Uploaded"
              className="img-fluid"
              style={{ maxWidth: "90%" }}
            />
          </div>
        )}
        {text && <div className="m-1 fs-6">{text}</div>}
      </div>
    </div>
  );
}
export default Message;
