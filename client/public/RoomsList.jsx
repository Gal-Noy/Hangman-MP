import React, { useState, useEffect } from "react";
import { useWebSocketContext } from "../../WebSocketContext";
import { setRoom } from "../../store/clientStateSlice";
import { useDispatch, useSelector } from "react-redux";

const RoomBox = ({ room }) => {
  return (
    <div className="rounded bg-gray-400 m-1 d-flex align-items-center p-2">
      <div className="ms-2 mb-1 fs-5">Name: {room.name}</div>
      <div className="ms-2 mb-1 fs-5">Status: {room.status}</div>
      <div className="ms-2 mb-1 fs-5">Players: {room.players.length}</div>
    </div>
  );
};

function RoomsList() {
  const { lastJsonMessage, sendJsonMessage } = useWebSocketContext();
  const [rooms, setRooms] = useState([]);
  const dispatch = useDispatch();
  const inRoom = useSelector((state) => state.clientState.clientState) !== "lobby";

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
      const { success, data } = content;
      switch (type) {
        case "updateRoomsList":
          setRooms(data.rooms);
          break;
        case "createRoomResponse":
          if (success) {
            joinCreatedRoom(data.room);
          }
          break;
        case "joinRoomResponse":
          dispatch(setRoom(data.room));
          break;
        default:
          break;
      }
    }
  }, [lastJsonMessage]);

  const createNewRoom = () => {
    sendJsonMessage({
      type: "rooms",
      content: {
        action: "create",
        data: { name: "test" },
      },
    });
  };

  const joinCreatedRoom = (room) => {
    dispatch(setRoom(room));
  };

  const joinExistingRoom = (roomId) => () => {
    sendJsonMessage({
      type: "rooms",
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
            <RoomBox room={room} />
          </div>
        ))}
        <div
          className="rounded bg-gray-500 m-2 d-flex align-items-center p-2 fs-5"
          type="button"
          id="create-room-btn"
          onClick={createNewRoom}
        >
          Create a new room
        </div>
      </div>
    </div>
  );
}

export default RoomsList;
