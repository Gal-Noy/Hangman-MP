function LogMessage({ message }) {
  const { logType, logMessage } = message;
  return (
    <div className="log-message" id={`log-message-type-${logType}`}>
      {logMessage && <span className="log-message-text">{logMessage}</span>}
    </div>
  );
}

export default LogMessage;
