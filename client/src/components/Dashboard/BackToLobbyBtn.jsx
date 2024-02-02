import { useDispatch } from "react-redux";
import { useWebSocketContext } from "../../WebSocketContext";
import { setLobby } from "../../store/clientStateSlice";
import { useEffect } from "react";

function BackToLobbyBtn() {
  const { lastJsonMessage, sendJsonMessage } = useWebSocketContext();
  const dispatch = useDispatch();

  const leaveRoom = () => {
    sendJsonMessage({
      type: "rooms",
      content: {
        action: "leave",
        data: {},
      },
    });
  };

  useEffect(() => {
    if (lastJsonMessage) {
      const { type } = lastJsonMessage;
      if (type === "leaveRoomResponse") {
        dispatch(setLobby());
      }
    }
  }, [lastJsonMessage]);

  return (
    <button
      type="button"
      className="dashboard-menu-button pheasant-demure-button outline light hover blink"
      id="inRoom-backToLobby-button"
      onClick={leaveRoom}
    >
      <span className="label">Back to Lobby</span>
    </button>
  );
}

export default BackToLobbyBtn;
