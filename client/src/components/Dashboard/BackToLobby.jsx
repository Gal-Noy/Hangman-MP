import { useSelector } from "react-redux";
import { setLobby } from "../../store/clientStateSlice";
import { useDispatch } from "react-redux";
import { useWebSocketContext } from "../../WebSocketContext";

function BackToLobby() {
  const { sendJsonMessage } = useWebSocketContext();
  const roomData = useSelector((state) => state.clientState.roomData);
  const dispatch = useDispatch();

  const leaveRoom = () => {
    sendJsonMessage({
      type: "room",
      content: {
        action: "leave",
        data: { roomId: roomData.id },
      },
    });
    dispatch(setLobby());
  };

  return (
    <button className="btn btn-outline-danger mt-3 mx-1" onClick={leaveRoom}>
      Back to Lobby
    </button>
  );
}

export default BackToLobby;
