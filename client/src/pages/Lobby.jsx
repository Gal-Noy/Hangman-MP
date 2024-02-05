import React from "react";
import UsersList from "../components/UsersList";
import RoomsList from "../components/RoomsList";
import Chat from "../components/Chat/Chat";
import "../styles/Lobby.css";

function Lobby({ lobbyState }) {
  return (
    <div className="lobby-container">
      {lobbyState === "roomsList" && <RoomsList />}
      {lobbyState === "chat" && <Chat />}
      <UsersList />
    </div>
  );
}

export default Lobby;
