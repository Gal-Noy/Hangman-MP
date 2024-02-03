import { b64toBlob } from "../../utils/utils";
import defaultAvatar from "../../assets/default-avatar.jpg";

const GamePlayerBox = ({ player }) => {
  const playerAvatar = !player?.avatar ? null : b64toBlob(player.avatar, "image/");

  return (
    <div className="game-player-box">
      <div className="game-player-box-avatar">
        <img
          src={!playerAvatar ? defaultAvatar : URL.createObjectURL(playerAvatar)}
          alt="avatar"
          className="game-player-box-avatar-img"
        />
      </div>
      <span className="game-player-box-player-name">{player.name.toUpperCase()}</span>
    </div>
  );
};

function GameInfo({ gameState }) {
  return (
    <div className="game-info-container">
      <div className="game-state-container">
        <div className="game-state-detail">
          <span className="game-state-label">Round</span>
          <span className="game-state-value">{gameState.round} / {gameState.totalRounds}</span>
        </div>
        <div className="game-state-detail">
          <span className="game-state-label">Score</span>
          <span className="game-state-value">{gameState.score}</span>
        </div>
        <div className="game-state-detail">
          <span className="game-state-label">Remaining Wrong Attempts</span>
          <span className="game-state-value">{gameState.remainingWrongAttempts}</span>
        </div>
      </div>
      <div className="game-players-list">
        {gameState.players.map((player, index) => (
          <GamePlayerBox key={index} player={player} />
        ))}
      </div>
    </div>
  );
}

export default GameInfo;
