import React from "react";
import LobbyUsersList from "../components/Lobby/LobbyUsersList";
import RoomsList from "../components/Lobby/RoomsList";
import Chat from "../components/Chat/Chat";
import "../styles/Lobby.scss";

function Lobby({lobbyState}) {

  return (
    <div className="lobby-container">
      {/* {lobbyState === "roomsList" && <RoomsList />}
      {lobbyState === "chat" && <Chat />} */}
      <LobbyUsersList />
    </div>
  );
}

export default Lobby;
