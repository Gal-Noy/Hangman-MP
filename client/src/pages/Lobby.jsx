import React from "react";
import LobbyUsersList from "../components/Lobby/LobbyUsersList";
import RoomsList from "../components/Lobby/RoomsList";
// import Chat from "../components/Chat/Chat";

function Lobby() {
  return (
    <div className=" mb-1 w-75 d-flex flex-row">
      {/* <Chat /> */}
      <RoomsList />
      <LobbyUsersList />
    </div>
  );
}

export default Lobby;
