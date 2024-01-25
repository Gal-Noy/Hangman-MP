import React, { useState, useEffect } from "react";
import { useWebSocketContext } from "../../WebSocketContext";
import { setRoom } from "../../store/clientStateSlice";
import { useDispatch, useSelector } from "react-redux";

function RoomsList() {
  const { lastJsonMessage, sendJsonMessage } = useWebSocketContext();
  const [rooms, setRooms] = useState([]);
  const dispatch = useDispatch();
  const inRoom = useSelector((state) => state.clientState.clientState) !== "lobby";
  const [showCreateRoomForm, setShowCreateRoomForm] = useState(false);

  const RoomBox = ({ room }) => {
    return (
      <div className="rounded bg-gray-400 m-1 d-flex align-items-center p-2">
        <div className="ms-2 mb-1 fs-5">Name: {room.name}</div>
        <div className="ms-2 mb-1 fs-5">Status: {room.status}</div>
        <div className="ms-2 mb-1 fs-5">Players: {room.players.length}</div>
      </div>
    );
  };

  const CreateRoomBox = () => {
    const [newRoomSettings, setNewRoomSettings] = useState({ name: "", numberOfPlayers: 1, password: "" });
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
              onChange={() => setIsPrivate(!isPrivate)}
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
            onClick={() => {
              createNewRoom(newRoomSettings);
              setShowCreateRoomForm(false);
            }}
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
      type: "room",
      content: {
        action: "list",
        data: {},
      },
    });
  }, []);

  useEffect(() => {
    if (lastJsonMessage && !inRoom) {
      const { type, content } = lastJsonMessage;
      const { success, data } = content;
      switch (type) {
        case "updateRoomsList":
          const { rooms } = data;
          setRooms(rooms);
          break;
        case "createRoomResponse":
          if (success) {
            joinCreatedRoom(data.room);
          }
          break;
        case "joinRoomResponse":
          const { room } = data;
          dispatch(setRoom(room));
          break;
        default:
          break;
      }
    }
  }, [lastJsonMessage]);

  const createNewRoom = (newRoomSettings) => {
    sendJsonMessage({
      type: "room",
      content: {
        action: "create",
        data: newRoomSettings,
      },
    });
  };

  const joinCreatedRoom = (room) => {
    dispatch(setRoom(room));
  };

  const joinExistingRoom = (roomId) => () => {
    sendJsonMessage({
      type: "room",
      content: {
        action: "join",
        data: { roomId },
      },
    });
  };

  return (
    <div className="bg-gray-400 rounded w-50 ms-1 d-flex flex-column h-570">
      <div className="rooms-list-header rounded bg-light mt-2 mx-2">
        <p className="text-center pt-2 fs-4 fw-bold text-dark">Rooms</p>
      </div>
      <div className="rooms-list rounded bg-light m-2 flex-fill d-flex flex-column overflow-auto">
        {rooms.map((room) => (
          <div key={room.id} className="p-1" type="button" id="join-room" onClick={joinExistingRoom(room.id)}>
            <RoomBox room={room} showCreateRoomForm={showCreateRoomForm} />
          </div>
        ))}
        {!showCreateRoomForm && (
          <div
            className="rounded bg-gray-500 m-2 d-flex align-items-center p-2 fs-5"
            type="button"
            id="create-room-btn"
            onClick={() => setShowCreateRoomForm(true)}
          >
            Create a new room
          </div>
        )}
        {showCreateRoomForm && <CreateRoomBox />}
      </div>
    </div>
  );
}

export default RoomsList;
