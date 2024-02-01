import React, { useState, useEffect } from "react";
import { useWebSocketContext } from "../../WebSocketContext";
import { setKickedFromRoom, setRoom } from "../../store/clientStateSlice";
import { useDispatch, useSelector } from "react-redux";
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
    const [showInputPassword, setShowInputPassword] = useState(false);
    const [passwordForJoin, setPasswordForJoin] = useState("");

    return (
      <div>
        <div
          className="rounded bg-gray-500 m-1 d-flex align-items-center p-2"
          type="button"
          id="join-room"
          onClick={() => {
            if (room.isPrivate) {
              setShowInputPassword(true);
            } else {
              joinExistingRoom(room, null);
            }
          }}
        >
          <div className="ms-2 mb-1 fs-5">{room.name}</div>
          <div className="ms-3 mb-1 fs-5">
            👤{room.players.length}/{room.numberOfPlayers}
          </div>
          <div className="ms-1 mb-1 fs-5">{room.status === "waiting" ? "🕑" : "🔴"}</div>
          {room.isPrivate && !showInputPassword && <div className="ms-3 mb-1 fs-5">🔒</div>}
          {showInputPassword && (
            <div className="d-flex">
              <div className="ms-3 mb-1 fs-5">🔐</div>
              <div className="input-group ms-1">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Password"
                  aria-label="Password"
                  aria-describedby="basic-addon1"
                  value={passwordForJoin}
                  onChange={(e) => setPasswordForJoin(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  type="button"
                  id="input-password-btn"
                  onClick={() => {
                    setJoinRoomError("");
                    joinExistingRoom(room, passwordForJoin);
                  }}
                >
                  Join
                </button>
              </div>
            </div>
          )}
        </div>
        {joinRoomError.roomId && joinRoomError.roomId === room.id && (
          <div className="alert alert-danger text-danger m-1">{joinRoomError.message}</div>
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
      wrongAttempts: 5,
    });

    const DropdownMenu = ({ contentId, values, setFunction }) => {
      <div className="create-room-box-dropdown">
        <button
          className="create-room-box-dropdown-btn"
          onMouseEnter={() => document.getElementById({ contentId }).classList.remove("hide")}
        >
          {gameRules.totalRounds}
        </button>
        <div className="create-room-box-dropdown-content" id={contentId}>
          {values.map((value) => (
            <a
              key={value}
              className="create-room-box-dropdown-item"
              type="button"
              onClick={() => {
                setFunction(value);
                document.getElementById({ contentId }).classList.add("hide");
              }}
            >
              {value}
            </a>
          ))}
        </div>
      </div>;
    };

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
                <span>Modify game rules?&nbsp;</span>
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
                      setFunction={(number) => setGameRules({ ...gameRules, cooldownDuration: number })}
                    />
                  </div>
                </div>
              )}
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
      {/* <div className="rooms-list">
        {rooms.map((room) => (
          <RoomBox key={room.id} room={room} joinRoomError={joinRoomError} joinExistingRoom={joinExistingRoom} />
        ))}
      </div> */}
      <CreateRoomBox />
    </div>
  );
}

export default RoomsList;
