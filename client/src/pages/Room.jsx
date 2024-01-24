import React, { useEffect } from "react";
import UsersList from "../components/Lobby/UsersList";
import PlayersList from "../components/Room/PlayersList";
import { useWebSocketContext } from "../WebSocketContext";

// import Chat from "../components/Chat/Chat";

function Room() {
  const { lastJsonMessage } = useWebSocketContext();

  useEffect(() => {
    if (lastJsonMessage) {
      const { type, content } = lastJsonMessage;
      console.log(type, content);
    }
  }, [lastJsonMessage]);

  return (
    <div className=" mb-1 w-75 d-flex flex-row">
      {/* <Chat /> */}
      {/* <RoomsList /> */}
      <PlayersList />
      <UsersList />
    </div>
  );
}

export default Room;
