import DropdownMenu from "../DropdownMenu";

function RoomGameRules(props) {
  const { roomData, modifyRoomData, setModifyRoomData, isRoomAdmin } = props;

  return (
    <div className="room-info-game-rules-container">
      <div className="room-info-game-rule">
        <span className="room-info-game-rule-title">Total Rounds</span>
        <div className="room-info-game-rule-value">
          {!isRoomAdmin ? (
            roomData.gameRules.totalRounds
          ) : (
            <DropdownMenu
              contentId={"room-info-game-rule-total-rounds-dropdown"}
              values={[1, 3, 5, 7, 10]}
              stateValue={roomData.gameRules.totalRounds}
              setFunction={(number) =>
                setModifyRoomData({
                  ...modifyRoomData,
                  newGameRules: { ...modifyRoomData.newGameRules, totalRounds: number },
                })
              }
            />
          )}
        </div>
      </div>
      <div className="room-info-game-rule">
        <span className="room-info-game-rule-title">Timer duration</span>
        <div className="room-info-game-rule-value">
          {!isRoomAdmin ? (
            roomData.gameRules.timerDuration + "s"
          ) : (
            <DropdownMenu
              contentId={"room-info-game-rule-timer-duration-dropdown"}
              values={[10, 20, 30, 40, 50, 60, 70, 80, 90]}
              stateValue={roomData.gameRules.timerDuration}
              setFunction={(number) =>
                setModifyRoomData({
                  ...modifyRoomData,
                  newGameRules: { ...modifyRoomData.newGameRules, timerDuration: number },
                })
              }
            />
          )}
        </div>
      </div>
      <div className="room-info-game-rule">
        <span className="room-info-game-rule-title">Cooldown duration</span>
        <div className="room-info-game-rule-value">
          {!isRoomAdmin ? (
            roomData.gameRules.cooldownDuration + "s"
          ) : (
            <DropdownMenu
              contentId={"room-info-game-rule-cooldown-duration-dropdown"}
              values={[1, 3, 5, 10]}
              stateValue={roomData.gameRules.cooldownDuration}
              setFunction={(number) =>
                setModifyRoomData({
                  ...modifyRoomData,
                  newGameRules: { ...modifyRoomData.newGameRules, cooldownDuration: number },
                })
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomGameRules;
