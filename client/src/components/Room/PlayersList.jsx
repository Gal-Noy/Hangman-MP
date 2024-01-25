const PlayerBox = ({ player, isRoomAdmin, kickPlayer }) => {
  return (
    <div className="d-flex justify-content-center">
      <div className="rounded bg-gray-400 m-1 d-flex p-2 w-100">
        <div className="ms-2">{player.status === "ready" ? "✔️" : " "}</div>
        <div className="ms-2 mb-1 fs-5">{player.name}</div>
        {player.isAdmin && <div className="ms-2 mb-1 fs-5">👑</div>}
      </div>
      {isRoomAdmin && !player.isAdmin && (
        <div className=" position-absolute" style={{ marginLeft: "200px", marginTop: "10px" }}>
          <button
            className="kick-from-room-btn btn btn-outline-danger fs-6"
            onClick={() => kickPlayer(player.id)}
          >
            Kick
          </button>
        </div>
      )}
    </div>
  );
};

function PlayersList({ players, isRoomAdmin, kickPlayer }) {
  return (
    <div className="bg-gray-400 rounded w-30 ms-1 d-flex flex-column h-570">
      <div className="players-list-header rounded bg-light mt-2 mx-2">
        <p className="text-center pt-2 fs-4 fw-bold text-dark">Players</p>
      </div>
      <div className="players-list rounded bg-light m-2 flex-fill d-flex flex-column overflow-auto">
        {players.map((player, index) => (
          <div key={index} className="p-1">
            <PlayerBox player={player} isRoomAdmin={isRoomAdmin} kickPlayer={kickPlayer} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlayersList;
