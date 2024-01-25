function Message({ message }) {
  const { sender, text, attachment } = message;
  const isUserSender = sender.id === JSON.parse(localStorage.getItem("user"))._id;

  const b64toBlob = (b64Data, contentType = "", sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  };

  return (
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
        {attachment && (
          <div className="mx-3 mt-1 mb-1 fs-6">
            <img
              src={URL.createObjectURL(b64toBlob(attachment, "image/"))}
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
