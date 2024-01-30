import React from "react";
import UsersList from "../components/UsersList/UsersList";
import RoomsList from "../components/Lobby/RoomsList";
import Chat from "../components/Chat/Chat";
import "../styles/Lobby.scss";

function Lobby({ lobbyState }) {
  return (
    <div className="lobby-container">
      {/* {lobbyState === "roomsList" && <RoomsList />}
      {lobbyState === "chat" && <Chat />} */}
      <UsersList />
    </div>
  );
}

export default Lobby;
