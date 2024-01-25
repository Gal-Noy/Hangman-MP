import { useDispatch } from "react-redux";
import { useWebSocketContext } from "../../WebSocketContext";
import { useState } from "react";

function ReadyBtn({ roomId }) {
  const { sendJsonMessage } = useWebSocketContext();
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const toggleReady = () => {
    sendJsonMessage({
      type: "room",
      content: {
        action: isPlayerReady ? "unready" : "ready",
        data: { roomId },
      },
    });
    setIsPlayerReady(!isPlayerReady);
  };

  return (
    <button
      className={"mt-3 me-2 btn " + (isPlayerReady ? "btn-success shadow" : "btn-outline-success")}
      onClick={toggleReady}
      style={{ marginLeft: "800px" }}
    >
      Ready
    </button>
  );
}

export default ReadyBtn;
