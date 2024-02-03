import React, { useState, useEffect } from "react";
import UsersList from "../components/UsersList/UsersList";
import PlayersList from "../components/Room/PlayersList";
import { useWebSocketContext } from "../WebSocketContext";
import { useDispatch, useSelector } from "react-redux";
import { setRoom, setLobby, setKickedFromRoom } from "../store/clientStateSlice";
import Chat from "../components/Chat/Chat";
import "../styles/Room.scss";
import { sortPlayersList } from "../utils/utils";

// TODO: Implement edit game rules

function Room() {
  const { lastJsonMessage, sendJsonMessage } = useWebSocketContext();
  const [players, setPlayers] = useState([]);
  const { roomData } = useSelector((state) => state.clientState);
  const isRoomAdmin = JSON.parse(localStorage.getItem("user"))._id === roomData.admin.id;
  const dispatch = useDispatch();

  useEffect(() => {
    if (lastJsonMessage) {
      const { type, content } = lastJsonMessage;
      if (type === "updateRoomInfo" || type === "createRoomResponse") {
        dispatch(setRoom(content.data.room));
        const players = [...content.data.room.players];

        const sortedPlayers = sortPlayersList(players);

        setPlayers(sortedPlayers);
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
    <div className="room-container">
      <div className="room-content">
        <div className="room-info">
          <span className="room-info-room-name">{roomData.name}</span>
          <div className="room-info-game-rule">
            <span className="room-info-game-rule-title">Total Rounds</span> {roomData.gameRules.totalRounds}
          </div>
          <div className="room-info-game-rule">
            <span className="room-info-game-rule-title">Timer duration</span> {roomData.gameRules.timerDuration}
            {"s"}
          </div>
          <div className="room-info-game-rule">
            <span className="room-info-game-rule-title">Cooldown duration</span> {roomData.gameRules.cooldownDuration}
            {"s"}
          </div>
        </div>
        <div className="room-social">
          <PlayersList players={players} isRoomAdmin={isRoomAdmin} kickPlayer={kickPlayer} />
          <Chat />
        </div>
      </div>
      <UsersList />
    </div>
  );
}

export default Room;
