import { useSelector } from "react-redux";
import { b64toBlob } from "../../utils/utils";
import defaultAvatar from "../../assets/default-avatar.jpg";

function PlayersList(props) {
  const { players, isRoomAdmin, kickPlayer, modifyRoomData, setModifyRoomData } = props;
  const numberOfPlayers = useSelector((state) => state.clientState.roomData.numberOfPlayers);

  const PlayerBox = ({ player, isRoomAdmin, kickPlayer }) => {
    const playerAvatar = !player?.avatar ? null : b64toBlob(player.avatar, "image/");

    return (
      <div className="player-box-container">
        <div className="player-box">
          <div className="player-box-player-info">
            <div className="player-box-avatar-container">
              <img
                src={!playerAvatar ? defaultAvatar : URL.createObjectURL(playerAvatar)}
                alt="avatar"
                className="player-box-avatar-img"
              />
            </div>
            <div className="player-box-player-info-details">
              <div className="player-box-player-name">{player.name.toUpperCase() + (player.isAdmin ? " 👑" : "")}</div>
              <div className="player-box-player-status">
                {player.status === "ready" ? (
                  <span id="player-box-player-status-ready">READY</span>
                ) : player.status === "idle" ? (
                  <span id="player-box-player-status-idle">NOT READY</span>
                ) : (
                  <span id="player-box-player-status-playing">PLAYING</span>
                )}
              </div>
            </div>
          </div>
          {isRoomAdmin && !player.isAdmin && (
            <span
              className="material-symbols-outlined"
              id="player-box-kick-button"
              onClick={() => kickPlayer(player.id)}
            >
              cancel
            </span>
          )}
        </div>
      </div>
    );
  };

  const EmptyPlayerBox = () => {
    return (
      <div className="player-box-container empty">
        {isRoomAdmin && (
          <span
            className="material-symbols-outlined"
            id="player-box-remove-button"
            onClick={() => setModifyRoomData({ ...modifyRoomData, newNumberOfPlayers: numberOfPlayers - 1 })}
          >
            cancel
          </span>
        )}
      </div>
    );
  };

  const AddPlayerBtn = () => {
    return (
      <div className="player-box-container add-player">
        <span
          className="material-symbols-outlined"
          id="player-box-add-button"
          onClick={() => setModifyRoomData({ ...modifyRoomData, newNumberOfPlayers: numberOfPlayers + 1 })}
        >
          add_circle
        </span>
      </div>
    );
  };

  return (
    <div className="players-list-container">
      <div className="players-list">
        {players.map((player, index) => (
          <PlayerBox key={index} player={player} isRoomAdmin={isRoomAdmin} kickPlayer={kickPlayer} />
        ))}
        {Array(numberOfPlayers - players.length)
          .fill()
          .map((_, index) => (
            <EmptyPlayerBox key={index} />
          ))}
        {numberOfPlayers < 4 && isRoomAdmin && <AddPlayerBtn />}
      </div>
    </div>
  );
}

export default PlayersList;
