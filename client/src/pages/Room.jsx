import { useState, useEffect } from "react";
import UsersList from "../components/UsersList";
import PlayersList from "../components/PlayersList";
import DropdownMenu from "../components/DropdownMenu";
import { useWebSocketContext } from "../WebSocketContext";
import { useDispatch, useSelector } from "react-redux";
import { setRoom, setLobby, setKickedFromRoom } from "../store/clientStateSlice";
import Chat from "../components/Chat/Chat";
import { sortPlayersList } from "../utils/utils";
import "../styles/Room.css";

function Room() {
  const dispatch = useDispatch();
  const { roomData } = useSelector((state) => state.clientState);
  const isRoomAdmin = JSON.parse(localStorage.getItem("user"))._id === roomData.admin.id;
  const { lastJsonMessage, sendJsonMessage } = useWebSocketContext();
  const [players, setPlayers] = useState([]);
  const [modifyRoomData, setModifyRoomData] = useState({
    newGameRules: {
      totalRounds: null,
      timerDuration: null,
      cooldownDuration: null,
    },
    newName: "",
    newNumberOfPlayers: null,
    newPassword: "",
    isPrivate: null,
  });
  const [showChangeName, setShowChangeName] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPasswordLengthError, setShowPasswordLengthError] = useState(false);

  useEffect(() => {
    if (!players && roomData) {
      const players = [...roomData.players];
      const sortedPlayers = sortPlayersList(players);
      setPlayers(sortedPlayers);
    }
  }, []);

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
        dispatch(setLobby(room));

        dispatch(setKickedFromRoom(room.name));
        setTimeout(() => {
          dispatch(setKickedFromRoom(""));
        }, 10000);
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (
      modifyRoomData.newGameRules.totalRounds ||
      modifyRoomData.newGameRules.timerDuration ||
      modifyRoomData.newGameRules.cooldownDuration ||
      modifyRoomData.newNumberOfPlayers
    ) {
      modifyRoom();
    }
  }, [modifyRoomData.newGameRules, modifyRoomData.newNumberOfPlayers]);

  const clearModifyRoomData = () => {
    setModifyRoomData({
      newGameRules: {
        totalRounds: null,
        timerDuration: null,
        cooldownDuration: null,
      },
      newName: "",
      newNumberOfPlayers: null,
      newPassword: "",
      isPrivate: null,
    });
  };

  const modifyRoom = () => {
    if (modifyRoomData.newPassword && modifyRoomData.newPassword.length < 4) {
      setShowPasswordLengthError(true);
      setTimeout(() => {
        setShowPasswordLengthError(false);
      }, 3000);
    } else {
      console.log(modifyRoomData);
      sendJsonMessage({
        type: "rooms",
        content: {
          action: "modify",
          data: modifyRoomData,
        },
      });
    }
    clearModifyRoomData();
  };

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
                <span className="room-name-value">{roomData.name}</span>
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
                  value={modifyRoomData.newName || roomData.name}
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
            {!isRoomAdmin ? (
              <div className="room-info-room-privacy-container">
                {!roomData.isPrivate && <span className="room-privacy-title">PUBLIC</span>}
                {roomData.isPrivate && (
                  <div className="room-info-room-privacy">
                    <span className="room-privacy-title">PASSWORD:</span>
                    <span className="room-password-value">{roomData.password}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="room-info-room-privacy-container">
                {!showChangePassword && (
                  <div className="room-info-room-privacy">
                    <span className="room-privacy-title">{roomData.isPrivate ? "PASSWORD: " : "PUBLIC "}</span>
                    <span className="room-password-value">{roomData.isPrivate ? roomData.password : ""}</span>
                    <span
                      className="material-symbols-outlined room-info-room-password-edit-button"
                      onClick={() => {
                        setShowChangePassword(true);
                        setShowPasswordLengthError(false);
                      }}
                    >
                      edit
                    </span>
                    {roomData.isPrivate && (
                      <span
                        className="material-symbols-outlined room-info-room-public-button"
                        onClick={() => {
                          setModifyRoomData({
                            ...modifyRoomData,
                            newPassword: "",
                            isPrivate: false,
                          });
                          modifyRoom();
                        }}
                      >
                        close
                      </span>
                    )}
                    {showPasswordLengthError && <span className="room-password-length-error">Min 4 letters.</span>}
                  </div>
                )}
                {showChangePassword && (
                  <div className="room-info-room-privacy">
                    <span className="room-privacy-title">PASSWORD:</span>
                    <input
                      className="room-info-room-password-change-password-input"
                      type="text"
                      value={modifyRoomData.newPassword || roomData.password}
                      onChange={(e) => {
                        setModifyRoomData({
                          ...modifyRoomData,
                          newPassword: e.target.value,
                          isPrivate: true,
                        });
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
                )}
              </div>
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
                    stateValue={roomData.gameRules.totalRounds}
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
                    stateValue={roomData.gameRules.timerDuration}
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
                    stateValue={roomData.gameRules.cooldownDuration}
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
