import React, { useState, useEffect } from "react";
import UsersList from "../components/UsersList/UsersList";
import PlayersList from "../components/Room/PlayersList";
import { useWebSocketContext } from "../WebSocketContext";
import { useDispatch, useSelector } from "react-redux";
import { setRoom, setLobby, setKickedFromRoom } from "../store/clientStateSlice";
import Chat from "../components/Chat/Chat";
import "../styles/Room.scss";
import { sortPlayersList, DropdownMenu } from "../utils/utils";

// TODO: can change room's name, password and participants

function Room() {
  const { lastJsonMessage, sendJsonMessage } = useWebSocketContext();
  const [players, setPlayers] = useState([]);
  const { roomData } = useSelector((state) => state.clientState);
  const [newGameRules, setNewGameRules] = useState(roomData.gameRules);
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

  useEffect(() => {
    sendJsonMessage({
      type: "rooms",
      content: {
        action: "modify",
        data: {
          newGameRules,
        },
      },
    });
  }, [newGameRules]);

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
            <span className="room-info-game-rule-title">Total Rounds</span>
            <div className="room-info-game-rule-value">
              {!isRoomAdmin ? (
                roomData.gameRules.totalRounds
              ) : (
                <DropdownMenu
                  contentId={"room-info-game-rule-total-rounds-dropdown"}
                  values={[1, 3, 5, 7, 10]}
                  stateValue={newGameRules.totalRounds}
                  setFunction={(number) => setNewGameRules({ ...newGameRules, totalRounds: number })}
                />
              )}
            </div>
          </div>
          <div className="room-info-game-rule">
            <span className="room-info-game-rule-title">Timer duration</span>
            <div className="room-info-game-rule-value">
              {!isRoomAdmin ? (
                roomData.gameRules.timerDuration + "s"
              ) : (
                <DropdownMenu
                  contentId={"room-info-game-rule-timer-duration-dropdown"}
                  values={[10, 20, 30, 40, 50, 60, 70, 80, 90]}
                  stateValue={newGameRules.timerDuration}
                  setFunction={(number) => setNewGameRules({ ...newGameRules, timerDuration: number })}
                />
              )}
            </div>
          </div>
          <div className="room-info-game-rule">
            <span className="room-info-game-rule-title">Cooldown duration</span>
            <div className="room-info-game-rule-value">
              {!isRoomAdmin ? (
                roomData.gameRules.cooldownDuration + "s"
              ) : (
                <DropdownMenu
                  contentId={"room-info-game-rule-cooldown-duration-dropdown"}
                  values={[1, 3, 5, 10]}
                  stateValue={newGameRules.cooldownDuration}
                  setFunction={(number) => setNewGameRules({ ...newGameRules, cooldownDuration: number })}
                />
              )}
            </div>
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
