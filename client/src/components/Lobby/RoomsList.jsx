import React, { useState, useEffect } from "react";
import { useWebSocketContext } from "../../WebSocketContext";

const RoomBox = ({ room }) => {
  return (
    <div className="rounded bg-gray-400 m-1 d-flex align-items-center p-2">
      <div className="ms-2 mb-1 fs-5">{room.name}</div>
    </div>
  );
};

function RoomsList() {
  const { lastMessage, handleReceivedMessage, sendJsonMessage } = useWebSocketContext();
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    handleReceivedMessage(
      lastMessage,
      "updateRoomsList",
      (content) => {
        const { rooms } = content.data;

        setRooms(rooms);
      },
      () => {}
    );
  }, [lastMessage]);

  useEffect(() => {
    sendJsonMessage({
      type: "room",
      content: {
        action: "list",
      },
    });
  }, []);

  const createNewRoom = () => {
    sendJsonMessage({
      type: "room",
      content: {
        action: "create",
        data: { name: "test" },
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
          <div key={room.id} className="p-1">
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
