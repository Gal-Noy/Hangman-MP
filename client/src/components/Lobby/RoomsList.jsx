import React, { useState, useEffect, useRef } from "react";
import { useWebSocketContext } from "../../WebSocketContext";
import { setKickedFromRoom, setRoom } from "../../store/clientStateSlice";
import { useDispatch, useSelector } from "react-redux";
import { DropdownMenu } from "../../utils/utils";
import "../../styles/RoomsList.scss";

function RoomsList() {
  const { lastJsonMessage, sendJsonMessage } = useWebSocketContext();
  const dispatch = useDispatch();
  const { kickedFromRoom, clientState } = useSelector((state) => state.clientState);
  const inRoom = clientState !== "lobby";
  const [rooms, setRooms] = useState([]);
  const [createRoomError, setCreateRoomError] = useState("");
  const [joinRoomError, setJoinRoomError] = useState({ roomId: null, message: "" });
  const [invitation, setInvitation] = useState(null);

  const RoomBox = ({ room, joinRoomError, joinExistingRoom }) => {
    const [passwordForJoin, setPasswordForJoin] = useState("");

    return (
      <div className="room-box-container">
        <div className="room-box">
          <div className="room-box-room-details">
            <div className="room-box-name">{room.name}</div>
            {room.status === "waiting" && (
              <div className="room-box-status" id="room-status-waiting">
                WAITING
              </div>
            )}
            {room.status === "playing" && (
              <div className="room-box-status" id="room-status-playing">
                PLAYING
              </div>
            )}
            <div className="room-box-players">
              <span className="material-symbols-outlined">person</span>
              {room.players.length}&nbsp;/&nbsp;{room.numberOfPlayers}
            </div>
          </div>

          <div className="room-box-game-details">
            <div className="room-box-game-details-rule">
              <span>Total rounds:&nbsp;</span>
              <span className="room-box-game-details-rule-value">{room.gameRules.totalRounds}</span>
            </div>
            <div className="room-box-game-details-rule">
              <span>
                Timer duration {"("}in seconds{")"}:&nbsp;
              </span>
              <span className="room-box-game-details-rule-value">{room.gameRules.timerDuration}</span>
            </div>
            <div className="room-box-game-details-rule">
              <span>
                Cooldown duration {"("}in seconds{")"}:&nbsp;
              </span>
              <span className="room-box-game-details-rule-value">{room.gameRules.cooldownDuration}</span>
            </div>
          </div>

          <div className="room-box-join-details">
            {room.isPrivate && (
              <input
                className="room-box-join-input-password"
                type="text"
                placeholder="Password"
                value={passwordForJoin}
                onChange={(e) => setPasswordForJoin(e.target.value)}
              />
            )}
            <div
              className="room-box-join-btn"
              type="button"
              onClick={() => {
                setJoinRoomError({ roomId: null, message: "" });
                joinExistingRoom(room, passwordForJoin);
              }}
            >
              JOIN
            </div>
          </div>
        </div>
        {joinRoomError?.roomId === room.id && (
          <div className="rooms-list-alert" id="join-room-error">
            {joinRoomError.message}
          </div>
        )}
      </div>
    );
  };

  const CreateRoomBox = () => {
    const [showCreateRoomForm, setShowCreateRoomForm] = useState(false);
    const [newRoomSettings, setNewRoomSettings] = useState({
      name: `${JSON.parse(localStorage.getItem("user")).name.toUpperCase()}'s game`,
      numberOfPlayers: 2,
      password: "",
      isPrivate: false,
    });
    const [isPrivate, setIsPrivate] = useState(!!newRoomSettings.password || false);
    const [showGameRules, setShowGameRules] = useState(false);
    const [gameRules, setGameRules] = useState({
      totalRounds: 5,
      timerDuration: 60,
      cooldownDuration: 3,
    });

    return (
      <div className={`create-room-box${showCreateRoomForm ? " active" : ""}`}>
        {!showCreateRoomForm && (
          <div className="create-room-box-btn" type="button" onClick={() => setShowCreateRoomForm(true)}>
            CREATE ROOM
          </div>
        )}
        {showCreateRoomForm && (
          <div className="create-room-box-form">
            <div className="create-room-box-form-details" id="create-room-box-room-details">
              <input
                className="create-room-input-name"
                type="text"
                placeholder="Room name"
                value={newRoomSettings.name}
                onChange={(e) => setNewRoomSettings({ ...newRoomSettings, name: e.target.value })}
              />
              <div className="create-room-box-number-of-players">
                <span>Number of players:&nbsp;</span>
                <DropdownMenu
                  contentId="create-room-box-number-of-players-dropdown"
                  values={[1, 2, 3, 4]}
                  stateValue={newRoomSettings.numberOfPlayers}
                  setFunction={(number) => setNewRoomSettings({ ...newRoomSettings, numberOfPlayers: number })}
                />
              </div>
              <div className="create-room-box-privacy">
                <div className="create-room-box-privacy-check">
                  <span>Private:&nbsp;</span>
                  <input
                    className="create-room-privacy-checkbox"
                    type="checkbox"
                    checked={isPrivate}
                    onChange={() => {
                      setIsPrivate(!isPrivate);
                      setNewRoomSettings({ ...newRoomSettings, isPrivate: !isPrivate });
                    }}
                  />
                </div>
                <input
                  className={`create-room-input-password${!isPrivate ? " disabled" : ""}`}
                  type="text"
                  placeholder="Password"
                  value={newRoomSettings.password}
                  onChange={(e) => setNewRoomSettings({ ...newRoomSettings, password: e.target.value })}
                />
              </div>
            </div>
            <div className="create-room-box-form-details" id="create-room-box-game-details">
              <div className="create-room-box-modify-game">
                <span className="create-room-box-modify-game-header">Modify game rules?&nbsp;</span>
                <input
                  className="create-room-box-modify-game-checkbox"
                  type="checkbox"
                  onChange={() => {
                    setShowGameRules(!showGameRules);
                  }}
                />
              </div>
              {showGameRules && (
                <div className="create-room-box-game-rules">
                  <div className="create-room-box-game-rules-rule">
                    <span>Total rounds:&nbsp;</span>
                    <DropdownMenu
                      contentId="create-room-box-game-rules-total-rounds-dropdown"
                      values={[1, 3, 5, 7, 10]}
                      stateValue={gameRules.totalRounds}
                      setFunction={(number) => setGameRules({ ...gameRules, totalRounds: number })}
                    />
                  </div>
                  <div className="create-room-box-game-rules-rule">
                    <span>
                      Timer duration {"("}in seconds{")"}:&nbsp;
                    </span>
                    <DropdownMenu
                      contentId="create-room-box-game-rules-timer-duration-dropdown"
                      values={[10, 20, 30, 40, 50, 60, 70, 80, 90]}
                      stateValue={gameRules.timerDuration}
                      setFunction={(number) => setGameRules({ ...gameRules, timerDuration: number })}
                    />
                  </div>
                  <div className="create-room-box-game-rules-rule">
                    <span>
                      Cooldown duration {"("}in seconds{")"}:&nbsp;
                    </span>
                    <DropdownMenu
                      contentId="create-room-box-game-rules-cooldown-duration-dropdown"
                      values={[1, 3, 5, 10]}
                      stateValue={gameRules.cooldownDuration}
                      setFunction={(number) => setGameRules({ ...gameRules, cooldownDuration: number })}
                    />
                  </div>
                </div>
              )}
              <div className="create-room-box-buttons">
                <div className="create-room-box-buttons-btn" type="button" onClick={() => setShowCreateRoomForm(false)}>
                  CANCEL
                </div>
                <div
                  className="create-room-box-buttons-btn"
                  type="button"
                  onClick={() => {
                    setCreateRoomError("");
                    createNewRoom({ ...newRoomSettings, gameRules });
                  }}
                >
                  CREATE
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    sendJsonMessage({
      type: "rooms",
      content: {
        action: "list",
        data: {},
      },
    });

    setJoinRoomError({ roomId: null, message: "" });
    setCreateRoomError("");
  }, []);

  useEffect(() => {
    if (lastJsonMessage && !inRoom) {
      const { type, content } = lastJsonMessage;
      const { success, message, data } = content;
      switch (type) {
        case "updateRoomsList":
          const { rooms } = data;
          setRooms(rooms);
          break;
        case "createRoomResponse":
          if (success) {
            joinCreatedRoom(data.room);
          } else {
            setCreateRoomError(message);
          }
          break;
        case "joinRoomResponse":
          const { room } = data;
          if (success) {
            dispatch(setRoom(room));
          } else {
            setJoinRoomError({ roomId: room.id, message });
          }
          break;
        case "inviteToRoom":
          const { inviter, room: invitedRoom, password } = data;
          setInvitation({ inviter, invitedRoom, password });
          break;
        default:
          break;
      }
    }
  }, [lastJsonMessage]);

  const createNewRoom = (newRoomSettings) => {
    const { isPrivate, password } = newRoomSettings;
    if (isPrivate && password.length < 4) {
      setCreateRoomError("Password must be at least 4 characters");
      return;
    }
    sendJsonMessage({
      type: "rooms",
      content: {
        action: "create",
        data: newRoomSettings,
      },
    });
  };

  const joinCreatedRoom = (room) => {
    dispatch(setRoom(room));
  };

  const joinExistingRoom = (room, password) => {
    const { isPrivate, id, numberOfPlayers } = room;
    if (isPrivate && !password) {
      setJoinRoomError({ roomId: id, message: "This room is private" });
      return;
    }
    if (numberOfPlayers === room.players.length) {
      setJoinRoomError({ roomId: id, message: "This room is full" });
      return;
    }
    sendJsonMessage({
      type: "rooms",
      content: {
        action: "join",
        data: { roomId: id, password },
      },
    });
  };

  return (
    <div className="rooms-list-container">
      <CreateRoomBox />
      <div className="rooms-list-alerts">
        {createRoomError && (
          <div className="rooms-list-alert" id="create-room-error">
            {createRoomError}
          </div>
        )}
        {kickedFromRoom && (
          <div className="rooms-list-alert">
            <span>You have been kicked from {kickedFromRoom} by room's admin!</span>
            <span
              className="material-symbols-outlined"
              id="kick-from-room-error-cancel"
              onClick={() => dispatch(setKickedFromRoom(""))}
            >
              cancel
            </span>
          </div>
        )}
        {invitation && (
          <div className="rooms-list-alert" id="room-invitation-alert">
            <span>
              {invitation.inviter.toUpperCase()} invited you to join {invitation.invitedRoom.name}!
            </span>
            <span
              className="material-symbols-outlined"
              id="invitation-alert-cancel"
              onClick={() => setInvitation(null)}
            >
              cancel
            </span>
            <span
              className="material-symbols-outlined"
              id="invitation-alert-accept"
              onClick={() => {
                const { invitedRoom, password } = invitation;
                joinExistingRoom(invitedRoom, password);
                setInvitation(null);
              }}
            >
              check_circle
            </span>
          </div>
        )}
      </div>
      <div className="rooms-list">
        {rooms.map((room) => (
          <RoomBox key={room.id} room={room} joinRoomError={joinRoomError} joinExistingRoom={joinExistingRoom} />
        ))}
      </div>
    </div>
  );
}

export default RoomsList;
