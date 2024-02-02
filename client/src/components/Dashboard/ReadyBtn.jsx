import { useDispatch } from "react-redux";
import { useWebSocketContext } from "../../WebSocketContext";
import { useState } from "react";

function ReadyBtn() {
  const { sendJsonMessage } = useWebSocketContext();
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const toggleReady = () => {
    sendJsonMessage({
      type: "rooms",
      content: {
        action: isPlayerReady ? "unready" : "ready",
        data: {},
      },
    });
    setIsPlayerReady(!isPlayerReady);
  };

  return (
    <button
      type="button"
      className={`dashboard-menu-button pheasant-demure-button outline light hover blink icon${
        isPlayerReady ? " active" : " inactive"
      }`}
      id="inRoom-ready-button"
      onClick={toggleReady}
    >
      <span className="label">Ready</span>
      <span class="material-icons icon">chevron_right</span>
    </button>
  );
}

export default ReadyBtn;
