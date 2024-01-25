import React, { useEffect } from "react";
import UsersList from "../components/Lobby/LobbyUsersList";
import PlayersList from "../components/Room/PlayersList";

// import Chat from "../components/Chat/Chat";

function Room() {

  return (
    <div className=" mb-1 w-75 d-flex flex-row">
      {/* <Chat /> */}
      {/* <RoomsList /> */}
      <PlayersList />
      <UsersList />
    </div>
  );
}

export default Room;
