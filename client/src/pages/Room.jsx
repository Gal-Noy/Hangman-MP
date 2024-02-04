import React, { useState, useEffect } from "react";
import UsersList from "../components/UsersList/UsersList";
import PlayersList from "../components/Room/PlayersList";
import { useWebSocketContext } from "../WebSocketContext";
import { useDispatch, useSelector } from "react-redux";
import { setRoom, setLobby, setKickedFromRoom } from "../store/clientStateSlice";
import Chat from "../components/Chat/Chat";
import "../styles/Room.scss";
import { sortPlayersList, DropdownMenu } from "../utils/utils";

// TODO: can change room's password and participants with edit button

function Room() {
  const { lastJsonMessage, sendJsonMessage } = useWebSocketContext();
  const { roomData } = useSelector((state) => state.clientState);
  const isRoomAdmin = JSON.parse(localStorage.getItem("user"))._id === roomData.admin.id;
  const dispatch = useDispatch();
  const [players, setPlayers] = useState([]);
  const [modifyRoomData, setModifyRoomData] = useState({
    newGameRules: {
      totalRounds: roomData.gameRules.totalRounds,
      timerDuration: roomData.gameRules.timerDuration,
      cooldownDuration: roomData.gameRules.cooldownDuration,
    },
    newName: roomData.name,
    newPassword: roomData.password,
    newNumberOfPlayers: roomData.numberOfPlayers,
  });
  const [showChangeName, setShowChangeName] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

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

  const modifyRoom = () => {
    const { newGameRules, newNumberOfPlayers, newName, newPassword } = modifyRoomData;
    sendJsonMessage({
      type: "rooms",
      content: {
        action: "modify",
        data: {
          newGameRules,
          newNumberOfPlayers,
          newName,
          newPassword,
        },
      },
    });
  };

  useEffect(() => {
    modifyRoom();
  }, [modifyRoomData.newGameRules, modifyRoomData.newNumberOfPlayers]);

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
          <div className="room-info-room-details">
            {/* Name Section */}
            {!isRoomAdmin ? (
              <div className="room-info-room-name">
                <span className="room-name-value">{roomData.name}</span>
              </div>
            ) : !showChangeName ? (
              <div className="room-info-room-name">
                <span className="room-name-value">{modifyRoomData.newName}</span>
                <span
                  className="material-symbols-outlined room-info-room-name-edit-button"
                  onClick={() => setShowChangeName(true)}
                >
                  edit
                </span>
              </div>
            ) : (
              <div className="room-info-room-name">
                <input
                  className="room-info-room-name-change-name-input"
                  type="text"
                  value={modifyRoomData.newName}
                  onChange={(e) => {
                    setModifyRoomData({ ...modifyRoomData, newName: e.target.value });
                  }}
                />
                <span
                  className="material-symbols-outlined room-info-room-name-accept-button"
                  onClick={() => {
                    setShowChangeName(false);
                    modifyRoom();
                  }}
                >
                  done
                </span>
              </div>
            )}

            {/* Password Section */}
            {roomData.isPrivate && !isRoomAdmin ? (
              <div className="room-info-room-password">
                <span className="room-password-title">PASSWORD:</span>
                <span className="room-password-value">{roomData.password}</span>
              </div>
            ) : roomData.isPrivate && !showChangePassword ? (
              <div className="room-info-room-password">
                <span className="room-password-title">PASSWORD:</span>
                <span className="room-password-value">{modifyRoomData.newPassword}</span>
                <span
                  className="material-symbols-outlined room-info-room-password-edit-button"
                  onClick={() => setShowChangePassword(true)}
                >
                  edit
                </span>
              </div>
            ) : (
              roomData.isPrivate && (
                <div className="room-info-room-password">
                  <span className="room-password-title">PASSWORD:</span>
                  <input
                    className="room-info-room-password-change-password-input"
                    type="text"
                    value={modifyRoomData.newPassword}
                    onChange={(e) => {
                      setModifyRoomData({ ...modifyRoomData, newPassword: e.target.value });
                    }}
                  />
                  <span
                    className="material-symbols-outlined room-info-room-password-accept-button"
                    onClick={() => {
                      setShowChangePassword(false);
                      modifyRoom();
                    }}
                  >
                    done
                  </span>
                </div>
              )
            )}
          </div>

          <div className="room-info-game-rules-container">
            <div className="room-info-game-rule">
              <span className="room-info-game-rule-title">Total Rounds</span>
              <div className="room-info-game-rule-value">
                {!isRoomAdmin ? (
                  roomData.gameRules.totalRounds
                ) : (
                  <DropdownMenu
                    contentId={"room-info-game-rule-total-rounds-dropdown"}
                    values={[1, 3, 5, 7, 10]}
                    stateValue={modifyRoomData.newGameRules?.totalRounds}
                    setFunction={(number) =>
                      setModifyRoomData({
                        ...modifyRoomData,
                        newGameRules: { ...modifyRoomData.newGameRules, totalRounds: number },
                      })
                    }
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
                    stateValue={modifyRoomData.newGameRules.timerDuration}
                    setFunction={(number) =>
                      setModifyRoomData({
                        ...modifyRoomData,
                        newGameRules: { ...modifyRoomData.newGameRules, timerDuration: number },
                      })
                    }
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
                    stateValue={modifyRoomData.newGameRules.cooldownDuration}
                    setFunction={(number) =>
                      setModifyRoomData({
                        ...modifyRoomData,
                        newGameRules: { ...modifyRoomData.newGameRules, cooldownDuration: number },
                      })
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="room-social">
          <PlayersList
            players={players}
            isRoomAdmin={isRoomAdmin}
            kickPlayer={kickPlayer}
            modifyRoomData={modifyRoomData}
            setModifyRoomData={setModifyRoomData}
          />
          <Chat />
        </div>
      </div>
      <UsersList />
    </div>
  );
}

export default Room;
