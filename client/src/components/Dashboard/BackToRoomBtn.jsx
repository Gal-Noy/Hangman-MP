import React from "react";
import { useDispatch } from "react-redux";
import { setReturnToRoom } from "../../store/clientStateSlice";
import { useWebSocketContext } from "../../WebSocketContext";

function BackToRoomBtn() {
  const { sendJsonMessage } = useWebSocketContext();
  const dispatch = useDispatch();

  const handleBackToRoom = () => {
    sendJsonMessage({
      type: "rooms",
      content: {
        action: "return",
        data: {},
      },
    });
    dispatch(setReturnToRoom());
  };

  return (
    <button
      type="button"
      className="pheasant-demure-button outline light hover blink dashboard-menu-button"
      id="back-to-room-button"
      onClick={handleBackToRoom}
    >
      <span className="label">Back to Room</span>
    </button>
  );
}

export default BackToRoomBtn;
