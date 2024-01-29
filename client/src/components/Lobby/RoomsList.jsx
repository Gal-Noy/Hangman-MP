import React, { useState, useEffect } from "react";
import { useWebSocketContext } from "../../WebSocketContext";
import { setKickedFromRoom, setRoom } from "../../store/clientStateSlice";
import { useDispatch, useSelector } from "react-redux";

function RoomsList() {
  const { lastJsonMessage, sendJsonMessage } = useWebSocketContext();
  const [rooms, setRooms] = useState([]);
  const dispatch = useDispatch();
  const inRoom = useSelector((state) => state.clientState.clientState) !== "lobby";
  const kickedFromRoom = useSelector((state) => state.clientState.kickedFromRoom);
  const [showCreateRoomForm, setShowCreateRoomForm] = useState(false);
  const [error, setError] = useState(null);
  const [invitation, setInvitation] = useState(null);

  const RoomBox = ({ room, error, joinExistingRoom }) => {
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
                    setError(null);
                    joinExistingRoom(room, passwordForJoin);
                  }}
                >
                  Join
                </button>
              </div>
            </div>
          )}
        </div>
        {error && error.type === "join" && error.roomId === room.id && (
          <div className="alert alert-danger text-danger m-1">{error.message}</div>
        )}
      </div>
    );
  };

  const CreateRoomBox = () => {
    const [newRoomSettings, setNewRoomSettings] = useState({
      name: `${JSON.parse(localStorage.getItem("user")).name}'s game`,
      numberOfPlayers: 2,
      password: "",
      isPrivate: false,
    });
    const [isPrivate, setIsPrivate] = useState(!!newRoomSettings.password || false);

    return (
      <div className="rounded bg-gray-500 m-2 d-flex flex-column p-2 fs-5" type="button" id="create-room-form">
        <div className="d-flex">
          <input
            type="text"
            className="form-control w-70 me-1 mb-1"
            placeholder="Room name"
            aria-label="Room name"
            aria-describedby="basic-addon1"
            value={newRoomSettings.name}
            onChange={(e) => setNewRoomSettings({ ...newRoomSettings, name: e.target.value })}
          />
          <div className="number-of-players-select d-flex">
            <div className="fs-6 mt-2 mx-2">Players</div>
            <div className="dropdown">
              <button
                className="btn btn-light dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {newRoomSettings.numberOfPlayers}
              </button>
              <ul className="dropdown-menu">
                {[1, 2, 3, 4].map((number) => (
                  <li key={number}>
                    <button
                      className="dropdown-item"
                      type="button"
                      onClick={() => setNewRoomSettings({ ...newRoomSettings, numberOfPlayers: number })}
                    >
                      {number}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="d-flex mt-2">
          <div className="form-check form-switch">
            <input
              className="form-check-input mt-1"
              type="checkbox"
              id="flexSwitchCheckDefault"
              onChange={() => {
                setIsPrivate(!isPrivate);
                setNewRoomSettings({ ...newRoomSettings, isPrivate: !isPrivate });
              }}
            />
            <label className="form-check-label mb-1" htmlFor="flexSwitchCheckDefault">
              Private
            </label>
          </div>
          {isPrivate && (
            <input
              type="text"
              className="form-control w-70 ms-3"
              placeholder="Password"
              aria-label="Password"
              aria-describedby="basic-addon1"
              value={newRoomSettings.password}
              onChange={(e) => setNewRoomSettings({ ...newRoomSettings, password: e.target.value })}
            />
          )}
        </div>
        <div className="create-room-form-btns d-flex">
          <button
            className="btn btn-primary mt-2 w-70"
            type="button"
            id="create-room-btn"
            onClick={() => createNewRoom(newRoomSettings)}
          >
            Create
          </button>
          <button
            className="btn btn-secondary mt-2 ms-2 w-30"
            type="button"
            id="cancel-create-room-btn"
            onClick={() => setShowCreateRoomForm(false)}
          >
            Cancel
          </button>
        </div>
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
    setTimeout(() => {
      setError(null);
    }, 3000);
  }, [error]);

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
            setError({ type: "create", message });
          }
          break;
        case "joinRoomResponse":
          const { room } = data;
          if (success) {
            dispatch(setRoom(room));
          } else {
            setError({ type: "join", roomId: room.id, message });
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
      setError({ type: "create", message: "Password must be at least 4 characters long" });
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
      setError({ type: "join", roomId: id, message: "Please enter the password to join this room" });
      return;
    }
    if (numberOfPlayers === room.players.length) {
      setError({ type: "join", roomId: id, message: "This room is full" });
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
    <div className="bg-gray-400 rounded w-40 d-flex flex-column h-570">
      <div className="rooms-list-header rounded bg-light mt-2 mx-2">
        <p className="text-center pt-2 fs-4 fw-bold text-dark">Rooms</p>
      </div>
      <div className="rooms-list rounded bg-light m-2 flex-fill d-flex flex-column overflow-auto">
        {invitation && (
          <div className="rounded bg-success m-2 d-flex align-items-center p-2 text-white">
            <div className="ms-2 mb-1 fs-5">
              <strong>{invitation.inviter}</strong> invited you to join <strong>{invitation.invitedRoom.name}</strong>!
            </div>
            <div
              className="ms-3 mb-1 fs-5"
              type="button"
              id="invite-user-to-room"
              onClick={() => {
                const { invitedRoom, password } = invitation;
                joinExistingRoom(invitedRoom, password);
                setInvitation(null);
              }}
            >
              ✔️
            </div>
            <div className="ms-3 mb-1 fs-5" type="button" id="invite-user-to-room" onClick={() => setInvitation(null)}>
              ❌
            </div>
          </div>
        )}
        {kickedFromRoom !== "" && (
          <div className="rounded bg-danger m-2 d-flex align-items-center p-2 text-white">
            <div className="ms-2 mb-1 fs-5">
              You have been kicked from <strong>{kickedFromRoom}</strong> by room's admin!
            </div>
            <div
              className="ms-3 mb-1 fs-5"
              type="button"
              id="invite-user-to-room"
              onClick={() => dispatch(setKickedFromRoom(""))}
            >
              ⨉
            </div>
          </div>
        )}
        {rooms.map((room) => (
          <div key={room.id} className="p-1">
            <RoomBox room={room} error={error} joinExistingRoom={joinExistingRoom} />
          </div>
        ))}
        {!showCreateRoomForm && (
          <div
            className="rounded bg-gray-400 m-2 d-flex align-items-center p-2 fs-5"
            type="button"
            id="create-room-btn"
            onClick={() => setShowCreateRoomForm(true)}
          >
            Create a new room
          </div>
        )}
        {showCreateRoomForm && <CreateRoomBox />}
        {error && error.type === "create" && <div className="alert alert-danger text-danger m-1">{error.message}</div>}
      </div>
    </div>
  );
}

export default RoomsList;
