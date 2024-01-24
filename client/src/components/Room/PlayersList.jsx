import React, { useState, useEffect } from "react";
import { useWebSocketContext } from "../../WebSocketContext";

const PlayerBox = ({ player }) => {
  return (
    <div className="rounded bg-gray-400 m-1 d-flex align-items-center p-2">
      <div className="ms-2">{player.status === "ready" ? "▶" : " "}</div>
      <div className="ms-2 mb-1 fs-5">{player.name}</div>
    </div>
  );
};

function PlayersList() {
  const { lastJsonMessage } = useWebSocketContext();
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (lastJsonMessage) {
      const { type, content } = lastJsonMessage;
      if (type === "updateRoomInfo" || type === "createRoomResponse") {
        const { players } = content.data.room;
        players.sort((a, b) => {
          return a.status === "ready" ? -1 : 1;
        });
        setPlayers(players);
      }
    }
  }, [lastJsonMessage]);

  return (
    <div className="bg-gray-400 rounded w-25 ms-1 d-flex flex-column h-570">
      <div className="players-list-header rounded bg-light mt-2 mx-2">
        <p className="text-center pt-2 fs-4 fw-bold text-dark">Players</p>
      </div>
      <div className="players-list rounded bg-light m-2 flex-fill d-flex flex-column overflow-auto">
        {players.map((player, index) => (
          <div key={index} className="p-1">
            <PlayerBox player={player} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlayersList;
