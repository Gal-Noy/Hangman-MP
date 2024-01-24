import React from "react";
import UsersList from "../components/Lobby/UsersList";
import RoomsList from "../components/Lobby/RoomsList";
// import Chat from "../components/Chat/Chat";

function Room() {
  return (
    <div className=" mb-1 w-75 d-flex flex-row">
      {/* <Chat /> */}
      <RoomsList />
      <UsersList />
    </div>
  );
}

export default Room;
