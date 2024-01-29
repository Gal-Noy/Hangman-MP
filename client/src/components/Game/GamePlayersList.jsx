const PlayerBox = ({ player }) => {
  return (
    <div className="d-flex justify-content-center">
      <div className="rounded bg-gray-400 m-1 d-flex p-2 w-100">
        <div className="ms-2 mb-1 fs-5">{player.name}</div>
      </div>
    </div>
  );
};

function PlayersList({ players }) {
  return (
    <div className="bg-gray-400 rounded w-30 d-flex flex-column h-400">
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
