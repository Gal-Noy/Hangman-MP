import React, { useState, useEffect } from "react";
import UsersList from "../components/Lobby/LobbyUsersList";
import PlayersList from "../components/Room/PlayersList";
import { useWebSocketContext } from "../WebSocketContext";
import { useDispatch, useSelector } from "react-redux";
import { setRoom } from "../store/clientStateSlice";

// import Chat from "../components/Chat/Chat";

function Room() {
  const { lastJsonMessage } = useWebSocketContext();
  const [players, setPlayers] = useState([]);
  const roomData = useSelector((state) => state.clientState.roomData);
  const dispatch = useDispatch();

  const handlePlayers = (players) => {
    players.sort((a, b) => {
      return a.status === "ready" ? -1 : 1;
    });
    setPlayers(players);
    dispatch(setRoom({ ...roomData, players }));
  };

  useEffect(() => {
    if (lastJsonMessage) {
      const { type, content } = lastJsonMessage;
      if (type === "updateRoomInfo" || type === "createRoomResponse") {
        const { players } = content.data.room;
        handlePlayers(players);
      }
    }
  }, [lastJsonMessage]);

  return (
    <div className=" mb-1 w-75 d-flex flex-row">
      {/* <Chat /> */}
      {/* <RoomsList /> */}
      <PlayersList players={players} />
      <UsersList />
    </div>
  );
}

export default Room;
