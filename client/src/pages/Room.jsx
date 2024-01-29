import React, { useState, useEffect } from "react";
import UsersList from "../components/Lobby/LobbyUsersList";
import PlayersList from "../components/Room/PlayersList";
import { useWebSocketContext } from "../WebSocketContext";
import { useDispatch, useSelector } from "react-redux";
import { setRoom, setLobby, setKickedFromRoom } from "../store/clientStateSlice";
import Chat from "../components/Chat/Chat";

function Room() {
  const { lastJsonMessage, sendJsonMessage } = useWebSocketContext();
  const [players, setPlayers] = useState([]);
  const roomData = useSelector((state) => state.clientState.roomData);
  const isRoomAdmin = JSON.parse(localStorage.getItem("user"))._id === roomData.admin;
  const dispatch = useDispatch();

  useEffect(() => {
    if (lastJsonMessage) {
      const { type, content } = lastJsonMessage;
      if (type === "updateRoomInfo" || type === "createRoomResponse") {
        dispatch(setRoom(content.data.room));
        const players = [...content.data.room.players];
        players.sort((a, b) => {
          return a.status === "ready" ? -1 : 1;
        });
        setPlayers(players);
      } else if (type === "kickFromRoom") {
        const { room } = content.data;
        dispatch(setKickedFromRoom(room.name));
        dispatch(setLobby(room));
      }
    }
  }, [lastJsonMessage]);

  const kickPlayer = (playerId) => {
    sendJsonMessage({
      type: "rooms",
      content: {
        action: "kick",
        data: {
          kickedPlayerId: playerId,
        },
      },
    });
  };

  return (
    <div className=" mb-1 w-75 d-flex flex-row">
      <PlayersList players={players} isRoomAdmin={isRoomAdmin} kickPlayer={kickPlayer} />
      <UsersList />
      <Chat />
    </div>
  );
}

export default Room;
