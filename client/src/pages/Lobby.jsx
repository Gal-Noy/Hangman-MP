import React from "react";
import UsersList from "../components/Lobby/UsersList";
import RoomsList from "../components/Lobby/RoomsList";
// import Chat from "../components/Chat/Chat";

function Lobby() {
  return (
    <div className=" mb-1 w-75 d-flex flex-row">
      {/* <Chat /> */}
      <RoomsList />
      <UsersList />
    </div>
  );
}

export default Lobby;
