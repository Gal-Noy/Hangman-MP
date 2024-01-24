import { useDispatch } from "react-redux";
import { useWebSocketContext } from "../../WebSocketContext";
import { setLobby } from "../../store/clientStateSlice";
import { useEffect } from "react";

function BackToLobby({ roomId }) {
  const { lastJsonMessage, sendJsonMessage } = useWebSocketContext();
  const dispatch = useDispatch();

  const leaveRoom = () => {
    sendJsonMessage({
      type: "room",
      content: {
        action: "leave",
        data: { roomId },
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
    <button className="btn btn-outline-danger mt-3 mx-1" onClick={leaveRoom}>
      Back to Lobby
    </button>
  );
}

export default BackToLobby;
